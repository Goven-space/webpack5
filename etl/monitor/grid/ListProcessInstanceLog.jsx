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
const END_URL=URI.ETL.MONITOR.endProcessInstance;
const STOP_URL=URI.ETL.MONITOR.stopProcessInstanceThread;
const LIST_LOGDB=URI.ETL.MONITOR.listETLLogDbName;

//流程运行记录

class ListProcessInstanceLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId||'*';
    this.runType=this.props.runType||"2"; //2表示全部包括成功和失败的
    this.processId=this.props.processId; //按指定流程显示
    this.url=LIST_URL+"?runType="+this.runType+"&applicationId="+this.applicationId+"&processId="+this.processId; //流程id
    this.startDate='';
    this.endDate='';
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
      action:'',
      logDbName:'',
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
    GridActions.deleteData(this,url,argIds);
  }

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }

  endProcessStatus=(argIds)=>{
    var self=this;
    confirm({
    title: '把异常停止的流程标记为结束状态!',
    content: '注意:线程正在执行的流程执行本操作不会结束流程的运行!',
    onOk(){
        if(self.state.selectedRowKeys.length===0){
          AjaxUtils.showError("请选择一个流程再执行本操作!");
        }else{
          let ids=self.state.selectedRowKeys.join(",");
          let postData={"ids":ids};
          self.setState({loading:true});
          AjaxUtils.post(END_URL,postData,(data)=>{
            self.setState({loading:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              AjaxUtils.showInfo("成功结束("+data.msg+")条流程!");
              self.loadData();
            }
          });
        }
    },
    onCancel() {},
    });
  }

  endProcessThread=(argIds)=>{
    if(this.state.selectedRowKeys.length===0){
      AjaxUtils.showError("请选择一个流程再执行本操作!");
    }else{
      let ids=this.state.selectedRowKeys.join(",");
      // let ids=this.state.selectedRows.map((item)=>{return item.id;}).join(",");
      let postData={"ids":ids};
      this.setState({loading:true});
      AjaxUtils.post(STOP_URL,postData,(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("成功发送("+data.msg+")条流程的线程停止命令!");
          this.loadData();
        }
      });
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '你确定要删除选中的任务和任务产生的日记数据吗?',
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
        content=(<ProcessMonitor logDbName={this.state.logDbName} status={record.currentStatus} processId={record.processId} transactionId={record.transactionId} appId={this.appId}  close={this.closeCurrentTab} />);
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
    let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
    GridActions.loadData(this,url,this.state.pagination,{},{},{});
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
        title: '任务状态',
        dataIndex: 'resultCode',
        width:'8%',
        render: (text,record) => {
          if(text===1){
            if(record.processTotalFailedCount===0){
              return <Tag color='#87d068'>成功</Tag>
            }else{
              return <Tag color='orange'>警告</Tag>
            }
          }else if(record.currentStatus==='current'){
            return <Tag color='#f50'>未结束</Tag>
          }else{
            return <Tag color='#f50'>失败</Tag>
          }
        }
      },{
        title: '任务名称',
        dataIndex: 'pNodeName',
        width: '20%',
        sorter:true,
      },{
          title: '图形监控',
          dataIndex: 'process',
          width: '10%',
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
          width: '10%',
      },{
      title: '开始时间',
      dataIndex: 'startTime',
      width:'15%',
      sorter: true
    },{
      title: '结束时间',
      dataIndex: 'endTime',
      width:'15%',
      sorter: true
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
            <TabPane tab="任务运行记录" key="home" style={{padding:'0px'}}>
            <div style={{marginBottom:'5px'}}>
                <ButtonGroup>
                  <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"注意:只能结束本服务器运行的线程！","偿试把执行本流程的线程停止执行,如果重启了应用服务器请不要执行本操作!可直接标记为结束即可!",this.endProcessThread)}  disabled={!hasSelected} icon="poweroff"   >偿试停止</Button>
                  <Button  type="ghost" onClick={this.endProcessStatus}  disabled={!hasSelected} icon="check"   >结束</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                  日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='value' textId='text' options={{placeholder:'选择日志库',showSearch:true,style:{minWidth:'200px'} }} />{' '}
                  开始:<DatePicker  onChange={this.onStartDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
                  结束:<DatePicker  onChange={this.onEndDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
                  <Button  type="primary" onClick={this.search} icon="search" >查询</Button>{' '}
             </div>
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

export default ListProcessInstanceLog;
