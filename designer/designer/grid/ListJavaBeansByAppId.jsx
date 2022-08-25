import React, { PropTypes } from 'react';
import {Card, Tabs,Table,Row, Col,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Popover,Input,Badge,Layout,Select} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewBean from '../form/NewBean';
import EditJavaBeanCode from '../form/components/EditJavaBeanCode';
import ListServicesByControllerBeanId from './ListApisByFilters';
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

//新版本的

const { Sider, Content } = Layout;
const Search = Input.Search;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const LIST_URL=URI.LIST_CORE_BEANS.list;
const DELETE_URL=URI.LIST_CORE_BEANS.delete;
const COPY_URL=URI.LIST_CORE_BEANS.copy;
const NEW_URL=URI.LIST_CORE_BEANS.new;
const SCANBEAN_URL=URI.LIST_CORE_BEANS.scanJavaBeanUrl;
const exportBeanConfig=URI.LIST_CORE_BEANS.exportBeanConfig;

class ListJavaBeansByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.beanType=this.props.beanType||'',
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      collapsed:false,
      beanType:''
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
      if(nextProps.beanType!==this.beanType){
          this.beanType=nextProps.beanType;
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
    if(action==="New"){
      this.addTabPane('New','注册JavaBean');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"属性:"+record.beanId,record);
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"代码:"+record.beanId,record);
    }
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportBeanConfig, { ids: ids });
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

  //扫描所有java bean并自动注册
  scanAllJavaBean=()=>{
    let url=SCANBEAN_URL+"?appId="+this.appId;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      AjaxUtils.showInfo(data.msg);
      this.loadData();
      this.setState({loading:false});
    });
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的服务
    if(this.beanType!=='' && this.beanType!=='AllJavaBean'){
      filters.beanType=[this.beanType];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"beanName":value,"beanId":value};
    let appIdArray = [this.props.appId];
    filters.appId=appIdArray; //过虑只显示本应用的服务
    let url=this.url;
    this.searchFilters=searchFilters;
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
      if(id==='New'){
        //新增
        content=(<NewBean appId={this.props.appId} beanType={this.beanType} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewBean appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditCode'){
        //设置
        tabActiveKey="EditCode_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<EditJavaBeanCode  beanId={record.beanId} close={this.closeCurrentTab}/>);
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
  changeCategoryId=(beanType)=>{
    this.beanType=beanType;
    this.state.beanType=beanType;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '3px',}
    const columns=[{
      title: 'BeanId',
      dataIndex: 'beanId',
      width: '20%',
      sorter: true,
      render:(text,record)=>{return <Popover content={record.classPath} title="类路径" >{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></Popover>}
    },{
      title: '名称',
      dataIndex: 'beanName',
      width: '22%'
    },{
        title: '类型',
        dataIndex: 'beanType',
        width:'10%'
    },{
        title: '创建者',
        dataIndex: 'creatorName',
        width:'10%'
    },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
        sorter: true,
    },{
        title: '代码',
        dataIndex: 'code',
        width: '8%',
        render:(text,record)=>{
          return (<a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />代码</a>);
        }
    },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'8%',
      render: (text,record) => {
        return <Dropdown
            overlay={<Menu style={{width:60,textAlign:'center'}}>
              <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
            </Menu>}
            trigger={['click']}
          >
          <a className="ant-dropdown-link" href="#">
            操作 <Icon type="down" />
          </a>
        </Dropdown>}
    },];

    const expandedRow=(record)=>{
      return <Card><ListServicesByControllerBeanId  appId={this.appId} filters={{beanId:[record.beanId]}}/></Card>;
    }

    return (
      <Tabs
        onChange={this.onTabChange}
        onEdit={this.onTabEdit}
        type="editable-card"
        activeKey={this.state.tabActiveKey}
        animated={false}
        hideAdd={true}
      >
      <TabPane tab="Java Bean列表" key="home" style={{padding:'0px'}}>
            <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                  <Button  type="ghost" onClick={this.scanAllJavaBean} icon="scan"  >重新扫描</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   类型:<Select value={this.state.beanType} onChange={this.changeCategoryId} >
                     <Option value="" >所有JavaBean列表</Option>
                     <Option value="Controller">Controller(提供Rest服务)</Option>
                     <Option value="Service">Service(业务逻辑层)</Option>
                     <Option value="Dao">DaoBean(数据持久层)</Option>
                     <Option value="Model">ModelBean(数据模型)</Option>
                     <Option value="View">ViewBean(视图展示)</Option>
                     <Option value="Validate">ValidateBean(API输入参数校验)</Option>
                     <Option value="Event">EventBean(被触发的事件)</Option>
                     <Option value="ControlStrategy">ControlStrategy(服务控制策略)</Option>
                     <Option value="Plugin">Plugin(插件)</Option>
                     <Option value="LoadBalance">LoadBalance(负载均衡策略)</Option>
                     <Option value="Scheduler">SchedulerBean(定时作业)</Option>
                     <Option value="Component">其他JavaBean</Option>
                   </Select>
                   {' '}搜索:<Search
                    placeholder="搜索beanId或名称"
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
                dataSource={rowsData}
                rowSelection={rowSelection}
                columns={columns}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
              />
      </TabPane>
      {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
    </Tabs>
    );
  }
}

export default ListJavaBeansByAppId;
