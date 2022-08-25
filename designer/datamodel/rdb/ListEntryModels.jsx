import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input,Badge} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewDataModel from './NewDataModel';
import NewBatchDataModel from './NewBatchDataModel';
import NewDataModelService from '../form/NewDataModelService';
import NewDataModelCode from '../form/NewDataModelCode';
import NewDataModelSql from './NewDataModelSql';
import ImportDataModelFile from '../form/ImportDataModelFile';
import EditEntryColumnsConfig from './EditEntryColumnsConfig';
import ListAllData from '../grid/ListAllData';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.CORE_DATAMODELS.list;
const DELETE_URL=URI.CORE_DATAMODELS.delete;
const COPY_URL=URI.CORE_DATAMODELS.copy;
const EXPORTDATA_URL=URI.CORE_DATAMODELS.exportdatasUrl;
const ExportModelConfigUrl=URI.CORE_DATAMODELS.ExportModelConfig;
const ExportDataModelDicUrl=URI.CORE_DATAMODELS.exportDataModelDic;

class ListEntryModels extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      visible:false,
      currentModelId:'',
      action:'',
      currentRecord:'',
      collapsed:false,
      dbType:'R',
      width:800,
    }
  }

  componentDidMount(){
      this.updateSize();
      // window.addEventListener('resize', () => this.updateSize());
      this.loadData();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-100;
    this.setState({width:width});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record)=>{
    if(action==="newEntry"){
      this.addTabPane('newEntry','新增实体模型');
    }else if(action==="newBatchEntry"){
      this.addTabPane('newBatchEntry','批量新增实体模型');
    }else if(action==="Set"){
      this.addTabPane('Set',record.modelName,record);
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"模型:"+record.modelName,record);
    }else if(action==="Service"){
      this.setState({action:action,visible: true,currentModelId:record.modelId,currentRecord:record});
    }else if(action==="Code"){
      this.setState({action:action,visible: true,currentModelId:record.modelId,currentRecord:record});
    }else if(action==="SQL"){
      this.setState({action:action,visible: true,currentModelId:record.modelId});
    }else if(action==="ImportData"){
      this.setState({action:action,visible: true});
    }else if(action==="ListAllData"){
      this.addTabPane('ListAllData','数据:'+record.modelId,record);
    }
  }

  //导出设计
  exportModelConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(ExportModelConfigUrl,{ids:ids},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        window.open(URI.baseResUrl+data.msg); //msg为文件路径
      }
    });
  }

  exportData=(modelId)=>{
    let url=EXPORTDATA_URL;
    let modelIds="";
    this.state.selectedRows.forEach((item)=>{
      modelIds+=","+item.modelId;
    });
    this.setState({loading:true});
    AjaxUtils.post(url,{modelIds:modelIds,appId:this.appId},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        window.open(URI.baseResUrl+data.filePath);
      }
    });
  }

  exportModelDicToExcel=(modelId)=>{
    let url=ExportDataModelDicUrl;
    GridActions.downloadBlob(this, url, { modelId: modelId });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '删除确认',
      content: '注意:删除数据模型并不会删除数据库表以及表中的数据,数据模型删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的服务
    filters.dbType=[this.state.dbType]; //数据库类型
    filters.modelType=["E"]; //模型类型
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
  }

  //Tab相关函数
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
  tabRemove=(targetKey)=>{
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
      }else{
        tabActiveKey="home";
      }
      this.setState({ panes, tabActiveKey });
  }
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //增加一个Tab
  addTabPane=(id,name,record)=>{
      const panes = this.state.panes;
      let tabActiveKey = id;
      let content;
      if(id==='newEntry'){
        //新增实体模型
        content=(<NewDataModel appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='newBatchEntry'){
        //批量新增实体模型
        content=(<NewBatchDataModel appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='ListAllData'){
        //查看数据模型的数据
        tabActiveKey=record.id+"_DATA";
        content=(<ListAllData appId={this.props.appId} id={record.id} keyId={record.keyId} modelId={record.modelId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewDataModel appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
      }else{
        return;
      }
      const paneItem={ title: name, content: content, key: tabActiveKey };
      if(!this.containsTab(panes,paneItem)){
        if(panes.length>=5){
          panes.splice(-1,1,paneItem);
        }else{
          panes.push(paneItem);
        }
    }
      this.setState({ panes, tabActiveKey});
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"modelId":value,"modelName":value,"entryModelId":value};
    let appIdArray = [this.props.appId];
    filters.appId=appIdArray; //过虑只显示本应用的服务
    filters.modelType=["E"];
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}

    const columns=[{
      title: '模型名称',
      dataIndex: 'modelName',
      width: '25%',
      sorter: true,
      ellipsis: true
    },{
      title: '模型id(API数)',
      dataIndex: 'modelId',
      width: '20%',
      sorter: true,
      ellipsis: true,
      render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
    },{
    title: '数据源',
    dataIndex: 'dbConnId',
    width:'12%',
    sorter: true,
    ellipsis: true,
    },
    {
    title: '物理表',
    dataIndex: 'tableName',
    width:'15%',
    sorter: true,
    },{
      title: '主键',
      dataIndex: 'keyId',
      width: '13%'
    },{
      title: '数据',
      dataIndex: '',
      width: '6%',
      render:(text,record) => {
        return (<a onClick={this.onActionClick.bind(this,"ListAllData",record)} >预览</a>);
      }
    },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'8%',
      render: (text,record) => {
        return <Dropdown overlay={<Menu style={{width:80}}>
              <Menu.Item><a  onClick={this.onActionClick.bind(this,"Edit",record)} >修改模型</a></Menu.Item>
              <Menu.Item><a  onClick={this.onActionClick.bind(this,"Service",record)} >创建API</a></Menu.Item>
              <Menu.Item><a  onClick={this.onActionClick.bind(this,"Code",record)} >生成代码</a></Menu.Item>
              <Menu.Item><a  onClick={this.onActionClick.bind(this,"SQL",record)} >生成SQL</a></Menu.Item>
              <Menu.Item><a  onClick={this.exportModelDicToExcel.bind(this,record.modelId)} >数据字典</a></Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制本数据模型吗?",this.onActionClick.bind(this,"Copy",record))} >复制模型</Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除模型</Menu.Item>
            </Menu>}
            trigger={['click']}
          >
          <a className="ant-dropdown-link" href="#">
            操作 <Icon type="down" />
          </a>
        </Dropdown>}
    },];

    const expandedRow=(record)=>{
      return (
        <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
        <EditEntryColumnsConfig appId={this.props.appId} id={record.id} keyId={record.keyId} modelId={record.modelId}   modelType={record.modelType}   modelName={record.modelName} dbType={record.dbType} closeTab={this.closeCurrentTab}/>
        </div>
        );
    }

    let modelForm;
    let modelTitle;
    let modelWidth='700px';
    if(this.state.action==='Service'){
      modelWidth='950px';
      modelTitle="数据模型创建API";
      modelForm=<NewDataModelService  appId={this.props.appId} keyId={this.state.currentRecord.keyId} modelName={this.state.currentRecord.modelName} modelId={this.state.currentModelId} modelType='E' tableName={this.state.currentRecord.tableName} close={this.closeModal} />;
    }else if(this.state.action==='Code'){
      modelTitle="生成代码";
      modelForm=<NewDataModelCode  appId={this.props.appId} modelId={this.state.currentModelId}  tableName={this.state.currentRecord.tableName} close={this.closeModal} />;
    }else if(this.state.action==='SQL'){
      modelWidth='950px';
      modelTitle="数据库表的SQL语句";
      modelForm=<NewDataModelSql  appId={this.props.appId} modelId={this.state.currentModelId} close={this.closeModal} />;
    }else if(this.state.action==='ImportData'){
      modelTitle="导入数据";
      modelForm=<ImportDataModelFile  appId={this.props.appId} modelId={this.state.currentModelId} close={this.closeModal} />;
    }

    return (
      <div>
        <Modal key={Math.random()} title={modelTitle} maskClosable={false}
            visible={this.state.visible}
            width={modelWidth}
            footer=''
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {modelForm}
        </Modal>
        <Tabs
          onChange={this.onTabChange}
          onEdit={this.onTabEdit}
          type="editable-card"
          activeKey={this.state.tabActiveKey}
          animated={false}
          hideAdd={true}
        >
        <TabPane tab="实体模型(单表)" key="home" style={{padding:'0px'}}>
          <Row style={{marginBottom:5}} gutter={0} >
              <Col span={16} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,"newEntry")} icon="plus"  >新增实体模型</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,"newBatchEntry")} icon="plus"  >批量新增</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete" style={{display:hasSelected?'':'none'}} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportModelConfig)} icon="download"  style={{display:hasSelected?'':'none'}}  >导出配置</Button>
                  <Button  type="ghost" onClick={this.exportData} icon="download"  style={{display:hasSelected?'':'none'}} >导出数据</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,"ImportData")} icon="upload"  >导入数据</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={8}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="搜索modelId或名称"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              expandedRowRender={expandedRow}
              rowKey={record => record.id}
              rowSelection={rowSelection}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
        </TabPane>
        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} >{pane.content}</TabPane>)}
        </Tabs>
    </div>
    );
  }
}

export default ListEntryModels;
