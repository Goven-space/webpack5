import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewService from '../../designer/designer/form/NewService';
import RegService from '../../designer/designer/form/RegService';
import RegWebService from '../../designer/designer/form/RegWebService';
import RegRestToWebService from '../../designer/designer/form/RegRestToWebService';
import RegWebServiceToRest from '../../designer/designer/form/RegWebServiceToRest';
import RegDubbo from '../../designer/designer/form/RegDubbo';
import NewServiceModel from '../../designer/designer/form/NewServiceModel';
import NewJoinService from '../../designer/designer/form/NewJoinService';
import NewTest from '../../apitester/form/NewTest';
import EditParamsConfig from '../../designer/designer/grid/EditParamsConfigInner';
import ListSelectServiceMapPermission from '../../designer/designer/grid/ListSelectServiceMapPermission';
import ImportAndExportButton from '../../core/export/ImportAndExportButton';
import PublishAPIToProtal from '../../apiportal/form/PublishAPIToProtal';
import ShowApiDocForDev from '../form/ShowApiDocForDev';
import APIVersionChageNotice from '../form/APIVersionChageNotice';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import ListApiCategoryNode from './ListApiCategoryNode';
import ListAppPropertiesByAppId from '../../designer/designer/grid/ListAppPropertiesByAppId';
import RegisterAPI from '../lifecycle/apiregister/form/RegisterAPI';

//API注册管理列表

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.CORE_APIPORTAL_APIMANAGER.ListApisUrl;
const DELETE_URL=URI.LIST_CORE_SERVICES.delete;
const COPY_URL=URI.LIST_CORE_SERVICES.copy;
const exportServices=URI.LIST_CORE_SERVICES.exportServices; //导出
const DEL_URL=URI.CORE_APIPORTAL_APICONFIG.delete; //下线
const TreeMenuUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;

class ListApiByManager extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=API分类";
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
      beanId:'',
      collapsed:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.state.pagination.current=1;
    if(nextProps.categoryId!==this.categoryId){
        this.categoryId=nextProps.categoryId;
        this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('EditRest',"配置:"+record.configName,record);
    }else if(action==="Test"){
      this.addTabPane("Test","测试:"+record.configName,record);
    }else if(action==='Permission'){
      this.setState({serviceId:record.id,visible: true,action:action});
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"代码:"+record.beanId,record);
    }else if(action==='Publish'){
      this.setState({serviceId:record.id,visible: true,action:action,currentRecord:record});
    }else if(action==='ShowApiDoc'){
      this.addTabPane('ShowApiDoc',"文档:"+record.configName,record);
    }else if(action==='Change'){
      this.setState({serviceId:record.id,visible: true,action:action,currentRecord:record});
    }else if(action==='ApiCategory'){
      this.setState({serviceId:record.id,visible: true,action:action});
    }else if(action==='AppProperties'){
      this.setState({serviceId:record.id,visible: true,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确删除确认',
      content: '确定要删除本API吗?',
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
    filters.appId=[this.appId]; //过虑只显示应用下的注册API
    if(this.categoryId!=undefined && this.categoryId!=='*' && this.categoryId!==''){
      filters.categoryId=[this.categoryId]; //过虑只显示分类下的api
    }
    this.searchFilters={}; //先清空搜索条件
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //导出服务
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportServices, { ids: ids });
  }

  //通过ajax远程载入数据
  search=(value)=>{
      let filters;
      if(this.categoryId=='*'){
        filters={appId:[this.props.appId]};
      }else{
        if(this.categoryId!=='' && this.categoryId!==undefined){
          filters={appId:[this.props.appId],categoryId:[this.categoryId]};
        }else{
          filters={appId:[this.props.appId]};
        }
      }
      // filters.configType=['REG'];
      let sorter={};
      let searchFilters={"mapUrl":value,"creator":value,"creatorName":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=this.url;
      this.state.pagination.current=1;
      GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
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
        content=(<NewService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegService'){
        //注册服务
        content=(<RegService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegWebService'){
        //注册WebService
        content=(<RegWebService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegDubbo'){
        //注册dubbo
        content=(<RegDubbo appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='JoinService'){
        //聚合服务
        content=(<NewJoinService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegRestToWebService'){
        //restfule转webservices
        content=(<RegRestToWebService appId={this.props.appId} categoryId={this.state.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegWebServiceToRest'){
        //webservices转rest
        content=(<RegWebServiceToRest appId={this.appId} categoryId={this.state.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditRest'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        if(record.configType==='REG'){
          content=(<RegService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='WEBSERVICE'){
          content=(<RegWebService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='DUBBO'){
          content=(<RegDubbo appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='RestToWebService'){
          content=(<RegRestToWebService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='JOIN'){
          content=(<NewJoinService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='RegWebServiceToRest'){
          content=(<RegWebServiceToRest appId={this.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else{
          content=(<NewService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }
      }else if(id==='Test'){
        //服务测试
        tabActiveKey="TEST_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTest id="" serviceId={record.id} close={this.closeCurrentTab}/>);
      }else if(id==='ShowApiDoc'){
        content=(<Card><ShowApiDocForDev id={record.id}  appId={this.appId} closeTab={this.closeCurrentTab}/></Card>);
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
  closeModal=(closeFlag)=>{
      this.setState({visible: false,});
      if(closeFlag!==false){
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

  newMenuClick=(e)=>{
    if(e.key==='RegService'){
      this.addTabPane('RegService','注册Restful API')
    }else if(e.key==='RegWebService'){
      this.addTabPane('RegWebService','注册WebService');
    }else if(e.key==='RegDubbo'){
      this.addTabPane('RegDubbo','注册Dubbo接口');
    }else if(e.key==='JoinService'){
      this.addTabPane('JoinService','聚合API');
    }else if(e.key==='RegRestToWebService'){
      this.addTabPane('RegRestToWebService','Restful转WebService');
    }else if(e.key==='RegWebServiceToRest'){
      this.addTabPane('RegWebServiceToRest','WebService转Restful');
    }
  }

  register=()=>{
    this.setState({visible: true,action:"register"});
  }

  registerok=(key)=>{
    this.setState({visible: false});
    let e={key:key};
    this.newMenuClick(e);
  }

  //删除API
   deleteAPI=(id)=>{
     this.setState({loading:true});
     AjaxUtils.post(DEL_URL,{ids:id},(data)=>{
       this.setState({loading:false});
       if(data.state===false){
         AjaxUtils.showError(data.msg);
       }else{
         AjaxUtils.showInfo("成功删除("+data.msg+")个API到回收站!");
         this.loadData();
       }
     });
   }

   //通过ajax远程载入数据
   changeCategoryId=(categoryId)=>{
     this.categoryId=categoryId;
     this.state.categoryId=categoryId;
     this.loadData();
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}

    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}}>
        <EditParamsConfig appId={this.props.appId} id={record.id} annotation='0' beanId={record.beanId} modelId={record.modelId} closeTab={this.closeCurrentTab}/>
        </Card>
        );
    }
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width: '8%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }else {
                return <Tag color="blue" style={{width:50}} >{text}</Tag>;
            }
          },
      },{
        title: 'URI',
        dataIndex: 'mapUrl',
        width: '25%',
        sorter: true,
        render:(text,record)=>{
          if(record.authType===0){
            return <span><Icon type="user-delete"  title='匿名访问' style={{color:'magenta'}} />{text}</span>;
          }else if(record.authType===2){
            return <span><Icon type="safety"  title='需要申请'  style={{color:'blue'}} />{text}</span>;
          }else if(record.permission!=='' && record.permission!==undefined){
            let title="绑定权限:"+record.permission;
            return <span><Icon type="lock" title={title} style={{color:'#108ee9'}} />{text}</span>;
          }else if(record.authType===3){
            return <span><Icon type="key"  title='AppKey认证'  style={{color:'#FF7F50'}} />{text}</span>;
          }else{
            return text;
          }
        }
      },{
        title: 'API名称',
        dataIndex: 'configName',
        width:'20%',
      },{
        title: '发布者',
        dataIndex: 'creator',
        sorter: true,
        width:'10%',
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        sorter: true,
        width:'15%',
      },{
        title: '版本',
        dataIndex: 'version',
        width:'6%',
      },{
      title: '状态',
      dataIndex: 'publishFlag',
      width:'8%',
      render:(text,record)=>{
          let stateTags;
          if(record.state=='3'){return <Tag color="#ccc" >已停用</Tag>;}
          if(record.publishFlag===0){
            return <Tag color="red" >未发布</Tag>;
          }else{
            return <Tag color="green" >已发布</Tag>;
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"ShowApiDoc",record)} >文档</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Permission",record)} >权限</a></Menu.Item>
                <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"下线确认","注意:本API的所有申请记录、关注、评价数据都将被删除!",this.deleteAPI.bind(this,record.id))} >下线</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Publish",record)} >发布</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Change",record)} >变更</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Test",record)} >测试</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      },];

    let contentStyle="";
    if(!this.state.collapsed){
      contentStyle={left:'-1px',minHeight:'500px',padding: '0px 5px',borderLeft:'1px solid #e9e9e9',position:'relative'};
    }

    let modalForm,modalTitle;
    if(this.state.action==='Publish'){
      modalTitle="发布API";
      modalForm=<PublishAPIToProtal currentRecord={this.state.currentRecord} appId={this.props.appId} closeModal={this.closeModal} />;
    }else if(this.state.action==='Change'){
      modalTitle="API变更通知";
      modalForm=<APIVersionChageNotice currentRecord={this.state.currentRecord} appId={this.props.appId} closeModal={this.closeModal} />;
    }else if(this.state.action==='ApiCategory'){
      modalTitle="API分类管理";
      modalForm=<ListApiCategoryNode  appId={this.appId} categoryId={this.appId+'.ServiceCategory'}  closeModal={this.closeModal} />;
    }else if(this.state.action==='AppProperties'){
      modalTitle="应用变量配置";
      modalForm=<ListAppPropertiesByAppId  appId={this.appId}  closeModal={this.closeModal} />;
    }else if(this.state.action==='register'){
      modalTitle="选择API类型";
      modalForm=<RegisterAPI  registerok={this.registerok} />;
    }else{
      modalTitle="绑定权限";
      modalForm=<ListSelectServiceMapPermission serviceId={this.state.serviceId} appId={this.props.appId} closeModal={this.closeModal} />;
    }

    return (
      <div>
          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                width='950px'
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
          <TabPane tab="API接口列表" key="home" style={{padding:'0px'}}>
          <div style={{minHeight:'500px',border:'1px #e9e9e9 solid',margin:'0px',paddingLeft:'10px',paddingRight:'10px',paddingTop:'10px',paddingBottom:'10px',borderRadius:'2px'}}>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={16}>
                    <ButtonGroup>
                      <Button  type="primary" onClick={this.register} icon="plus"  loading={loading} >注册API</Button>
                      <Button  type="ghost" onClick={this.onActionClick.bind(this,"ApiCategory")} icon="appstore"  >分类管理</Button>
                      <Button  type="ghost" onClick={this.onActionClick.bind(this,"AppProperties")} icon="appstore"  >变量配置</Button>
                      <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected}  >删除</Button>
                      <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                     </ButtonGroup>{' '}
                     <ImportAndExportButton appId={this.appId} ids={this.state.selectedRowKeys.join(",")} />
                  </Col>
                  <Col span={8}>
                   <span style={{float:'right'}} >
                     分类:<TreeNodeSelect  url={this.menuUrl} defaultData={[{title:'所有API列表',value:''}]} onChange={this.changeCategoryId} value={this.state.categoryId} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                   {' '}搜索:<Search
                      placeholder="URL|服务名|创建者"
                      style={{ width: 200 }}
                      onSearch={value => this.search(value)}
                    />
                     </span>
                  </Col>
                </Row>
                <Table
                  bordered={false}
                  rowKey={record => record.id}
                  rowSelection={rowSelection}
                  expandedRowRender={expandedRow}
                  dataSource={rowsData}
                  columns={columns}
                  loading={loading}
                  onChange={this.onPageChange}
                  pagination={pagination}
                />
          </div>
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
    </div>
    );
  }
}

export default ListApiByManager;
