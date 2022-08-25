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
      this.addTabPane('Edit', '修改:' + record.objectId, record);
    } else if (action === "newObject") {
      this.addTabPane('newObject', '新增数据对象');
    }else if (action === "Service") {
      this.setState({ action: action, visible: true, currentModelId: record.modelId, currentRecord: record });
    }else if (action === "ListAllOriginalData") {
      this.addTabPane('ListAllOriginalData', '原始数据:' + record.objectId, record);
    }
  }

  //导出设计
  exportConfig = () => {
    let ids = this.state.selectedRowKeys.join(",");
    this.setState({ loading: true });
    AjaxUtils.post(exporConfigUrl, { ids: ids }, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        window.open(URI.baseResUrl + data.msg); //msg为文件路径
      }
    });
  }

  refresh = (e) => {
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
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
      content: '注意:删除后不可恢复!',
      onOk() {
        return self.deleteData();
      },
      onCancel() { },
    });
  }

  //Tab相关函数
  onTabChange = (tabActiveKey) => {
    this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit = (targetKey, action) => {
    if (action === "remove") {
      this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
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
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab = (reLoadFlag) => {
    this.tabRemove(this.state.tabActiveKey);
    if (reLoadFlag !== false) {
      this.loadData();
    }
  }
  //增加一个Tab
  addTabPane = (id, name, record) => {
    const panes = this.state.panes;
    let tabActiveKey = id;
    let content;
    if (id === 'newObject') {
      //新增实体模型
      content = (<NewMongoOBJ appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab} />);
    } else if (id === 'ListAllData') {
      //查看数据模型的数据
      tabActiveKey = record.id + "_DATA";
      content = (<ListAllData appId={this.props.appId} keyId={record.keyId} objectId={record.objectId} closeTab={this.closeCurrentTab} />);
    } else if (id === 'Edit') {
      //修改
      tabActiveKey = record.id; //这样避免重复，可以打开多个编辑Tab
      content = (<NewMongoOBJ appId={this.props.appId} id={record.id} objectId={record.objectId} closeTab={this.closeCurrentTab} />);
    }else if (id === 'ListAllOriginalData') {
      //查看数据模型的数据
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
      message.error("数据对象未配置字段，请配置完表字段再进行发布操作！")
    }else{
      this.setState({ currentRecord: record, visible: true, });
    }

  }

  //通过ajax远程载入数据
  search = (value) => {
    let filters = {};
    let sorter = {};
    let searchFilters = {};
    searchFilters = { "objectId": value, "objectName": value };
    sorter = { "order": 'ascend', "field": 'createTime' };//使用userName升序排序
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


  //复制链接
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
            <TabPane tab="表字段配置" key="table" style={{ fontSize: '16px' }}>
              <SapTableParamsConfig objectId={record.objectId} coreField={record.coreField} tableParamsDocs={record.tableParamsDocs} loadData={this.loadData} />
            </TabPane>
            <TabPane tab="字段裁剪" key="crop" style={{ fontSize: '16px' }}>
              <SapCropParamsConfig objectId={record.objectId} cropParamsDocs={record.cropParamsDocs} />
            </TabPane>
            <TabPane tab="发布的API" key="api" style={{ fontSize: '16px' }}>
              <ListApisByFilters objectId={record.objectId} appId={this.props.appId} filters={{ modelId: [record.objectId] }} close={this.closeModal} />
            </TabPane>
          </Tabs>
        </div>
      );
    }
    const text = '';
    const columns = [
      {
        title: '数据对象名称',
        dataIndex: 'objectName',
        width: '15%',
        ellipsis: true,
      },
      {
        title: '数据对象ID',
        dataIndex: 'objectId',
        width: '20%',
        sorter: true,
        render: (text, record) => { return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>; }
      }, {
        title: '数据源Id',
        dataIndex: 'dbConnId',
        width: '10%',
      },
      {
        title: '数据库 | 表名',
        dataIndex: 'dbName',
        width: '20%',
        render: (text, reacd) => {
          return <span>{text}<Divider type="vertical" />{reacd.collName}{' '}<Badge count={reacd.columnConfigNum} style={{ backgroundColor: '#fff', fontSize: '10px', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }}></Badge></span>
        }
      },
      {
        title: '主字段',
        dataIndex: 'keyId',
        width: '10%',
        render: (text, reacd) => {
          if (text !== '' && text !== null && text !== undefined) {
            return <Tag color="blue" >
              {text}
            </Tag>
          } else {
            return <Tag color="red">未配置</Tag>
          }

        }
      },
      {
        title: '数据预览',
        dataIndex: 'editTime',
        width: '10%',
        render: (text, record) => {
          return <span><a onClick={this.onActionClick.bind(this, "ListAllOriginalData", record)}>原始数据</a></span>
        }
      }, {
        title: '操作',
        dataIndex: '',
        key: 'x',
        width: '15%',
        render: (text, record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this, 'Edit', record)} >修改</a>
            <Divider type="vertical" />
            <a onClick={AjaxUtils.showConfirm.bind(this, "复制对象", "确认要复制本数据对象吗?", this.copyDateSource.bind(this, record.objectId))} >复制</a>
            <Divider type="vertical" />
            <a onClick={this.newService.bind(this, record)} >发布API</a>
          </span>;
        }
      },];


    return (
      <span>
        <Modal key={Math.random()} title='发布服务' maskClosable={false}
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
          <TabPane tab="Mongo数据对象列表" key="home" style={{ padding: '0px' }}>
            <Row style={{ marginBottom: 5 }} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                  <Button type="primary" onClick={this.onActionClick.bind(this, 'newObject')} icon="plus-circle-o"  >新增数据对象</Button>
                  <Button type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
                  <Button type="ghost" onClick={AjaxUtils.showConfirm.bind(this, '导出配置', '导出配置后可以使用导入功能重新导入!', this.exportConfig)} icon="download" disabled={!hasSelected}  >导出</Button>
                  <Button type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>

                </ButtonGroup>
              </Col>
              <Col span={12}>
                <span style={{ float: 'right' }} >
                  搜索：<Search
                    placeholder="集合名称"
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
