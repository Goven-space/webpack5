import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewService from '../form/NewService';
import RegService from '../form/RegService';
import NewJoinService from '../form/NewJoinService';
import NewServiceModel from '../form/NewServiceModel';
import NewTest from '../../../apitester/form/NewTest';
import EditParamsConfig from './EditParamsConfigInner';
import ListSelectServiceMapPermission from './ListSelectServiceMapPermission';
import EditJavaBeanCode from '../form/components/EditJavaBeanCode';
import ImportWsdlForm from '../form/ImportWsdl';
import ImportAndExportButton from '../../../core/export/ImportAndExportButton';
import PublishAPIToProtal from '../../../apiportal/form/PublishAPIToProtal';
import ShowApiDocForDev from '../../../apiportal/form/ShowApiDocForDev';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ListDataMappingCategory from '../../mapping/grid/ListDataMappingCategory';

//新版本的服务API列表

const { Sider, Content } = Layout;
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
const TreeMenuUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;

class ListApisByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.searchKeyword=this.props.searchKeyword||''; //全局搜索关键字
    this.searchKeywords=''; //本grid搜索的关键字
    this.categoryId=this.props.categoryId||'AllAPIs';
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
      menuData:[],
      currentRecord:{},
      categoryId:''
    }
  }

  componentDidMount(){
    // console.log(this.searchKeyWord);
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(nextProps.searchKeyword!==undefined && nextProps.searchKeyword!==''){
      //搜索api
      this.searchKeyword=nextProps.searchKeyword;
      this.search(this.searchKeyword);
    }else{
      //重新载入api
      if(nextProps.categoryId!==this.categoryId){
          this.categoryId=nextProps.categoryId;
          this.loadData();
      }
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


  //扫描所有Service bean并自动注册服务
  scanAllServiceBean=()=>{
    let url=SCAN_URL+"?appId="+this.appId;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      AjaxUtils.showInfo(data.msg);
      this.loadData();
      this.setState({loading:false});
    });
  }

   //导出服务
   exportData=()=>{
     let ids=this.state.selectedRowKeys.join(",");
     GridActions.downloadBlob(this, exportServices, { ids: ids });
   }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
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
    if(this.searchKeyword!==''){return this.search(this.searchKeyword,pagination);} //全局搜索优先
    if(this.searchKeywords!==''){return this.search(this.searchKeywords,pagination);} //本grid搜索优先

    filters.appId=[this.props.appId]; //过虑只显示本应用的服务
    this.searchFilters={}; //先清空搜索条件
    if(this.categoryId!==undefined && this.categoryId!=="" && this.categoryId!=='AllAPIs' && this.categoryId!=='Home'){
      this.searchFilters.categoryId=this.categoryId; //只显示指定分类的服务
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={appId:[this.props.appId]};
      let sorter={};
      let searchFilters={"mapUrl":value,"beanId":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
      let url=this.url;
      this.searchKeyword=''; //全局搜索时需要清这个，不然在点菜单时还是会变成搜索
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
      GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
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
      }else if(id==='JoinService'){
        //聚合服务
        content=(<NewJoinService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='ServiceModel'){
        //设计服务
        content=(<NewServiceModel appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditRest'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        if(record.configType==='REG'){
          content=(<RegService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='JOIN'){
          content=(<NewJoinService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='MODEL'){
          content=(<NewServiceModel appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else{
          content=(<NewService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }
      }else if(id==='Test'){
        //服务测试
        tabActiveKey="TEST_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTest id="" serviceId={record.id} close={this.closeCurrentTab}/>);
      }else if(id==='EditCode'){
        //设置
        tabActiveKey="EditCode_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<EditJavaBeanCode beanId={record.beanId} close={this.closeCurrentTab}/>);
      }else if(id==='ImportWsdl'){
        content=(<ImportWsdlForm  appId={this.appId} closeTab={this.closeCurrentTab}/>);
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

  newMenuClick=(e)=>{
    if(e.key==='NewService'){
      this.addTabPane('NewService','新增服务');
    }else if(e.key==='RegService'){
      this.addTabPane('RegService','注册服务');
    }else if(e.key==='JoinService'){
      this.addTabPane('JoinService','聚合服务');
    }else if(e.key==='ServiceModel'){
      this.addTabPane('ServiceModel','设计服务');
    }else if(e.key==='ImportWsdl'){
      this.addTabPane('ImportWsdl','导入WebService');
    }
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  changeCategoryId=(categoryId)=>{
    this.categoryId=categoryId;
    this.state.categoryId=categoryId;
    this.state.pagination.current=1;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const newMenu = (
      <Menu onClick={this.newMenuClick}>
        <Menu.Item key="NewService"><Icon type="api" />{' '}新增服务</Menu.Item>
        <Menu.Item key="ServiceModel"><Icon type="api" />{' '}设计服务</Menu.Item>
      </Menu>
    );
    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}}>
        <EditParamsConfig appId={this.props.appId} id={record.id} beanId={record.beanId} modelId={record.modelId} closeTab={this.closeCurrentTab}/>
        </Card>
        );
    }
    const columns=[{
        title: '方法',
        dataIndex: 'methodType',
        width: '6%',
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
        title: 'URL',
        dataIndex: 'mapUrl',
        width: '23%',
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
        title: '名称',
        dataIndex: 'configName',
        width:'15%',
        ellipsis: true,
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
        sorter: true,
      },{
        title: 'Bean类型',
        dataIndex: 'beanId',
        sorter: true,
        width:'15%',
        ellipsis: true,
        render:(text,record)=>{
          if(record.configType==='JOIN'){
              return <Tag>聚合</Tag>;
          }else if(record.configType==='REG'){
              return <Tag>注册</Tag>;
          }else if(record.configType==='MODEL'){
              return <Tag color='blue'>设计</Tag>;
          }else if(record.classPath===''){
              return (<div>{text}<Tag color="red">X</Tag></div>);
          }else if(text=='RdbSqlMapperRest'){
              return "脚本发布";
          }else if(text=='RdbDataModelRest'){
              return "模型发布";
          }else if(text=='ProcedureExecuterRest'){
              return <Tag color='orange'>存储过程</Tag>;
          }else{
              return <Popover content={record.classPath+"."+record.beanMethodName+"()"} title="调用方法" >
              <a onClick={this.onActionClick.bind(this,"EditCode",record)} >{text}</a>
              </Popover>;
          }
        }
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
      width:'5%',
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
        title: '版本',
        dataIndex: 'version',
        width:'5%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"ShowApiDoc",record)} >文档</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Permission",record)} >权限</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Publish",record)} >发布</a></Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Test",record)} >测试</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      },];

      let modalForm,modalTitle;
      if(this.state.action==='Publish'){
        modalTitle="发布到API门户中进行展示";
        modalForm=<PublishAPIToProtal currentRecord={this.state.currentRecord} appId={this.props.appId} closeModal={this.closeModal} />;
      }else{
        modalTitle="绑定权限";
        modalForm=<ListSelectServiceMapPermission serviceId={this.state.serviceId} appId={this.props.appId} closeModal={this.closeModal} />;
      }
    return (
      <div>
          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                width='850px'
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
          <TabPane tab="服务列表" key="home" style={{padding:'0px'}}>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12}>
                   <ButtonGroup >
                    <Dropdown overlay={newMenu}>
                      <Button type="primary"  >
                        新增服务 <Icon type="down" />
                      </Button>
                    </Dropdown>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  style={{display:hasSelected?'':'none'}}  >删除</Button>
                    <Button  type="ghost" onClick={this.scanAllServiceBean} icon="scan"  >重新扫描</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                     </ButtonGroup>
                     {' '}
                     <ImportAndExportButton appId={this.appId} ids={this.state.selectedRowKeys.join(",")} />
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                  分类:<TreeNodeSelect  url={this.menuUrl} defaultData={[{label:'所有API列表',value:''}]} onChange={this.changeCategoryId} value={this.state.categoryId} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                   {' '}搜索:<Search
                      placeholder="URL|名称|beanId"
                      style={{ width: 260 }}
                      onSearch={value => this.search(value)}
                      onChange={e=>{this.searchKeywords=e.target.value}}
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
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
    </div>
    );
  }
}

export default ListApisByAppId;
