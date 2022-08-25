import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewMqProducer from '../form/NewMqProducer';
import ListMqRecevieMessage from './ListMqRecevieMessage';
import NewMqService from '../form/NewMqService';
import ListApisByFilters from '../../designer/designer/grid/ListApisByFilters';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.MQBUS.MQ_Producer_MESSAGE.list;
const DELETE_URL=URI.MQBUS.MQ_Producer_MESSAGE.delete;
const exporConfigUrl=URI.MQBUS.MQ_Producer_MESSAGE.exportConfig;
const START_URL=URI.MQBUS.CORE_DATASOURCE_MONITOR.start;
const CLOSE_URL=URI.MQBUS.CORE_DATASOURCE_MONITOR.close;

class ListMqProducer extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.categoryId=this.props.categoryId;
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
      this.addTabPane('Edit','修改:'+record.configName,record);
    }else if(action==="New"){
      this.addTabPane('New','新增发布者');
    }
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exporConfigUrl+"?ids="+ids;
    window.location.href=url;
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL;
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
      if(id==='New'){
        content=(<NewMqProducer id="" appId={this.props.appId}  close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        content=(<NewMqProducer id={record.id} appId={this.props.appId}  close={this.closeCurrentTab} />);
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

  start=(id)=>{
      this.setState({loading:true});
      let url=START_URL;
      AjaxUtils.post(url,{id:id},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
            this.loadData();
          }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }

  close=(id)=>{
      this.setState({loading:true});
      let url=CLOSE_URL;
      AjaxUtils.post(url,{id:id},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }

  newService=(record)=>{
    this.setState({currentRecord:record,visible: true,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
    {
      title: '消息名称',
      dataIndex: 'configName',
      width: '30%',
      sorter:true,
      render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
    },{
          title: '数据源',
          dataIndex: 'dataSourceId',
          width: '15%',
          sorter:true,
    },{
          title: '主题',
          dataIndex: 'topic',
          width: '10%',
          sorter:true,
    },{
          title: '创建者',
          dataIndex: 'creator',
          width: '10%',
          sorter:true,
    },{
          title: '最后修改',
          dataIndex: 'editTime',
          width: '15%',
          sorter:true,
    },{
      title: '调试',
      dataIndex: 'debug',
      width:'8%',
      render: (text,record) => {
        if(text==='true'){
          return <Tag color='red' >是</Tag>
        }else if(text==='false'){
          return <Tag color='#ccc'>否</Tag>
        }
      }
    },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
                return (<span>
                  <a onClick={this.onActionClick.bind(this,'Edit',record)} >修改</a>
                  <Divider type="vertical" />
                  <a onClick={this.newService.bind(this,record)} >创建API</a>
                </span>);
        }
    }];

    const expandedRow=(record)=>{
      return (
        <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
          <ListApisByFilters id={record.id} appId={this.appId} filters={{connecterId:[record.id]}} close={this.closeModal} />
        </div>
        );
    }

    return (
      <span>
            <Modal key={Math.random()} title='创建API' maskClosable={false}
                visible={this.state.visible}
                width='750px'
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewMqService close={this.closeModal} appId={this.appId} record={currentRecord}  />
            </Modal>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="消息发布列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增发布者</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>

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
                expandedRowRender={expandedRow}
              />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </span>
    );
  }
}

export default ListMqProducer;
