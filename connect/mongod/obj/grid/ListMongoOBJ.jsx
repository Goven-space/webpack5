import React from 'react';
import { Table, message, Dropdown, Card, Popconfirm, Button, Modal, Input, Row, Col, Tag, Divider, Badge, Tabs, Tooltip } from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import NewMongoOBJ from '../form/NewMongoOBJ';
import NewMongoObjectService from '../form/NewDataModelService';
import SapTableParamsConfig from './components/MongoObjectTableParamsConfig';
import SapCropParamsConfig from './components/MongoObjectCropParamsConfig';
import ListApisByFilters from '../../../../designer/designer/grid/ListApisByFilters';
import ListAllOriginalData from '../grid/ListAllOriginalData';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL = URI.CONNECT.MONGOD.objectList;
const DELETE_URL = URI.CONNECT.MONGOD.delete;
const exporConfigUrl = URI.CONNECT.MONGOD.exportConfig;
const copyConfigUrl = URI.CONNECT.MONGOD.copy;

class ListMongoOBJ extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.categoryId = this.props.categoryId;
    this.state = {
      pagination: { pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      panes: [],
      loading: true,
      visible: false,
      tabActiveKey: 'home',
      currentId: '',
      currentRecord: {},
      searchKeyWords: '',
      collapsed: false,
      action: ''
    }
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.categoryId !== nextProps.categoryId) {
      this.categoryId = nextProps.categoryId;
      this.state.pagination.current = 1;
      this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  }

  onPageChange = (pagination, filters, sorter) => {
    this.loadData(pagination, filters, sorter);
  }

  onActionClick = (action, record, url) => {
    if (action === "Delete") {
      this.deleteData(record.id);
    } else if (action === "Edit") {
      this.addTabPane('Edit', '??????:' + record.objectId, record);
    } else if (action === "newObject") {
      this.addTabPane('newObject', '??????????????????');
    }else if (action === "Service") {
      this.setState({ action: action, visible: true, currentModelId: record.modelId, currentRecord: record });
    }else if (action === "ListAllOriginalData") {
      this.addTabPane('ListAllOriginalData', '????????????:' + record.objectId, record);
    }
  }

  //????????????
  exportConfig = () => {
    let ids = this.state.selectedRowKeys.join(",");
    this.setState({ loading: true });
    AjaxUtils.post(exporConfigUrl, { ids: ids }, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        window.open(URI.baseResUrl + data.msg); //msg???????????????
      }
    });
  }

  refresh = (e) => {
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
  loadData = (pagination = this.state.pagination, filters = {}, sorter = {}) => {
    let url = LIST_URL;
    if (this.categoryId !== undefined && this.categoryId !== '' && this.categoryId !== 'home' && this.categoryId !== 'all') {
      filters.categoryId = [this.categoryId];
    }
    GridActions.loadData(this, url, pagination, filters, sorter);
  }

  deleteData = (argIds) => {
    GridActions.deleteData(this, DELETE_URL, argIds);
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

  //Tab????????????
  onTabChange = (tabActiveKey) => {
    this.setState({ tabActiveKey });
  }
  //Tab?????????????????????
  onTabEdit = (targetKey, action) => {
    if (action === "remove") {
      this.tabRemove(targetKey);
    }
  }
  //??????X??????????????????Tab
  tabRemove = (targetKey) => {
    let tabActiveKey = this.state.tabActiveKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && tabActiveKey === targetKey) {
      tabActiveKey = panes[lastIndex].key;
    } else {
      tabActiveKey = "home";
    }
    this.setState({ panes, tabActiveKey });
  }
  //?????????????????????Tab?????????Grid??????
  closeCurrentTab = (reLoadFlag) => {
    this.tabRemove(this.state.tabActiveKey);
    if (reLoadFlag !== false) {
      this.loadData();
    }
  }
  //????????????Tab
  addTabPane = (id, name, record) => {
    const panes = this.state.panes;
    let tabActiveKey = id;
    let content;
    if (id === 'newObject') {
      //??????????????????
      content = (<NewMongoOBJ appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab} />);
    } else if (id === 'ListAllData') {
      //???????????????????????????
      tabActiveKey = record.id + "_DATA";
      content = (<ListAllData appId={this.props.appId} keyId={record.keyId} objectId={record.objectId} closeTab={this.closeCurrentTab} />);
    } else if (id === 'Edit') {
      //??????
      tabActiveKey = record.id; //?????????????????????????????????????????????Tab
      content = (<NewMongoOBJ appId={this.props.appId} id={record.id} objectId={record.objectId} closeTab={this.closeCurrentTab} />);
    }else if (id === 'ListAllOriginalData') {
      //???????????????????????????
      tabActiveKey = record.id + "_DATA";
      content = (<ListAllOriginalData appId={this.props.appId} keyId={record.keyId} objectId={record.objectId} closeTab={this.closeCurrentTab} />);
    }
    else {
      return;
    }
    const paneItem = { title: name, content: content, key: tabActiveKey };
    if (!this.containsTab(panes, paneItem)) {
      if (panes.length >= 5) {
        panes.splice(-1, 1, paneItem);
      } else {
        panes.push(paneItem);
      }
    }
    this.setState({ panes, tabActiveKey });
  }

  containsTab(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i].key === obj.key) {
        return true;
      }
    }
    return false;
  }

  closeModal = (reLoadFlag) => {
    this.setState({ visible: false, });
    if (reLoadFlag === true) {
      this.loadData();
    }
  }

  handleCancel = (e) => {
    this.setState({ visible: false, });
  }

  newService = (record) => {
    if(record.columnConfigNum<1){
      message.error("???????????????????????????????????????????????????????????????????????????")
    }else{
      this.setState({ currentRecord: record, visible: true, });
    }

  }

  //??????ajax??????????????????
  search = (value) => {
    let filters = {};
    let sorter = {};
    let searchFilters = {};
    searchFilters = { "objectId": value, "objectName": value };
    sorter = { "order": 'ascend', "field": 'createTime' };//??????userName????????????
    let url = LIST_URL;
    if (this.categoryId !== undefined && this.categoryId !== '' && this.categoryId !== 'home' && this.categoryId !== 'all') {
      filters.categoryId = [this.categoryId];
    }
    GridActions.loadData(this, url, this.state.pagination, filters, sorter, searchFilters);
  }

  testConnect = (id) => {
    this.setState({ loading: true });
    let url = TestConnectUrl + "?id=" + id;
    AjaxUtils.get(url, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }


  //????????????
  copyDateSource = (id) => {
    this.setState({ loading: true });
    AjaxUtils.post(copyConfigUrl, { objectId: id }, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo( data.msg );
        this.loadData();
      }
    });
  }

  render() {
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
    const { rowsData, pagination, selectedRowKeys, loading, currentId, currentRecord } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle = { marginTop: '8px', marginBottom: '8px', }
    const expandedRow = (record) => {
      return (
        <div style={{ width: this.state.width, backgroundColor: '#ffffff', border: '1px solid #f4f4f4', padding: 8 }}>
          <Tabs size='large'>
            <TabPane tab="???????????????" key="table" style={{ fontSize: '16px' }}>
              <SapTableParamsConfig objectId={record.objectId} coreField={record.coreField} tableParamsDocs={record.tableParamsDocs} loadData={this.loadData} />
            </TabPane>
            <TabPane tab="????????????" key="crop" style={{ fontSize: '16px' }}>
              <SapCropParamsConfig objectId={record.objectId} cropParamsDocs={record.cropParamsDocs} />
            </TabPane>
            <TabPane tab="?????????API" key="api" style={{ fontSize: '16px' }}>
              <ListApisByFilters objectId={record.objectId} appId={this.props.appId} filters={{ modelId: [record.objectId] }} close={this.closeModal} />
            </TabPane>
          </Tabs>
        </div>
      );
    }
    const text = '';
    const columns = [
      {
        title: '??????????????????',
        dataIndex: 'objectName',
        width: '15%',
        ellipsis: true,
      },
      {
        title: '????????????ID',
        dataIndex: 'objectId',
        width: '20%',
        sorter: true,
        render: (text, record) => { return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>; }
      }, {
        title: '?????????Id',
        dataIndex: 'dbConnId',
        width: '10%',
      },
      {
        title: '????????? | ??????',
        dataIndex: 'dbName',
        width: '20%',
        render: (text, reacd) => {
          return <span>{text}<Divider type="vertical" />{reacd.collName}{' '}<Badge count={reacd.columnConfigNum} style={{ backgroundColor: '#fff', fontSize: '10px', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }}></Badge></span>
        }
      },
      {
        title: '?????????',
        dataIndex: 'keyId',
        width: '10%',
        render: (text, reacd) => {
          if (text !== '' && text !== null && text !== undefined) {
            return <Tag color="blue" >
              {text}
            </Tag>
          } else {
            return <Tag color="red">?????????</Tag>
          }

        }
      },
      {
        title: '????????????',
        dataIndex: 'editTime',
        width: '10%',
        render: (text, record) => {
          return <span><a onClick={this.onActionClick.bind(this, "ListAllOriginalData", record)}>????????????</a></span>
        }
      }, {
        title: '??????',
        dataIndex: '',
        key: 'x',
        width: '15%',
        render: (text, record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this, 'Edit', record)} >??????</a>
            <Divider type="vertical" />
            <a onClick={AjaxUtils.showConfirm.bind(this, "????????????", "??????????????????????????????????", this.copyDateSource.bind(this, record.objectId))} >??????</a>
            <Divider type="vertical" />
            <a onClick={this.newService.bind(this, record)} >??????API</a>
          </span>;
        }
      },];


    return (
      <span>
        <Modal key={Math.random()} title='????????????' maskClosable={false}
          visible={this.state.visible}
          width='780px'
          footer=''
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <NewMongoObjectService close={this.closeModal} appId={this.appId} record={currentRecord} />
        </Modal>
        <Tabs
          onChange={this.onTabChange}
          onEdit={this.onTabEdit}
          type="editable-card"
          activeKey={this.state.tabActiveKey}
          animated={false}
          hideAdd={true}
        >
          <TabPane tab="Mongo??????????????????" key="home" style={{ padding: '0px' }}>
            <Row style={{ marginBottom: 5 }} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                  <Button type="primary" onClick={this.onActionClick.bind(this, 'newObject')} icon="plus-circle-o"  >??????????????????</Button>
                  <Button type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >??????</Button>
                  <Button type="ghost" onClick={AjaxUtils.showConfirm.bind(this, '????????????', '???????????????????????????????????????????????????!', this.exportConfig)} icon="download" disabled={!hasSelected}  >??????</Button>
                  <Button type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>

                </ButtonGroup>
              </Col>
              <Col span={12}>
                <span style={{ float: 'right' }} >
                  ?????????<Search
                    placeholder="????????????"
                    style={{ width: 260 }}
                    onSearch={value => this.search(value)}
                  />
                </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              expandedRowRender={expandedRow}
            />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </span>
    );
  }
}

export default ListMongoOBJ;
