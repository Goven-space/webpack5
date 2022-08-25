import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ProcessMonitor from '../../process/ProcessMonitor';
import ListNodeInstanceLog from './ListNodeInstanceLog';

import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.CORE_ESB_MONITOR.listProcess;
const DELETE_URL=URI.ESB.CORE_ESB_MONITOR.deleteProcessInstance;
const END_URL=URI.ESB.CORE_ESB_MONITOR.endProcessInstance;

class ListProcessInstanceLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.runType=this.props.runType||"2"; //2表示全部包括成功和失败的
    this.processId=this.props.processId; //按指定流程显示
    this.url=LIST_URL+"?runType="+this.runType+"&processId="+this.processId; //流程id
    this.startDate='';
    this.endDate='';
    this.dateFilters = ''
    this.sorter = {};
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
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} : {};
    this.loadData(pagination);
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
    this.dateFilters = '';
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    let url = this.url + this.dateFilters;
    const filters = {};
    GridActions.loadData(this,url,pagination,filters,this.sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
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
        content=(<ProcessMonitor status={record.currentStatus} compensateFlag={record.compensateFlag} processId={record.processId} transactionId={record.transactionId} appId={this.appId}  close={this.closeCurrentTab} />);
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
  search=()=>{
    this.dateFilters=this.startDate || this.endDate ? "&startTime="+this.startDate+"&endTime="+this.endDate : '';
    this.loadData(this.defaultPagination);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '状态',
        dataIndex: 'resultCode',
        width:'8%',
        render: (text,record) => {
          if(record.currentStatus==='current'){
            if(record.compensateFlag==1){
              return <Tag color='blue'>待补偿</Tag>;
            }else{
              return <Tag color='#f50'>未结束</Tag>;
            }
          }else if(text===1){
            return <Tag color='#87d068'>成功</Tag>;
          }else if(record.compensateFlag===1){
            return <Tag color='blue'>待补偿</Tag>;
          }else if(text===2){
            return <Tag color='blue'>等待</Tag>;
          }else if(text===3){
            return <Tag color='orange'>警告</Tag>;
          }else{
            return <Tag color='#f50'>失败</Tag>;
          }
        }
      },{
        title: '流程名称',
        dataIndex: 'pNodeName',
        width: '18%',
        sorter:true,
        ellipsis: true,
      },{
          title: '流程图监控',
          dataIndex: 'process',
          width: '10%',
          render: (text,record) => {return <a onClick={this.onActionClick.bind(this,"Process",record)}>流程监控</a>}
      },{
          title: '服务器Id',
          dataIndex: 'runServerId',
          width: '10%',
      },{
      title: '事务Id',
      dataIndex: 'transactionId',
      ellipsis: true,
      width:'18%'
    },{
      title: '开始时间',
      dataIndex: 'startTime',
      width:'15%',
      sorter: true,
      ellipsis: true
    },{
      title: '结束时间',
      dataIndex: 'endTime',
      width:'15%',
      ellipsis: true,
      sorter: true
    },{
      title: '耗时',
      dataIndex: 'totalRunTime',
      width:'8%',
      sorter: true,
      render: (text,record) => {return <Tag color='green'>{text}ms</Tag>}
    }];

    const expandedRow=(record)=>{
      return (
        <Card bordered={true} title='流程详细运行步骤' >
          <ListNodeInstanceLog processId={record.processId} transactionId={record.transactionId} />
        </Card>
        );
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
            <TabPane tab="流程运行记录" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={10} >
                <ButtonGroup>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={14}>
                  开始时间:<DatePicker  onChange={this.onStartDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
                  结束时间:<DatePicker  onChange={this.onEndDateChange}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
                  <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
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

export default ListProcessInstanceLog;
