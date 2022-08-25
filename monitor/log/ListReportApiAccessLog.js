import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card,DatePicker,Popover} from 'antd';
import ListServiceLog from './ListServiceLog';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.apiAccessLog;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class ListReportApiAccessLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      pagination:{pageSize:60,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      appId:this.appId,
      loading: false,
      logDbName:'',
    }
  }

  componentDidMount(){
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination,page, pageSize)=>{
    this.setState({pagination:pagination});
  }


  getNowFormatDate=(prvNum)=>{
          let date = new Date();
          var seperator1 = "-";
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var strDate = date.getDate()+1;
          if (month >= 1 && month <= 9) {
              month = "0" + month;
          }
          if (strDate >= 0 && strDate <= 9) {
              strDate = "0" + strDate;
          }
          let currentdate = year + seperator1 + month + seperator1 + strDate;
          return currentdate;
   }

   getLastSevenDays=(date)=>{
           var date = date || new Date(),
           timestamp,
           newDate;
            if(!(date instanceof Date)){
                date = new Date(date.replace(/-/g, '/'));
            }
            timestamp = date.getTime();
            newDate = new Date(timestamp - 1 * 24 * 3600 * 1000);
            var month = newDate.getMonth() + 1;
            month = month.toString().length == 1 ? '0' + month : month;
            var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
            return [newDate.getFullYear(), month, day].join('-');
   }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({loading:true});
    let url=LIST_URL+"?appId="+this.state.appId+"&startDate="+this.startDate+"&endDate="+this.endDate+"&logDbName="+this.state.logDbName;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        let pagination=this.state.pagination;
        pagination.total=data.total; //总数
        pagination.current=1; //回到第一页
        this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
      }
    });
  }


 // handleChange=(value)=>{
 //   this.setState({appId:value});
 // }
 handleChange=(e)=>{
   this.appId=e.target.value;
   this.state.pagination.current=1;
   this.state.appId=this.appId;
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
        title: 'API地址',
        dataIndex: 'mapUrl',
        width: '26%'
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'20%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '平均响应(ms)',
        dataIndex: 'avgTime',
        width:'10%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
        title: '最小(ms)',
        dataIndex: 'min',
        width:'8%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
        title: '最大(ms)',
        dataIndex: 'max',
        width:'8%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
      title: '总次数',
      dataIndex: 'accessTotal',
      width:'8%',
      sorter: (a, b) => a.accessTotal - b.accessTotal,
      render:(text,record)=>{
        if(text===0){
          return <Tag color="red" >{text}</Tag>;
        }else{
          return <Tag color="green" >{text}</Tag>;
        }
      }
    }];

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
          日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
          应用Id:<Input onChange={this.handleChange} placeholder='请输入应用appId' style={{width:'200px'}} />{' '}
          开始时间:<DatePicker  defaultValue={moment(this.startDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
          结束时间:<DatePicker defaultValue={moment(this.endDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始查询</Button>{' '}
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
        />
      </div>
    );
  }
}

export default ListReportApiAccessLog;
