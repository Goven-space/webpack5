import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Select,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowLog from '../form/ShowLog';

//显示用户的API请用错误日志

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.MARKET.ADMIN.errorApiLog;

class ListApiErrorsLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate='',
    this.endDate='',
    this.userName='';
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      serverId:'',
    }
  }

  componentDidMount(){
    this.loadData();
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

    let url=LIST_URL+"?&startDate="+this.startDate+"&endDate="+this.endDate+"&pageSize="+pageSize+"&pageNo="+pageNo;
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
    this.userName=e.target.value;
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '方法',
        dataIndex: 'methodType',
        width:'5%',
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
        title: '操作描述',
        dataIndex: 'actionName',
        width: '20%'
      },{
        title: '状态码',
        dataIndex: 'responseCode',
        width: '12%',
        render:(text,record)=>{
          if(text===200){
            return "200";
          }else{
            return <Tag color="red" >{text}</Tag>
          }
        }
      },{
        title: '请求URL',
        dataIndex: 'requestUrl',
        width: '20%',
        ellipsis: true,
      },{
        title: '操作时间',
        dataIndex: 'actionTime',
        width:'15%',
      },{
        title: '总耗时/毫秒',
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

      const expandedRow=function(record){
        return (<Card>
          <Tabs defaultActiveKey="RequestInfo" size='large' >
              <TabPane tab="日志数据" key="RequestInfo" animated={false}>
                <ShowLog record={record} ></ShowLog>
              </TabPane>
              <TabPane tab="请求数据" key="RequestData" animated={false}>
                <Card title='请求API'><Tag>{record.methodType}</Tag> {record.backendUrl!==undefined?record.backendUrl:record.requestUrl}</Card>
                <Card title='请求Header'>{record.inHeaderStr}</Card>
                <Card title='传入参数'>{record.inParams}</Card>
                <Card title="请求Body">{record.inRequestBody}</Card>
              </TabPane>
              <TabPane tab="响应数据" key="ResponseData" animated={false}>
                <Card title='状码码'>{record.responseCode}</Card>
                <Card title='返回Header'>{record.responseHeaderStr}</Card>
                <Card title="返回Body">{record.responseBody}</Card>
              </TabPane>
        </Tabs>
      </Card>);
      }

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
             开始时间：<DatePicker showTime={true}  onChange={this.onStartDateChange} />{' '}
             结束时间：<DatePicker showTime={true} onChange={this.onEndDateChange} />{' '}
             <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
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

export default ListApiErrorsLog;
