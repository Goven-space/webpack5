import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;
const Search = Input.Search;
const LIST_URL=URI.SERVICE_CORE_EXCEPTION.list;
const DELETE_URL=URI.SERVICE_CORE_EXCEPTION.delete;
const CLEAR_URL=URI.SERVICE_CORE_EXCEPTION.clear;

class ListServiceExceptions extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.startDate='';
    this.endDate='';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
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


  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?logDbName="+this.state.logDbName+"&startTime="+this.startDate+"&endTime="+this.endDate;
    GridActions.loadData(this,url,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
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
        title: 'Method',
        dataIndex: 'methodType',
        width: '6%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }
          },
      },{
        title: '请求服务',
        dataIndex: 'actionMapUrl',
        width: '36%'
      },{
        title: '产生时间',
        dataIndex: 'createTime',
        width:'15%',
      },{
        title: '服务器ID',
        dataIndex: 'serverId',
        width:'15%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '请求用户',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '业务标签',
        dataIndex: 'tags',
        width:'8%',
        render:(text,record)=>{
          return text.map((item)=>{return <Tag color="blue" >{item}</Tag>;});
        }
      }
    ];

    const expandedRow=function(record){
      let trace=record.exceptionTrace.replace(/\n/gi,'<br>');
      return (<div>
      <p><b>请求URL:{record.methodType+"."+record.requestUrl}</b></p>
      <p>traceId-spanId:{record.traceId+"-"+record.spanId}</p>
      <p>请求头:{record.inHeaderStr}</p>
      <p>请求数据:{record.inParams} {record.inRequestBody}</p>
      <p>异常消息:{record.exceptionMsg}</p>
      <p> <div style={{color:'red'}} dangerouslySetInnerHTML={{__html: trace}} /></p>
      </div>);
    }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={6} >
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除选中数据吗?",this.deleteData)} icon="delete" disabled={!hasSelected}  >删除异常</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
          </Col>
          <Col span={18} >
            日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
            开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
            结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
            <Button  type="primary" onClick={this.loadData} icon="search" >开始查询</Button>{' '}
          </Col>
        </Row>
        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListServiceExceptions;
