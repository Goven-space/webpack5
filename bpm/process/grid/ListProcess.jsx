import React from 'react';
import ReactDOM from 'react-dom';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewProcess from '../form/NewProcess';
import ProcessDesigner from '../ProcessDesigner';
import ListAllDocs from '../../todo/grid/ListAllDocs';
import ListProcessHistory from '../../monitor/grid/ListProcessHistory';
import ShowProcessModelCache from '../../monitor/form/ShowProcessModelCache';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.BPM.CORE_BPM_CONFIG.list;
const DELETE_URL=URI.BPM.CORE_BPM_CONFIG.delete;
const RUN_URL=URI.BPM.CORE_BPM_CONFIG.run;
const COPY_URL=URI.BPM.CORE_BPM_CONFIG.copy;
const startTaskJobUrl=URI.BPM.CORE_BPM_CONFIG.start;
const stopTaskJobUrl=URI.BPM.CORE_BPM_CONFIG.stop;
const exportProcessUrl=URI.BPM.CORE_BPM_CONFIG.exportProcess;
const lockedProcessUrl=URI.BPM.CORE_BPM_CONFIG.lockedProcess;

class ListProcess extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?applicationId="+this.applicationId;
    this.userId=AjaxUtils.getCookie("userId");
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
      // console.log("page.this.categoryId==="+this.categoryId);
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }else{
      filters={};
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
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
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value,"processId":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '????????????',
        dataIndex: 'configName',
        width: '30%',
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
        title: '???????????????',
        dataIndex: 'processOwners',
        width: '10%',
      },{
        title: '???????????????',
        dataIndex: 'processStartUserIds',
        width: '10%',
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
      title: '??????',
      dataIndex: 'state',
      width: '10%',
      render:(text,record)=>{
          if(record.state==='1'){
            return (<Tag color="blue" >?????????</Tag>)
          }else if(record.state==='2'){
            return (<Tag color="green" >?????????</Tag>)
          }else{
              return (<Tag  >??????</Tag>);
          }
        }
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
            <TabPane tab="??????????????????" key="log" style={{fontSize:'16px'}}>
              <ListAllDocs  processId={record.processId} applicationId={this.applicationId} />
            </TabPane>
            <TabPane tab="???????????????" key="history" style={{fontSize:'16px'}}>
              <ListProcessHistory processId={record.processId} applicationId={this.applicationId} />
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
