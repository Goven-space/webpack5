import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input,Badge} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewDataModelService from '../form/NewDataModelService';
import NewDataModelCode from '../form/NewDataModelCode';
import NewBusinessModel from './NewBusinessModel';
import ImportDataModelFile from '../form/ImportDataModelFile';
import EditBusinessColumnsConfig from './EditBusinessColumnsConfig';
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

class ListBusinessModels extends React.Component {
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
    if(action==="newBusiness"){
      this.addTabPane('newBusiness','新增业务模型');
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
    GridActions.downloadBlob(this, ExportModelConfigUrl, { ids: ids });
  }

  exportModelDicToExcel=(modelId)=>{
    let url=ExportDataModelDicUrl;
    GridActions.downloadBlob(this, url, { modelId: modelId });
  }

  exportData=(modelId)=>{
    let url=EXPORTDATA_URL;
    let modelIds="";
    this.state.selectedRows.forEach((item)=>{
      modelIds+=","+item.modelId;
    });
    GridActions.downloadBlob(this, url, { modelIds: modelIds, appId: this.appId });
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
    filters.modelType=["R"]; //模型类型
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
      if(id==='newBusiness'){
        //新增业务模型
        content=(<NewBusinessModel appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='ListAllData'){
        //查看数据模型的数据
        tabActiveKey=record.id+"_DATA";
        content=(<ListAllData appId={this.props.appId} id={record.id} keyId={record.keyId} modelId={record.modelId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        content=(<NewBusinessModel appId={this.props.appId} id={record.id}   closeTab={this.closeCurrentTab}/>);
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
    searchFilters={"modelId":value,"modelName":value,"entryModelId":value,"filters":value};
    let appIdArray = [this.props.appId];
    filters.appId=appIdArray; //过虑只显示本应用的服务
    filters.modelType=["R"]; //模型类型
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag!==false){
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
      sorter: true
    },{
      title: '模型id(API数)',
      dataIndex: 'modelId',
      width: '20%',
      sorter: true,
      render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
    },{
    title: '数据源',
    dataIndex: 'dbConnId',
    width:'10%',
    sorter: true,
    },
    {
    title: '物理表',
    dataIndex: 'tableName',
    width:'15%',
    sorter: true,
    },{
      title: '主键',
      dataIndex: 'keyId',
      width: '10%'
    },{
      title: '数据',
      dataIndex: '',
      width: '8%',
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
        <EditBusinessColumnsConfig appId={this.props.appId} id={record.id} keyId={record.keyId} modelId={record.modelId} modelType={record.modelType} entryModelId={record.entryModelId} modelName={record.modelName} dbType={record.dbType} closeTab={this.closeCurrentTab}/>
        </div>
        );
    }

    let modelForm;
    let modelTitle;
    let modelWidth='700px';
    if(this.state.action==='Service'){
      modelWidth='950px';
      modelTitle="业务模型创建API";
      modelForm=<NewDataModelService  appId={this.props.appId} keyId={this.state.currentRecord.keyId}  modelType='R'   modelName={this.state.currentRecord.modelName} modelId={this.state.currentModelId} tableName={this.state.currentRecord.tableName} close={this.closeModal} />;
    }else if(this.state.action==='Code'){
      modelTitle="生成代码";
      modelForm=<NewDataModelCode  appId={this.props.appId} modelId={this.state.currentModelId} tableName={this.state.currentRecord.tableName} close={this.closeModal} />;
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
        <TabPane tab="业务模型(多表)" key="home" style={{padding:'0px'}}>
          <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,"newBusiness")} icon="plus" >新增业务模型</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete" style={{display:hasSelected?'':'none'}} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportModelConfig)} icon="download"  style={{display:hasSelected?'':'none'}}  >导出配置</Button>
                  <Button  type="ghost" onClick={this.exportData} icon="download"  style={{display:hasSelected?'':'none'}} >导出数据</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,"ImportData")} icon="upload"  >导入数据</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="模型Id|模型名称|实体模型Id|SQL语句"
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

export default ListBusinessModels;
