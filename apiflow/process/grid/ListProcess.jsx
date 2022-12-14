import React from 'react';
import ReactDOM from 'react-dom';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewProcess from '../form/NewProcess';
import ProcessDesigner from '../ProcessDesigner';
import ListProcessInstanceLog from '../../monitor/grid/ListProcessInstanceLog';
import ListProcessHistory from '../../monitor/grid/ListProcessHistory';
import NewProcessService from './NewProcessService';
import ListServicesByProcessId from '../../../designer/designer/grid/ListApisByFilters';
import ListNodeLastRunTime from '../../monitor/grid/ListNodeLastRunTime';
import ShowProcessLog from '../../monitor/form/ShowProcessLog';
import ListJoinApis from '../../api/ListJoinApis';
import ShowProcessModelCache from '../../monitor/form/ShowProcessModelCache';
import ListProcessVersion from './ListProcessVersion';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.CORE_ESB_CONFIG.list;
const DELETE_URL=URI.ESB.CORE_ESB_CONFIG.delete;
const RUN_URL=URI.ESB.CORE_ESB_CONFIG.run;
const COPY_URL=URI.ESB.CORE_ESB_CONFIG.copy;
const startTaskJobUrl=URI.ESB.CORE_ESB_CONFIG.start;
const stopTaskJobUrl=URI.ESB.CORE_ESB_CONFIG.stop;
const exportProcessUrl=URI.ESB.CORE_ESB_CONFIG.exportProcess;
const lockedProcessUrl=URI.ESB.CORE_ESB_CONFIG.lockedProcess;

class ListProcess extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?applicationId="+this.applicationId;
    this.userId=AjaxUtils.getCookie("userId");
    this.sorter = {};
    this.searchFilters = {};
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.state={
      pagination:{...this.defaultPagination},
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
      width:500,
      action:''
    }
  }

  componentDidMount(){
      this.updateSize();
      this.loadData();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-120;
    this.setState({width:width});
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.categoryId!==nextProps.categoryId){
      this.categoryId=nextProps.categoryId;
      this.searchFilters = {};
      this.loadData(this.defaultPagination);
    }
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
      this.addTabPane('New','????????????','','NewProcess');
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','??????:'+record.configName,record);
    }else if(action==="startTaskJob"){
      this.startTaskJob(record.processId);
    }else if(action==="stopTaskJob"){
      this.stopTaskJob(record.processId);
    }else if(action==="Process"){
      this.addTabPane('Process','??????:'+record.configName,record);
    }
  }

  lockedProcess=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(lockedProcessUrl,{ids:ids},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo(data.msg);
      }
      this.loadData();
    });
  }

  startTaskJob=(processId)=>{
    this.setState({loading:true});
    AjaxUtils.post(startTaskJobUrl,{processId:processId},(data)=>{
      if(data.state){
        AjaxUtils.showInfo(data.msg);
      }else{
        AjaxUtils.showError(data.msg);
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  stopTaskJob=(processId)=>{
    this.setState({loading:true});
    AjaxUtils.post(stopTaskJobUrl,{processId:processId},(data)=>{
      //0???????????????????????????,1??????????????????,2???????????????????????????,3???????????????????????????,4????????????????????????
      if(data.state===true){
        AjaxUtils.showInfo(data.msg);
      }else{
        AjaxUtils.showError(data.msg);
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {};
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination)=>{
      // console.log("page.this.categoryId==="+this.categoryId);
    let filters = {}
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,this.url,pagination,filters,this.sorter,this.searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '??????????????????????????????????',
      content: '??????:?????????????????????!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  //Tab????????????
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab?????????????????????
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //??????X??????????????????Tab
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
  //?????????????????????Tab?????????Grid??????
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //????????????Tab
  addTabPane=(id,name,record,tabKey)=>{
      const panes = this.state.panes;
      let tabActiveKey = tabKey||record.id;
      let content;
      if(id==='New'){
        content=(<NewProcess id="" appId={this.props.appId} applicationId={this.applicationId} categoryId={this.categoryId} close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        content=(<NewProcess id={record.id} appId={this.props.appId} applicationId={this.applicationId}  close={this.closeCurrentTab} />);
      }else if(id==='Process'){
        content=(<ProcessDesigner processId={record.processId} applicationId={this.applicationId} appId={this.appId}  close={this.closeCurrentTab}  />);
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

  //??????ajax??????????????????
  search=(value)=>{
    this.searchFilters = value ? {"configId":value,"configName":value,"processId":value} : {};
    this.loadData(this.defaultPagination);
  }

  runProcess=(processId)=>{
    this.setState({loading:true});
    AjaxUtils.post(RUN_URL,{processId:processId},(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
        }
    });
  }

  copyProcess=(processId)=>{
    this.setState({loading:true});
    AjaxUtils.post(COPY_URL,{processId:processId},(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("??????????????????!");
          this.loadData();
        }
    });
  }

  //????????????
  exportProcess=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exportProcessUrl+"?ids="+ids;
    window.location.href=url;
  }

  showModal=(record)=>{
    this.setState({visible: true,currentRecord:record});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
    this.setState({visible: false});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '????????????',
        dataIndex: 'configName',
        width: '20%',
        sorter:true,
        ellipsis: true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '????????????',
          dataIndex: 'process',
          width: '8%',
          ellipsis: true,
          render: (text,record) => {
            if(record.lockedUserId==='' || record.lockedUserId===undefined){
              return <a onClick={this.onActionClick.bind(this,"Process",record)}>????????????</a>
            }else if(record.lockedUserId===this.userId){
              return <a onClick={this.onActionClick.bind(this,"Process",record)} title={record.lockedUserId+'??????!'} ><Icon type='lock' />????????????</a>
            }else{
              return <span><Icon type='lock' />{record.lockedUserId}??????</span>;
            }
          }
      },{
        title: '?????????',
        dataIndex: 'creatorName',
        width: '8%',
        sorter:true,
      },{
          title: '????????????',
          dataIndex: 'editTime',
          width: '13%',
          sorter: true,
      },{
      title: '????????????',
      dataIndex: 'state',
      width:'12%',
      ellipsis: true,
      render: (text,record) => {
        if(text==='1'){return record.expression}
        else if(text==='0'){return <Tag>??????</Tag>}
        else if(text==='2'){return <Tag color='blue'>API</Tag>}
      }
    },{
      title: '??????',
      dataIndex: 'runingFlag',
      width: '17%',
      render:(text,record)=>{
        if(text){
          return "????????????:"+record.nextRunTime;
        }else{
          if(record.state==='1'){
            return (<Tag color="red" >?????????</Tag>)
          }else{
            if(record.serviceCount>0){
              return (<Tag color="green" >?????????</Tag>);
            }else{
              return (<Tag color="blue" >?????????</Tag>);
            }
          }
        }
      }
    },{
      title: '??????',
      dataIndex: 'debug',
      width:'6%',
      render: (text,record) => {if(text!==0){return <Tag color='#f50'>??????</Tag>} else{return <Tag color='#87d068'>??????</Tag>}}
    },{
      title: '??????',
      dataIndex: '',
      key: 'x',
      width:'8%',
      render: (text,record) => {
        return <Dropdown  overlay={
          <Menu style={{width:70}}>
              <Menu.Item><a   onClick={this.onActionClick.bind(this,"Edit",record)} >????????????</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"????????????","???????????????????????????????",this.copyProcess.bind(this,record.processId))} >????????????</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"????????????","???????????????????????????????????????????????????????",this.startTaskJob.bind(this,record.processId))} >????????????</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"????????????","?????????????????????????????????????????????????",this.stopTaskJob.bind(this,record.processId))} >????????????</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"????????????","?????????????????????????????????????",this.runProcess.bind(this,record.processId))} >????????????</a></Menu.Item>
              <Menu.Item><a   onClick={this.showModal.bind(this,record)} >??????API</a></Menu.Item>
            </Menu>}
            trigger={['click']}
          >
          <a  href="#">?????? <Icon type="down" /></a>
        </Dropdown>}
    }];

    const expandedRow=(record)=>{
      return (
        <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
          <Tabs  size='large'>
            <TabPane tab="???????????????" key="log" style={{fontSize:'16px'}}>
              <ListProcessInstanceLog processId={record.processId} applicationId={this.applicationId} />
            </TabPane>
            <TabPane tab="???????????????" key="history" style={{fontSize:'16px'}}>
              <ListProcessHistory processId={record.processId} applicationId={this.applicationId} />
            </TabPane>
            <TabPane tab="?????????API" key="api" style={{fontSize:'16px'}}>
              <ListServicesByProcessId id={record.id} applicationId={this.applicationId} appId={this.applicationId} filters={{processId:[record.processId]}} close={this.closeModal} />
            </TabPane>
            <TabPane tab="?????????API" key="joinapi" style={{fontSize:'16px'}}>
              <ListJoinApis id={record.id} applicationId={this.applicationId} processId={record.processId} close={this.closeModal} />
            </TabPane>
            <TabPane tab="????????????" key="version" style={{padding:'0px'}}>
              <ListProcessVersion  processId={record.processId}  />
            </TabPane>
            <TabPane tab="??????????????????" key="runTime" style={{padding:'0px'}}>
              <ListNodeLastRunTime  processId={record.processId}  />
            </TabPane>
            <TabPane tab="????????????" key="cacheData" style={{padding:'0px'}}>
              <ShowProcessModelCache processId={record.processId} />
            </TabPane>
        </Tabs>
      </div>
        );
    }

    return (
      <div>
            <Modal key={Math.random()} title='????????????' maskClosable={false}
                visible={this.state.visible}
                width='850px'
                footer=''
                style={{top:'20px'}}
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewProcessService close={this.closeModal} applicationId={this.applicationId} configId={currentRecord.configId} configName={currentRecord.configName} processId={currentRecord.processId} />
            </Modal>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="??????????????????" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >????????????</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >??????</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportProcess)} icon="download"  disabled={!hasSelected}  >??????</Button>
                  <Button  type="ghost" onClick={this.lockedProcess} icon="lock"  disabled={!hasSelected} >??????/??????</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >??????</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   ??????:<Search
                    placeholder="????????????"
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

export default ListProcess;
