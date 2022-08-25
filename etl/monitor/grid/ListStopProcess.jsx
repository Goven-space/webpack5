import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ProcessMonitor from '../../process/ProcessMonitor';
import ShowPorcessInstanceInfo from './ShowPorcessInstanceInfo';
import AjaxSelect from '../../../core/components/AjaxSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.listProcess;
const DELETE_URL=URI.ETL.MONITOR.deleteProcessInstance;
const LIST_LOGDB=URI.ETL.MONITOR.listETLLogDbName;

class ListStopProcess extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.runType=this.props.runType; //0表示全部结束的
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?runType="+this.runType+"&applicationId="+this.applicationId;
    this.searchKeyWords=''; //要搜索的关键字
    this.startDate='';
    this.endDate='';
    this.transactionId='';
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
      collapsed:false,
      action:'',
      title:'已结束流程',
      logDbName:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.runType!==nextProps.runType){
      this.runType=nextProps.runType;
      this.url=LIST_URL+"?runType="+this.runType+"&applicationId="+this.applicationId;
      this.state.title=nextProps.title;
      this.state.pagination.current=1;
      this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    if(this.searchKeyWords!==''){
      this.search(this.searchKeyWords,pagination);
    }else{
      this.loadData(pagination,filters,sorter);
    }
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.addTabPane('New','新增流程');
    }else if(action==="Process"){
      this.addTabPane('Process','流程监控:'+record.pNodeName,record);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
      let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
      GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    let url=DELETE_URL+"?logDbName="+this.state.logDbName;
    GridActions.deleteData(this,url);
  }

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }
  onTransactionIdChange=(event)=>{
    this.transactionId=event.target.value;
  }


  showConfirm=()=>{
      var self=this;
      confirm({
      title: '你确定要删除选中的流程和流程产生的日记数据吗?',
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
      let tabActiveKey = record.id;
      let content;
      if(id==='Process'){
        content=(<ProcessMonitor logDbName={this.state.logDbName} processId={record.processId} transactionId={record.transactionId} appId={this.appId}  close={this.closeCurrentTab} />);
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
  search=(value,pagination=this.state.pagination)=>{
    this.searchKeyWords=value;
    let filters={};
    let sorter={};
    let searchFilters={"runServerId":value,"pNodeName":value,"transactionId":value};
    sorter={"order":'descend',"field":'startTime'};
    let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  logDbChange=(dbName)=>{
    this.state.logDbName=dbName;
    this.setState({logDbName:dbName});
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流程状态',
        dataIndex: 'resultCode',
        width:'8%',
        render: (text,record) => {
          if(text===1){
            if(record.processTotalFailedCount===0){
              return <Tag color='#87d068'>成功</Tag>
            }else{
              return <Tag color='orange'>警告</Tag>
            }
          }else{
            return <Tag color='#f50'>失败</Tag>
          }
        }
      },{
        title: '流程名称',
        dataIndex: 'pNodeName',
        width: '18%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '流程监控',
          dataIndex: 'process',
          width: '8%',
          render: (text,record) => {return <a onClick={this.onActionClick.bind(this,"Process",record)}>流程监控</a>}
      },{
          title: '传输成功/失败',
          dataIndex: 'processTotalSuccessCount',
          width:'12%',
          render: (text,record) => {
              return text+"/"+record.processTotalFailedCount;
          }
      },{
      title: '服务器Id',
      dataIndex: 'runServerId',
      width:'8%'
    },{
    title: '开始时间',
    dataIndex: 'startTime',
    width:'15%',
    sorter:true,
  },{
      title: '结束时间',
      dataIndex: 'endTime',
      width:'15%',
      sorter: true
    },{
      title: '总耗时(秒)',
      dataIndex: 'totalRunTime',
      width:'10%',
      render: (text,record) => {
          return text/1000;
      }
    }];

    const expandedRow=(record)=>{
      return (<ShowPorcessInstanceInfo logDbName={this.state.logDbName} record={record} />);
    }

    return (
      <div>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab={this.state.title} key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={24} >
                <ButtonGroup>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                  <span style={{float:'right'}} >
                  日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='value' textId='text' options={{placeholder:'选择日志库',showSearch:true,style:{minWidth:'200px'} }} />{' '}
                  开始:<DatePicker  onChange={this.onStartDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="开始时间" />{' '}
                  结束:<DatePicker  onChange={this.onEndDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="结束时间" />{' '}
                  搜索:<Search
                   placeholder="事务Id|流程名称"
                   style={{ width: 220 }}
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
      </div>
    );
  }
}

export default ListStopProcess;
