import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import NewRdbsDataSource from '../form/NewRdbsDataSource';
import NewMongoDataSource from '../form/NewMongoDataSource';
import NewRedisDataSource from '../form/NewRedisDataSource';
import NewKafkaDataSource from '../form/NewKafkaDataSource';
import NewHBaseDataSource from '../form/NewHBaseDataSource';
import NewElasticsearch from '../form/NewElasticsearch';
import NewJdbcDriverDataSource from '../form/NewJdbcDriverDataSource';
import NewMqttDataSource from '../form/NewMqttDataSource';
import NewSapConn from '../form/NewSapConn';
import NewJmsDataSource from '../form/NewJmsDataSource';
import NewRabbitMQDatasource from '../form/NewRabbitMQDataSource';
import NewRocketMq from '../form/NewRocketMq';
import NewRocketMqLocal from '../form/NewRocketMqLocal';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DATASOURCE.list;
const DELETE_URL=URI.CORE_DATASOURCE.delete;
const ConnectUrl=URI.CORE_DATASOURCE.connect;
const TestConnectUrl=URI.CORE_DATASOURCE.testConnect;
const exporConfigUrl=URI.CORE_DATASOURCE.exportConfig;
const copyConfigUrl=URI.CORE_DATASOURCE.copy;

class ListDataSource extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.categoryId=this.props.categoryId;
    this.menuClick=this.props.memuClick;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      action:''
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.categoryId!==nextProps.categoryId){
      this.categoryId=nextProps.categoryId;
      this.state.pagination.current=1;
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
    if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','修改:'+record.configId,record);
    }
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exporConfigUrl+"?ids="+ids;
    window.open(url);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL;
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '删除确认?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
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
      let tabActiveKey = record===undefined?'new':record.id;
      let content;
      let docid=record===undefined?'':record.id;
      console.log(id);
      console.log(record);
      if(id==='NewRdbs'  || (id==='Edit' && record!=null && (record.configType==='RDB' || record.configType==='Driver'))  ){
        if(record.configType==='RDB'){
          content=(<NewRdbsDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
        }else{
          content=(<NewJdbcDriverDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
        }
      }else if(id==='NewMongoDb'  || (id==='Edit' && record!=null && record.configType==='MongoDB') ){
        content=(<NewMongoDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='NewRedis'  || (id==='Edit' && record!=null && record.configType==='Redis') ){
        content=(<NewRedisDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='NewKafka' || (id==='Edit' && record!=null && record.configType==='Kafka') ){
        content=(<NewKafkaDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='NewHBase' || (id==='Edit' && record!=null && record.configType==='HBase') ){
        content=(<NewHBaseDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='Elasticsearch' || (id==='Edit' && record!=null && record.configType==='Elasticsearch') ){
        content=(<NewElasticsearch id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='mqtt' || (id==='Edit' && record!=null && record.configType==='mqtt') ){
        content=(<NewMqttDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='SAP' || (id==='Edit' && record!=null && record.configType==='SAP') ){
        content=(<NewSapConn id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='jms' || (id==='Edit' && record!=null && record.configType==='jms') ){
        content=(<NewJmsDataSource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='RabbitMQ' || (id==='Edit' && record!=null && record.configType==='RabbitMQ') ){
        content=(<NewRabbitMQDatasource id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='rocketmq' || (id==='Edit' && record!=null && record.configType==='rocketmq') ){
        content=(<NewRocketMq id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='RocketMQ_Local' || (id==='Edit' && record !== null && record.configType === "RocketMQ_Local")){
        content=(<NewRocketMqLocal id={docid} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
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

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL;
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  testConnect=(id)=>{
      this.setState({loading:true});
      let url=TestConnectUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }

  //复制链接
   copyDateSource=(id)=>{
     this.setState({loading:true});
     AjaxUtils.post(copyConfigUrl,{ids:id},(data)=>{
         this.setState({loading:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           AjaxUtils.showInfo("成功复制("+data.msg+")个数据源!");
           this.loadData();
         }
     });
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
            title: '链接类型',
            dataIndex: 'configType',
            width: '10%',
            sorter:true,
            render: (text,record) => {
              if(text==='RDB'){
                return <Tag color='cyan' >链接池</Tag>
              }else if(text==='Driver'){
                return <Tag color='orange' >短链接</Tag>
              }else{
                return <Tag color='blue'>{text}</Tag>
              }
            }
      },{
      title: '数据源名称',
      dataIndex: 'configName',
      width: '15%',
      sorter:true,
      ellipsis: true,
      render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
    },{
          title: '数据源Id',
          dataIndex: 'configId',
          width: '15%',
          sorter:true,
    },{
      title: '修改者',
      dataIndex: 'editor',
      width:'10%',
    },{
      title: '修改时间',
      dataIndex: 'editTime',
      width:'13%',
      sorter: true,
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'10%',
      ellipsis: true,
    },{
      title: '当前状态',
      dataIndex: 'state',
      width:'10%',
      sorter: true,
      render: (text,record) => {
        if(text==='1'){
          return <Tag >未链接</Tag>
        }else if(text==='2'){
          return <Tag color='#87d068'>链接中</Tag>
        }else{
          return <Tag>停用</Tag>
        }
      }
    },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
                return <span>
                    <a onClick={AjaxUtils.showConfirm.bind(this,"测试链接","测试数据源链接",this.testConnect.bind(this,record.id))} >测试链接</a>
                    <Divider type="vertical" />
                    <a onClick={this.onActionClick.bind(this,'Edit',record)} >修改</a>
                    <Divider type="vertical" />
                    <a onClick={AjaxUtils.showConfirm.bind(this,"复制链接","确认要复制本数据源吗?",this.copyDateSource.bind(this,record.id))} >复制</a>
                  </span>;
              }
      },];


    return (
      <span>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="数据源列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.menuClick.bind(this,'new',this.categoryId)} icon="plus"  >新建数据源</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出数据源','注意:数据源的分类并不会随着数据源配置一起导出!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="配置Id|说明"
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
              />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </span>
    );
  }
}

export default ListDataSource;
