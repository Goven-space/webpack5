import { Button, Col, Divider, Icon, Input, Layout, Modal, Popover, Row, Table, Tabs, Tag } from 'antd';
import React from 'react';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import EditJavaBeanCode from '../../designer/designer/form/components/EditJavaBeanCode';
import NewBean from '../form/NewBean';

//所有控制策略java beans

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

class ListBeansByInterface extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.interface=this.props.interface;
    this.beanType=this.props.beanType;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      beanType:'',
      collapsed:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.interface=nextProps.interface;
    this.state.pagination.current=1;
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.addTabPane('New','新增插件');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"属性:"+record.beanId,record);
    }else if(action==="IOC"){
      this.addTabPane('IOC',"依赖注入:"+record.beanId,record);
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"代码:"+record.beanId,record);
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确定要删除选中的插件吗？',
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
    filters.interfaces=[this.interface];
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"beanName":value,"beanId":value};
    filters.interfaces=[this.interface];
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
        content=(<NewBean interface={this.interface} beanType={this.beanType} appId={this.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewBean  appId={this.appId} beanType={this.beanType} id={record.id} closeTab={this.closeCurrentTab}/>);
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

 onMenuSelected=(selectedKeys)=>{
    let key=selectedKeys[0];
    this.state.beanType=key;
    this.state.pagination.current=1;
    this.loadData();
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportBeanConfig, { ids: ids });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '3px',}
    const columns=[{
      title: '名称',
      dataIndex: 'beanName',
      width: '30%'
    },{
      title: 'BeanId',
      dataIndex: 'beanId',
      width: '25%',
      sorter: true,
      render:(text,record)=>{return <Popover content={record.classPath} title="类路径" >{text}</Popover>}
    },{
        title: '创建者',
        dataIndex: 'creatorName',
        width:'15%',
        render:(text,record)=>{if(text==''||text==undefined){return '系统'}else{return text;}}
    },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'15%'
    },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'15%',
      render: (text,record) => {
              return <span>
                  <a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />代码</a>
                  <Divider type="vertical" />
                  <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
                  <Divider type="vertical" />
                  <a onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</a>
                </span>;
      }
    },];

    let contentStyle="";
    if(!this.state.collapsed){
      contentStyle={left:'-1px',minHeight:'500px',padding: '0px 5px',borderLeft:'1px solid #e9e9e9',position:'relative'};
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
      <TabPane tab="网关插件列表" key="home" style={{padding:'0px'}}>
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
                   <Search
                    placeholder="搜索beanId或名称"
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

export default ListBeansByInterface;
