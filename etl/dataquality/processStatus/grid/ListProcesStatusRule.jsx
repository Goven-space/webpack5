import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout,Divider} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import NewProcessStatusRule from '../form/NewProcessStatusRule';
import ListProcessStatusLog from './ListProcessStatusLog';

//流程状态监控

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.DATAQUALITY_PROCESSSTATUS.list;
const DELETE_URL=URI.ETL.DATAQUALITY_PROCESSSTATUS.delete;
const RUN_URL=URI.ETL.DATAQUALITY_PROCESSSTATUS.run;
const startTaskJobUrl=URI.ETL.DATAQUALITY_PROCESSSTATUS.start;
const stopTaskJobUrl=URI.ETL.DATAQUALITY_PROCESSSTATUS.stop;

class ListProcesStatusRule extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?applicationId="+this.applicationId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      folderId:'all',
      menuData:[],
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
      this.setState({visible: true,currentId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
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

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '注意，所有对比记录将被同时清除!',
      content: '确认删除!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
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
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"remark":value,"ruleName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  run=(id)=>{
      this.setState({loading:true});
      let url=RUN_URL;
      AjaxUtils.post(url,{id:id},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("执行成功，请点击+号查看检测记录!");
            this.loadData();
          }
      });
  }

  startTaskJob=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(startTaskJobUrl,{id:id},(data)=>{
      if(data.state){
        AjaxUtils.showInfo(data.msg);
      }else{
        AjaxUtils.showError(data.msg);
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  stopTaskJob=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(stopTaskJobUrl,{id:id},(data)=>{
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '规则名称',
        dataIndex: 'ruleName',
        sorter: true,
        width: '25%',
      },,{
        title: '类型',
        dataIndex: 'checkType',
        width: '15%',
        render:(text,record)=>{
          if(text==='1'){
            return '超时检测';
          }else if(text==='2'){
            return '超时未调度检测';
          }else{
            return text;
          }
        }
      },{
        title: '执行时间',
        dataIndex: 'expression',
        width: '15%',
        sorter: true,
      },{
        title: '范围',
        dataIndex: 'executeServer',
        width: '10%',
        render:(text,record)=>{
          if(text==='SingleServer'){
            return '主服务器';
          }else if(text==='AllServer'){
            return '所有服务器';
          }else{
            return text;
          }
        }
      },{
        title: '当前状态',
        dataIndex: 'runingFlag',
        width: '20%',
        render:(text,record)=>{
          if(text){
            return "下次运行:"+record.nextRunTime;
          }else if(record.state=='0'){
            return (<Tag >停用</Tag>)
          }else{
            return (<Tag color="red" >未安排</Tag>)
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
          return <Dropdown  overlay={
              <Menu style={{width:70}}>
                <Menu.Item><a onClick={this.onActionClick.bind(this,'Edit',record)} >修改规则</a></Menu.Item>
                <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,'手动执行','确定要执行本数据对比规则吗?',this.run.bind(this,record.id))} >手动执行</a></Menu.Item>
                <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"调度流程","您确定要立即启动调度吗?",this.startTaskJob.bind(this,record.id))} >立即调度</a></Menu.Item>
                <Menu.Item><a onClick={AjaxUtils.showConfirm.bind(this,"停止调度","您确定要停止调度吗?",this.stopTaskJob.bind(this,record.id))} >停止调度</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      }];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
                <ListProcessStatusLog id={record.id} />
          </div>
          );
      }

    return (
      <div >
    	          <Modal key={Math.random()} maskClosable={false}
                    visible={this.state.visible}
                    width='900px'
                    footer=''
                    onOk={this.handleCancel}
                    onCancel={this.handleCancel} >
                    <NewProcessStatusRule id={currentId} appId={this.props.appId} applicationId={this.applicationId} categoryId={this.categoryId} close={this.closeModal} />
                </Modal>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增规则</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     搜索:<Search
                      placeholder="搜索文件夹"
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
      </div>
    );
  }
}

export default ListProcesStatusRule;
