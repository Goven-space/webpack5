import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Select,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import ShowLogDetails from './ShowLogDetails';
import AjaxSelect from '../../core/components/AjaxSelect';

const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.apiAccessLogByPage;
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;

//监控中心-> API调用日志,按用户查看专用

class ListAllApiLogByUserId extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate='',
    this.endDate='',
    this.userId=this.props.userId||'';
    this.logType=this.props.logType||'0';
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      serverId:'',
      logDbName:'',
    }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.logType!==nextProps.logType){
      this.logType=nextProps.logType;
      this.state.pagination.current=1;
      this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
      this.setState({pagination:pagination});
   this.loadData(pagination,filters,sorter);
  }

  search=()=>{
   this.state.pagination.current=1;
   this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination)=>{
    this.setState({loading:true});
    let pageSize=30;
    let pageNo=1;
    if(pagination!==undefined){
      pageNo=pagination.current||1;
      pageSize=pagination.pageSize||20;
    }

    let url=LIST_URL+"?logDbName="+this.state.logDbName+"&serverId="+this.state.serverId+"&userId="+this.userId+"&startDate="+this.startDate+"&endDate="+this.endDate+"&pageSize="+pageSize+"&pageNo="+pageNo+"&logType="+this.logType;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        let pagination=this.state.pagination;
        pagination.total=data.total; //总数
        this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
      }
    });
  }

  handleChange=(e)=>{
    this.userId=e.target.value;
  }
  serverChange=(value)=>{
    this.setState({serverId:value});
  }
  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }

  logDbChange=(dbName)=>{
    this.setState({logDbName:dbName});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '方法',
        dataIndex: 'methodType',
        width:'10%',
        render:text => {
          if(text==="POST"){
              return <Tag color="#108ee9" style={{width:40}} >{text}</Tag>
          }else if(text==="GET"){
              return <Tag color="#87d068" style={{width:40}} >{text}</Tag>
          }else if(text==="PUT" || text==="DELETE" ){
              return <Tag color="#f50" style={{width:40}} >{text}</Tag>
          }else if(text==="*"){
              return <Tag color="#f50" style={{width:40}} >全部</Tag>
          }
        }
      },{
        title: '用户',
        dataIndex: 'userName',
        width:'10%',
      },{
        title: 'API名称',
        dataIndex: 'actionName',
        width: '15%'
      },{
        title: 'URL',
        dataIndex: 'requestUrl',
        width: '15%',
        ellipsis: true,
      },{
        title: '调用时间',
        dataIndex: 'actionTime',
        width:'15%',
      },{
        title: '状态码',
        dataIndex: 'responseCode',
        width:'8%',
        render:(text,record)=>{
          if(text===200){
            return <Tag color="green" >{text}</Tag>
          }else{
            return <Tag color="red" >{text}</Tag>
          }
        }
      },{
        title: '耗时',
        dataIndex: 'runTotalTime',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
        title: 'IP',
        dataIndex: 'ip',
        width:'10%',
      }];

      const expandedRow=(record)=>{
        return (<ShowLogDetails record={record} logDbName={this.state.logDbName} />);
      }

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
             日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
             服务ServerId:<AjaxEditSelect url={listAllServiceNames} value={this.state.serverId} onChange={this.serverChange}  valueId='serviceName' textId='serviceName' options={{showSearch:true}} />{' '}
             开始时间：<DatePicker showTime={true}  onChange={this.onStartDateChange} />{' '}
             结束时间：<DatePicker showTime={true}  onChange={this.onEndDateChange} />{' '}
             <Button  type="primary" onClick={this.search} icon="search" >搜索</Button>{' '}
             <Button  onClick={this.refresh} icon="reload" style={{margin:'0 0 5px 0'}} loading={loading} >刷新</Button>
        </Card>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListAllApiLogByUserId;
