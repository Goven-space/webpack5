import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ProcessMonitor from '../../process/ProcessMonitor';
import ShowPorcessInstanceInfo from './ShowPorcessInstanceInfo';

//已审批过的流程

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.listProcess;
const DELETE_URL=URI.ETL.MONITOR.deleteProcessInstance;
const RUN_URL=URI.ETL.MONITOR.approveProcessInstance;

class ListApproverProcessEnd extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?runType=8&applicationId="+this.applicationId; //8表示已审批流程
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
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

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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
        content=(<ProcessMonitor status='current' processId={record.processId} transactionId={record.transactionId} appId={this.appId}  close={this.closeCurrentTab} />);
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
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"pNodeName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
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
          if(text===1){
            return <Tag color='#87d068'>成功</Tag>
          }else if(record.compensateFlag===1){
            return <Tag color='blue'>待补偿</Tag>
          }else if(text===2){
            return <Tag color='orange'>等待</Tag>
          }else{
            return <Tag color='#f50'>运行中</Tag>
          }
        }
      },{
        title: '流程名称',
        dataIndex: 'pNodeName',
        width: '20%',
        sorter:true,
      },{
          title: '传输成功/失败',
          dataIndex: 'processTotalSuccessCount',
          width:'12%',
          render: (text,record) => {
              return text+"/"+record.processTotalFailedCount;
          }
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
      width:'20%'
    },{
      title: '开始时间',
      dataIndex: 'startTime',
      width:'15%',
      sorter: true
    }];

    const expandedRow=(record)=>{
      return (<ShowPorcessInstanceInfo record={record} />);
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
            <TabPane tab="已审批任务" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除流程</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="流程名称"
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
      </div>
    );
  }
}

export default ListApproverProcessEnd;
