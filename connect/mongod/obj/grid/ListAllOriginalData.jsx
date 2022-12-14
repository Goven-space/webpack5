import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Card, Icon, Menu, Dropdown, Popover, Button, Modal, Input, Row, Col, Tag, Radio } from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import EditDataModelData from '../../../../designer/datamodel/grid/EditViewColumnsConfig';
import ImportDataFromExcel from '../../../../designer/datamodel/form/ImportDataFromExcel';
import ReactJson from 'react-json-view'

const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LISTDATAS_URL = URI.CONNECT.MONGOD.listAllOriginalData;
const DELETE_URL = URI.CORE_DATAMODELS.DeleteModelDatasById;
const LISTCOLUMNS_URL = URI.CONNECT.MONGOD.ListObjectDatasColumns;
const COPY_URL = URI.CORE_DATAMODELS.CopyEditModelData;
const ExportModelDataToExcel = URI.CORE_DATAMODELS.ExportModelDataToExcel;

class ListAllOriginalData extends React.Component {
  constructor(props) {
    super(props);
    this.modelId = this.props.objectId;
    this.parentId = this.props.objectId;
    this.appId = this.props.appId;
    this.keyId = this.props.keyId;
    this.state = {
      pagination: { pageSize: 25, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      rowKey: this.keyId,
      loading: true,
      currentId: '',
      searchKeyWords: '',
      columns: [],
      newIdNum: 1000,
      visible: false,
    }
  }

  componentDidMount() {
    this.loadColumnsData();
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  }

  onPageChange = (pagination, filters, sorter) => {
    this.loadDataModelDatas(pagination, filters, sorter);
  }

  onActionClick = (action, record, url) => {
    if (action === "New") {
      this.insertRow();
    } else if (action === "Delete") {
      this.deleteData(record.id);
    } else if (action === "Edit") {
      this.setState({ visible: true, currentId: record.id });
    }
  }

  refresh = (e) => {
    e.preventDefault();
    this.loadColumnsData();
  }

  insertRow = () => {
    //???????????????
    let key = this.state.newIdNum + 1;
    let newRow = {};
    newRow[this.state.rowKey] = key;
    let newData = this.state.rowsData;
    newData.splice(0, 0, newRow);
    this.setState({ rowsData: newData, newIdNum: key });
  }

  //??????ajax??????????????????????????????
  loadColumnsData = (pagination = this.state.pagination, filters = {}, sorter = {}) => {
    let url = LISTCOLUMNS_URL + "?objectId=" + this.parentId;
    GridActions.loadData(this, url, pagination, filters, sorter, {}, (data) => {
      let columnsData = data.map((item, index) => {
        let title = item.colName;
        if (title !== item.colId && title!==undefined) { title = item.colName + "(" + item.colId + ")"; }else{title=item.colId;}
        let dateIndexId = item.colId;
        if (item.aliasId !== '' && item.aliasId !== undefined && item.aliasId !== null) {
          dateIndexId = item.aliasId;
        }
        return {
          title: title,
          dataIndex: dateIndexId,
          sorter: true,
          render: (text, record, index) => {
            let value = "";
            if (Object.prototype.toString.call(text) === "[object String]") {
              value = text;
            } else {
              value = JSON.stringify(text);
            }
            if (value !== undefined && value.length > 150) {
              return 'Long String';
            } else {
              return value;
            }
          },
        };
      });
      this.setState({ columns: columnsData });
      this.loadDataModelDatas(); //????????????
      // console.log(columnsData);
    });
  }

  loadDataModelDatas = (pagination = this.state.pagination, filters = {}, sorter = {}) => {
    let url = LISTDATAS_URL + "?objectId=" + this.modelId;
    if (this.state.searchKeyWords !== '') {
      url += "&condition=" + encodeURIComponent(this.state.searchKeyWords); //??????????????????
    }
    GridActions.loadData(this, url, pagination, filters, sorter, {}, (data) => {
      pagination.total = data.total; //??????
      this.setState({ rowsData: data.rows, pagination: pagination, selectedRows: [], selectedRowKeys: [] });
    });
  }

  deleteData = (argIds) => {
    let ids = argIds;
    if (ids === undefined || ids === "") { ids = this.state.selectedRowKeys.join(","); }
    //??????ajax??????????????????????????????????????????????????????
    this.setState({ loading: true });
    let postData = { "ids": ids, modelId: this.modelId };
    // console.log(postData);
    AjaxUtils.post(DELETE_URL, postData, (data) => {
      // console.log(data);
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.errorMsg);
      } else {
        AjaxUtils.showInfo("????????????(" + data.msg + ")?????????!");
        this.loadDataModelDatas();
      }
    });
  }

  copyData = () => {
    let ids = this.state.selectedRowKeys.join(",");
    //??????ajax??????????????????????????????????????????????????????
    this.setState({ loading: true });
    let postData = { "ids": ids, modelId: this.modelId };
    // console.log(postData);
    AjaxUtils.post(COPY_URL, postData, (data) => {
      // console.log(data);
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.errorMsg);
      } else {
        AjaxUtils.showInfo("????????????(" + data.msg + ")?????????!");
        this.loadDataModelDatas();
      }
    });
  }

  showConfirm = () => {
    var self = this;
    confirm({
      title: 'Are you sure delete the selected rows?',
      content: '??????:?????????????????????!',
      onOk() {
        return self.deleteData();
      },
      onCancel() { },
    });
  }

  exportExcel = (dataRange, columnsRange) => {
    let url = ExportModelDataToExcel + "?modelId=" + this.modelId + "&dataRange=" + dataRange + "&columnRange=" + columnsRange;
    GridActions.loadData(this, url, this.state.pagination, {}, {}, {}, (data) => {
      window.open(URI.baseResUrl + data.msg);
    });
  }

  handleCancel = (e) => {
    this.setState({ visible: false, });
  }

  handleMenuClick = (e) => {
    if (e.key === "1") {
      this.exportExcel("page", "page");
    } else if (e.key === "2") {
      this.exportExcel("page", "all");
    } else if (e.key === "3") {
      this.exportExcel("all", "page");
    } else if (e.key === "4") {
      this.exportExcel("all", "all");
    }
  }


  //?????????????????????
  search = (value) => {
    let pagination = this.state.pagination;
    let url = LISTDATAS_URL + "?objectId=" + this.modelId + "&condition=" + encodeURIComponent(value);
    GridActions.loadData(this, url, pagination, {}, {}, {}, (data) => {
      pagination.total = data.total; //??????
      data.rows.forEach((item, index) => {
        item.id = index;
      })
      this.setState({ rowsData: data.rows, pagination: pagination, selectedRows: [], selectedRowKeys: [], searchKeyWords: value });
    });
  }

  render() {
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
    const { rowsData, pagination, selectedRowKeys, loading, currentId } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle = { marginTop: '8px', marginBottom: '8px', }
    const expandedRow = (record) => {
      // console.log(record)
      return (
        <Card bordered={true} >
          <ReactJson src={record} displayDataTypes={false} />
        </Card>
      );
    }
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1" >??????:????????????????????????</Menu.Item>
        <Menu.Item key="2">??????:????????????????????????</Menu.Item>
        <Menu.Item key="3">??????:?????????????????????</Menu.Item>
        <Menu.Item key="4">??????:?????????????????????</Menu.Item>
      </Menu>
    );
    const content = (
      <div>
        <p>??????????????????:Filters.eq(&quot;userId&quot;,&quot;admin&quot;),??????????????????:Filters.regex(&quot;tags&quot;,&quot;100001&quot;),</p>
        <p>????????????:Filters.and(Filters.eq(&quot;userId&quot;,&quot;admin&quot;),Filters.eq(&quot;ip&quot;,&quot;127.0.0.1&quot;))</p>
      </div>
    );
    return (
      <div style={{ overflow: 'auto' }} >
        <Modal key={Math.random()} title="???Excel????????????" maskClosable={false}
          visible={this.state.visible}
          width='600px'
          footer=''
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <ImportDataFromExcel modelId={this.modelId} appId={this.appId} close={this.handleCancel} />
        </Modal>
        <Row style={{ marginBottom: 5 }} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
              <Button type="primary" onClick={this.refresh} icon="reload" loading={loading}  >??????</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
            <span style={{ float: 'right' }} >
               ??????(<Popover content={content} title="????????????filters??????">??????????????????</Popover>)???<Search
                placeholder='Filters.eq("??????ID","???")'
                style={{ width: 330 }}
                onSearch={value => this.search(value)}
              />
            </span>

          </Col>
        </Row>
        <Table
          size="small"
          bordered={false}
          rowKey="index"
          dataSource={rowsData}
          columns={this.state.columns}
          rowSelection={rowSelection}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListAllOriginalData;
