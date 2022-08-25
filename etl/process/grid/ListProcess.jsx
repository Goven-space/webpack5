import React from 'react';
import ReactDOM from 'react-dom';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewProcess from '../common/NewProcess';
import ProcessDesigner from '../ProcessDesigner';
import ListProcessInstanceLog from '../../monitor/grid/ListProcessInstanceLog';
import ListNodeLastRunTime from '../../monitor/grid/ListNodeLastRunTime';
import ListProcessVersion from './ListProcessVersion';
import NewProcessService from './NewProcessService';
import ListServicesByProcessId from '../../../designer/designer/grid/ListApisByFilters';
import ShowProcessLog from '../../monitor/form/ShowProcessLog';
import ProcessDependencies_parent from '../../relationship/form/ProcessDependencies_parent';
import ProcessDependencies_sub from '../../relationship/form/ProcessDependencies_sub';
import DataTransmissionByProcessIdCharts from '../../report/DataTransmissionByProcessIdCharts';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.CONFIG.list;
const DELETE_URL=URI.ETL.CONFIG.delete;
const RUN_URL=URI.ETL.CONFIG.run;
const COPY_URL=URI.ETL.CONFIG.copy;
const startTaskJobUrl=URI.ETL.CONFIG.start;
const stopTaskJobUrl=URI.ETL.CONFIG.stop;
const exportProcessUrl=URI.ETL.CONFIG.exportProcess;
const lockedProcessUrl=URI.ETL.CONFIG.lockedProcess;

class ListProcess extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.categoryId=this.props.categoryId;
    this.userId=AjaxUtils.getUserId();
    this.url=LIST_URL+"?applicationId="+this.applicationId;
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
      this.setState({action:action,visible: true});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({action:action,visible: true,currentRecord:record});
    }else if(action==="startTaskJob"){
      this.startTaskJob(record.processId);
    }else if(action==="stopTaskJob"){
      this.stopTaskJob(record.processId);
    }else if(action==="Process"){
      this.addTabPane('Process','流程:'+record.configName,record);
    }
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
      //0表示定时任务不存在,1表示启动成功,2表示定时表达式为空,3表示任务已经启动了,4表示任务被禁用中
      if(data.state===true){
        AjaxUtils.showInfo(data.msg);
      }else{
        AjaxUtils.showError(data.msg);
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  //批量停止
  batchStopTaskJob=()=>{
    let processIds=this.state.selectedRows.map(item=>{return item.processId;});
    this.stopTaskJob(processIds.join(","));
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

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
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
      title: '选中流程的运行历史记录数据将全部被删除!',
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
  addTabPane=(id,name,record,tabKey)=>{
      const panes = this.state.panes;
      let tabActiveKey = tabKey||record.id;
      let content;
      if(id==='New'){
        content=(<NewProcess id="" appId={this.props.appId} categoryId={this.categoryId} close={this.closeCurrentTab} applicationId={this.applicationId} />);
      }else if(id==='Edit'){
        content=(<NewProcess id={record.id} appId={this.props.appId}  close={this.closeCurrentTab}  applicationId={this.applicationId}  />);
      }else if(id==='Process'){
        content=(<ProcessDesigner processId={record.processId} appId={this.appId}  close={this.closeCurrentTab}  applicationId={this.applicationId}  />);
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
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value,"processId":value,"creator":value,"creatorName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  runProcess=(processId)=>{
    AjaxUtils.post(RUN_URL,{processId:processId},(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }
    });
    AjaxUtils.showInfo("流程执行命令已提交,可在流程监控中查看运行结果!");
  }

  //批量提交流程运行命令
  batchRunProcess=()=>{
    let processIds=this.state.selectedRows.map(item=>{return item.processId;});
    processIds.forEach((item, i) => {
      AjaxUtils.post(RUN_URL,{processId:item},(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }
      });
    });
    AjaxUtils.showInfo(processIds.length+"个流程执行命令已提交,可在流程监控中查看运行结果!");
  }

  //批量启动流程
  batchStartProcess=()=>{
    this.setState({loading:true});
    let processIds=this.state.selectedRows.map(item=>{return item.processId;});
    processIds.forEach((item, i) => {
      AjaxUtils.post(startTaskJobUrl,{processId:item},(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }
      });
    });

    this.sleep(1000).then(() => {
      AjaxUtils.showInfo(processIds.length+"个流程启动命令已提交,可点击刷新按扭查看调度状态!");
      this.loadData();
      this.setState({loading:false});
    });
  }


  sleep=(time)=>{
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  copyProcess=(processId)=>{
    this.setState({loading:true});
    AjaxUtils.post(COPY_URL,{processId:processId},(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("流程成功复制!");
          this.loadData();
        }
    });
  }

  //导出流程
  exportProcess=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exportProcessUrl+"?ids="+ids;
    location.href=url;
  }

  showModal=(record)=>{
    this.setState({visible: true,currentRecord:record});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,action:''});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

	handleCancel = () => {
		this.setState({
			visible:false
		})
	}

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流程名称',
        dataIndex: 'configName',
        width: '20%',
        sorter:true,
        ellipsis: true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '流程设计',
          dataIndex: 'process',
          width: '8%',
          ellipsis: true,
          render: (text,record) => {
            if(record.lockedUserId==='' || record.lockedUserId===undefined){
              return <a onClick={this.onActionClick.bind(this,"Process",record)}>流程设计</a>
            }else if(record.lockedUserId===this.userId){
              return <a onClick={this.onActionClick.bind(this,"Process",record)} title={record.lockedUserId+'锁定!'} ><Icon type='lock' />流程设计</a>
            }else{
              return <span><Icon type='lock' />{record.lockedUserId}锁定</span>;
            }
          }
      },{
        title: '管理员',
        dataIndex: 'processOwners',
        width: '8%',
      },{
          title: '最后修改',
          dataIndex: 'editTime',
          width: '15%',
          sorter: true,
      },{
      title: '运行方式',
      dataIndex: 'state',
      width:'12%',
      ellipsis: true,
      render: (text,record) => {
        if(text==='1'){return record.expression}
        else if(text==='0'){return <Tag>禁用</Tag>}
        else if(text==='2'){return <Tag color='blue'>手动</Tag>}
        else if(text==='3'){return <Tag color="cyan" >依赖上游</Tag>}
      }
    },{
      title: '状态',
      dataIndex: 'runingFlag',
      width: '13%',
      ellipsis: true,
      render:(text,record)=>{
        if(text){
          return "下次运行:"+record.nextRunTime;
        }else{
          if(record.state==='1'){
            return (<Tag color="red" >待安排</Tag>)
          }else if(record.state==='3'){
            return <span>依赖:{record.expression}</span>
          }else{
            return (<Tag color="blue" >手动触发</Tag>);
          }
        }
      }
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'9%',
      ellipsis: true,
    },{
      title: '调试',
      dataIndex: 'debug',
      width:'8%',
      sorter: true,
      render: (text,record) => {if(text!==0){return <Tag color='#f50'>调试</Tag>} else{return <Tag color='#87d068'>正常</Tag>}}
    },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'8%',
      render: (text,record) => {
        return <Dropdown  overlay={
            <Menu style={{width:70}}>
              <Menu.Item><a   onClick={this.onActionClick.bind(this,"Edit",record)} >修改流程</a></Menu.Item>
              <Menu.Item><a   onClick={this.showModal.bind(this,record)} >创建API</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"复制流程","您确定要复制本流程吗?",this.copyProcess.bind(this,record.processId))} >复制流程</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"调度流程","您确定要立即启动对本流程的定时调度吗?",this.startTaskJob.bind(this,record.processId))} >立即调度</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"停止调度","您确定要停止对本流程的定时调度吗?",this.stopTaskJob.bind(this,record.processId))} >停止调度</a></Menu.Item>
              <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"手动运行","您确定要手工运行本流程吗?",this.runProcess.bind(this,record.processId))} >手动运行</a></Menu.Item>
            </Menu>}
            trigger={['click']}
          >
          <a  href="#">操作 <Icon type="down" /></a>
        </Dropdown>}
    }];

    const expandedRow=(record)=>{
      return (
        <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
          <Tabs size='large'>
            <TabPane tab="调度记录" key="log" style={{padding:'0px'}}>
              <ListProcessInstanceLog processId={record.processId} />
            </TabPane>
            <TabPane tab="最后调度记录" key="runTime" style={{padding:'0px'}}>
              <ListNodeLastRunTime  processId={record.processId}  />
            </TabPane>
            <TabPane tab="创建的API" key="api" style={{fontSize:'16px'}}>
              <ListServicesByProcessId id={record.id} appId={this.applicationId} filters={{processId:[record.processId]}} close={this.closeModal} />
            </TabPane>
            <TabPane tab="历史版本" key="version" style={{padding:'0px'}}>
              <ListProcessVersion  processId={record.processId}  />
            </TabPane>
            <TabPane tab="依赖关系" key="dependencies" style={{fontSize:'16px'}}>
              <Tabs size='large'>
                <TabPane tab="下游任务" key="sub" style={{padding:'0px'}}>
                    <ProcessDependencies_sub processId={record.processId} />
                </TabPane>
                <TabPane tab="上游任务" key="parent" style={{padding:'0px'}}>
                    <ProcessDependencies_parent processId={record.processId} />
                </TabPane>
              </Tabs>
            </TabPane>
            <TabPane tab="数据传输趋势" key="datatranscount" style={{fontSize:'16px'}}>
              <DataTransmissionByProcessIdCharts processId={record.processId} appId={this.props.appId}  close={this.closeModal} />
            </TabPane>
            <TabPane tab="调试日志" key="debuglog" style={{padding:'0px'}}>
              <ShowProcessLog  processId={record.processId}  />
            </TabPane>
          </Tabs>
        </div>
        );
    }

    let modalContent,modalTitle;
    if(this.state.action=='New'){
        modalTitle='新增自动化流程';
        modalContent=<NewProcess id="" appId={this.props.appId} categoryId={this.categoryId} close={this.closeModal} applicationId={this.applicationId} />;
    }else if(this.state.action=='Edit'){
        modalTitle='修改自动化流程';
        modalContent=<NewProcess id={this.state.currentRecord.id} appId={this.props.appId}  close={this.closeModal}  applicationId={this.applicationId}  />;
    }else{
        modalTitle='创建API接口';
        modalContent=<NewProcessService close={this.closeModal} appId={this.applicationId}  configId={currentRecord.configId} configName={currentRecord.configName} processId={currentRecord.processId} />;
    }
    return (
      <div>
            <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                visible={this.state.visible}
                width='950px'
                footer=''
                style={{ top: 20 }}
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {modalContent}
            </Modal>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="流程管理" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={16} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增流程</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出流程','导出流程后可以使用导入功能重新导入!',this.exportProcess)} icon="download"  disabled={!hasSelected}  >导出</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'运行流程','批量手动执行选中流程!',this.batchRunProcess)} icon="play-square"  disabled={!hasSelected}  >运行</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"启动调度","确定要立即启动对选中流程的调度吗?",this.batchStartProcess)} icon="history"
                   disabled={!hasSelected} >启动调度</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'停止调度流程','批量停止调度选中流程!',this.batchStopTaskJob)} icon="close"  disabled={!hasSelected}  >停止</Button>
                  <Button  type="ghost" onClick={this.lockedProcess} icon="lock"  disabled={!hasSelected} >锁定/解锁</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={8}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="流程名称|创建者"
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

export default ListProcess;
