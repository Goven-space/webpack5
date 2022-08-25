import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ProcessMonitor from '../../process/ProcessMonitor';
import ShowPorcessInstanceInfo from './ShowPorcessInstanceInfo';

//已归档流程

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.PROCESS_HISTORY.page;
const DELETE_URL=URI.ESB.PROCESS_HISTORY.delete;

class ListProcessHistory extends React.Component {
  constructor(props) {
    super(props);
    this.applicationId=this.props.applicationId;
    this.processId=this.props.processId||'';
    this.url=LIST_URL+"?applicationId="+this.applicationId+"&processId="+this.processId;
    this.searchKeyWords=''; //要搜索的关键字
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
    if(action==="Process"){
      this.addTabPane('Process','流程监控:'+record.pNodeName,record);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    if(this.searchKeyWords==='' && this.startDate=='' && this.endDate==''){
      GridActions.loadData(this,this.url,pagination,filters,sorter);
    }else{
      this.search(this.searchKeyWords,pagination);
    }
  }

  deleteData=(argIds)=>{
    // let ids=this.state.selectedRows.map((item)=>{return item.id;}).join(",");
    GridActions.deleteData(this,DELETE_URL);
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
        content=(<ProcessMonitor processId={record.processId} transactionId={record.transactionId} appId={this.appId}  close={this.closeCurrentTab} />);
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

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    if(value!=='' && value!==undefined){
      searchFilters={"pNodeName":value,"transactionId":value};
    }
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate;
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '运行结果',
        dataIndex: 'resultCode',
        width:'8%',
        render: (text,record) => {
          if(text===1){
            return <Tag color='#87d068'>成功</Tag>
          }else if(text===3){
            return <Tag color='orange'>警告</Tag>
          }else{
            return <Tag color='#f50'>失败</Tag>
          }
        }
      },{
        title: '流程名称',
        dataIndex: 'pNodeName',
        width: '20%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '流程图监控',
          dataIndex: 'process',
          width: '10%',
          render: (text,record) => {return <a onClick={this.onActionClick.bind(this,"Process",record)}>流程监控</a>}
      },{
      title: '服务器Id',
      dataIndex: 'runServerId',
      width:'10%',
      sorter:true,
    },{
    title: '事务Id',
    dataIndex: 'transactionId',
    width:'17%',
    sorter:true,
  },{
      title: '开始时间',
      dataIndex: 'startTime',
      width:'13%',
      ellipsis: true,
      sorter: true
    },{
      title: '总耗时',
      dataIndex: 'totalRunTime',
      width:'8%',
      sorter: true
    }];

    const expandedRow=(record)=>{
      return (
          <ShowPorcessInstanceInfo record={record} processId={record.processId} transactionId={record.transactionId} />
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
            <TabPane tab="已归档流程" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={6} >
                <ButtonGroup>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={18}>
                 <span style={{float:'right'}} >
                   开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
                   结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
                   关键字:<Search
                    placeholder="流程名称或事务Id"
                    style={{ width: 260 }}
                    onSearch={value => this.search(value)}
                    onChange={e=>{this.searchKeyWords=e.target.value}}
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

export default ListProcessHistory;
