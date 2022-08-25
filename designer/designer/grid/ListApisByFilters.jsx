import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewService from '../form/NewService';
import RegService from '../form/RegService';
import NewJoinService from '../form/NewJoinService';
import NewTest from '../../../apitester/form/NewTest';
import EditParamsConfig from './EditParamsConfigInner';
import ListSelectServiceMapPermission from './ListSelectServiceMapPermission';
import EditJavaBeanCode from '../form/components/EditJavaBeanCode';
import PublishAPIToProtal from '../../../apiportal/form/PublishAPIToProtal';
import ShowApiDocForDev from '../../../apiportal/form/ShowApiDocForDev';
import ListDataMappingCategory from '../../mapping/grid/ListDataMappingCategory';

//根据过滤条件显示API列表

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.LIST_CORE_SERVICES.list;
const DELETE_URL=URI.LIST_CORE_SERVICES.delete;
const COPY_URL=URI.LIST_CORE_SERVICES.copy;
const SCAN_URL=URI.LIST_CORE_SERVICES.scanServiceBean;
const exportServices=URI.LIST_CORE_SERVICES.exportServices; //导出

class ListApisByFilters extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.filters=this.props.filters;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      visible:false,
      serviceId:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{1
    if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('EditRest',record.configName,record);
    }else if(action==="Test"){
      this.addTabPane("Test","测试:"+record.configName,record);
    }else if(action==='Permission'){
      this.setState({serviceId:record.id,visible: true,action:action,currentRecord:record});
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"代码:"+record.beanId,record);
    }else if(action==='Publish'){
      this.setState({serviceId:record.id,visible: true,action:action,currentRecord:record});
    }else if(action==='ShowApiDoc'){
        this.addTabPane('ShowApiDoc',"文档:"+record.configName,record);
    }else if(action==='ListDataMappingCategory'){
      this.addTabPane('ListDataMappingCategory',"映射配置:"+record.configName,record);
    }
  }

  //导出服务
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exportServices+"?ids="+ids;
    window.open(url);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中API吗?',
      content: '注意:删除后不可恢复!',
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
    GridActions.loadData(this,LIST_URL,pagination,this.filters,sorter,this.searchFilters);
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
      if(id==='NewService'){
        //新增服务
        content=(<NewService appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegService'){
        //注册服务
        content=(<RegService appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='JoinService'){
        //聚合服务
        content=(<NewJoinService appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditRest'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        if(record.regServiceUrl!=='' && record.regServiceUrl!==undefined && record.regServiceUrl!==null){
          content=(<RegService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.joinRestId!=='' && record.joinRestId!==undefined && record.joinRestId!==null){
          content=(<NewJoinService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else{
          content=(<NewService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }
      }else if(id==='Test'){
        //服务测试
        tabActiveKey="TEST_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTest id="" serviceId={record.id} configType={record.configType} close={this.closeCurrentTab}/>);
      }else if(id==='EditCode'){
        //设置
        tabActiveKey="EditCode_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<EditJavaBeanCode beanId={record.beanId} close={this.closeCurrentTab}/>);
      }else if(id==='ShowApiDoc'){
        content=(<Card><ShowApiDocForDev id={record.id}  appId={this.appId} closeTab={this.closeCurrentTab}/></Card>);
      }else if(id==='ListDataMappingCategory'){
        tabActiveKey=record.id;
        content=(<ListDataMappingCategory apiId={record.id}  appId={this.appId} closeTab={this.closeCurrentTab} />);
      }else{
        content=(<Card title={name}>{name}</Card>);
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
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}}>
            <EditParamsConfig appId={this.props.appId} id={record.id} annotation='0' openapi='0' modelId={record.modelId} closeTab={this.closeCurrentTab}/>
        </Card>
        );
    }
    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
      width:'10%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >{text}</Tag>
        }else if(text==="PUT"){
            return <Tag color="pink" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }else {
            return <Tag color="blue" style={{width:50}} >{text}</Tag>;
        }
      },
      },{
        title: 'URL',
        dataIndex: 'mapUrl',
        width: '35%',
        sorter: true,
        ellipsis: true,
        render:(text,record)=>{
          if(record.authType===0){
            return <span><Icon type="user-delete"  title='匿名访问' style={{color:'magenta'}} />{text}</span>;
          }else if(record.authType===2){
            return <span><Icon type="safety"  title='需要申请'  style={{color:'blue'}} />{text}</span>;
          }else if(record.authType===3){
            return <span><Icon type="key"  title='AppKey认证'  style={{color:'#FF7F50'}} />{text}</span>;
          }else if(record.permission!=='' && record.permission!==undefined){
            let title="绑定权限:"+record.permission;
            return <span><Icon type="lock" title={title} style={{color:'#108ee9'}} />{text}</span>;
          }else{
            return text;
          }
        }
      },{
        title: 'API名称',
        dataIndex: 'configName',
        width:'20%',
      },{
        title: '版本',
        dataIndex: 'version',
        width:'8%',
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '映射',
        dataIndex: 'mappingSize',
        width:'6%',
        render:(text,record)=>{
            let color=text==0?'':'cyan';
            let mapping=<Tag color={color} style={{cursor:'pointer'}} onClick={this.onActionClick.bind(this,"ListDataMappingCategory",record)} >{record.mappingSize}</Tag>
            return mapping;
          }
      },{
      title: '状态',
      dataIndex: 'state',
      width:'8%',
      render:(text,record)=>{
          let stateTags;
          if(record.state==='2'){
            stateTags=<Tag color="red" >调试</Tag>;
          }else if(record.state==='3'){
            stateTags=<Tag color="red" >停用</Tag>;
          }else if(record.state==='4'){
            stateTags=<Tag color="red" >模拟</Tag>;
          }else{
            stateTags=<Tag color="green" >启用</Tag>;
          }
          return (<div style={{textAlign:'center'}}>{stateTags}</div>);
          }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Permission",record)} >权限</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"ShowApiDoc",record)} >文档</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Publish",record)} >发布</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Test",record)} >测试</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      },];

    let modalForm,modalTitle;
    if(this.state.action==='Publish'){
      modalTitle="发布API文档";
      modalForm=<PublishAPIToProtal currentRecord={this.state.currentRecord} appId={this.props.appId} closeModal={this.closeModal} />;
    }else{
      modalTitle="绑定权限";
      modalForm=<ListSelectServiceMapPermission serviceId={this.state.serviceId} appId={this.props.appId} closeModal={this.closeModal} />;
    }
    return (
      <span>
          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                width='750px'
                style={{ top: 25 }}
                visible={this.state.visible}
                onCancel={this.handleCancel}
                footer=''
                >
                {modalForm}
          </Modal>
          <Tabs
            onChange={this.onTabChange}
            onEdit={this.onTabEdit}
            type="editable-card"
            activeKey={this.state.tabActiveKey}
            animated={false}
            hideAdd={true}
          >
          <TabPane tab="API服务列表" key="home" style={{padding:'0px'}}>
           <ButtonGroup  style={{marginBottom:5}} >
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportData)} icon="download" disabled={!hasSelected}  >导出</Button>

            </ButtonGroup>
            <Table
              bordered={false}
              rowKey={record => record.id}
              expandedRowRender={expandedRow}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              size='small'
              onChange={this.onPageChange}
              pagination={pagination}
              rowSelection={rowSelection}
            />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </span>
    );
  }
}

export default ListApisByFilters;
