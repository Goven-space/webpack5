import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Select,Tabs,Form} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import ShowLogDetails from './ShowLogDetails';
import moment from 'moment';
import AjaxSelect from '../../core/components/AjaxSelect';

//api搜索日志

const dateFormat = 'YYYY-MM-DD';
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const LIST_URL=URI.LIST_MONITOR.searchApiLogs;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class SearchApiLogs extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:false,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      condition:'Filters.regex("traceId","")',
      logDbName:''
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

    let url=LIST_URL+"?&condition="+this.state.condition+"&startDate="+this.startDate+"&endDate="+this.endDate+"&pageSize="+pageSize+"&pageNo="+pageNo+"&logDbName="+this.state.logDbName;
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

  getNowFormatDate=(prvNum)=>{
          let date = new Date();
          var seperator1 = "-";
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var strDate = date.getDate();
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
            newDate = new Date(timestamp - 7 * 24 * 3600 * 1000);
            var month = newDate.getMonth() + 1;
            month = month.toString().length == 1 ? '0' + month : month;
            var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
            return [newDate.getFullYear(), month, day].join('-');
   }

  handleChange=(e)=>{
    this.setState({condition:e.target.value});
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
        title: 'Method',
        dataIndex: 'methodType',
        width:'5%',
        render:text => {
          if(text==="POST"){
              return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
          }else if(text==="GET"){
              return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
          }else if(text==="PUT" || text==="DELETE" ){
              return <Tag color="#f50" style={{width:50}} >{text}</Tag>
          }else if(text==="*"){
              return <Tag color="#f50" style={{width:50}} >全部</Tag>
          }
        }
      },{
        title: '用户',
        dataIndex: 'userName',
        width:'10%',
      },{
        title: 'API名称',
        dataIndex: 'actionName',
        width: '20%'
      },{
        title: 'URL',
        dataIndex: 'actionMapUrl',
        width: '20%'
      },{
        title: 'ServerId',
        dataIndex: 'serverId',
        width: '12%'
      },{
        title: '记录时间',
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
        title: '业务标签',
        dataIndex: 'tags',
        width:'10%',
        render:(text,record)=>{
          if(text!=undefined){
            return text.map((item)=>{return <Tag color="blue" >{item}</Tag>;});
          }else{
            return "";
          }
        }
      }];

      const expandedRow=(record)=>{
        return (<ShowLogDetails record={record} logDbName={this.state.logDbName} />);
      }

    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
          <Form  >
            <FormItem  label='日志库' {...formItemLayout4_16} help='选择一个日志存储数据库' >
              <AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{maxWidth:'600px'} }} />{' '}
            </FormItem>
            <FormItem  label="搜索条件"
            {...formItemLayout4_16}
            help='单个条件等于:Filters.eq("userId","admin"),模糊搜索标签:Filters.regex("tags","100001"),多个条件:Filters.and(Filters.eq("userId","admin"),Filters.eq("ip","127.0.0.1"))'
            >
              <Input onChange={this.handleChange} value={this.state.condition}   />
            </FormItem>
            <FormItem  label="范围"   {...formItemLayout4_16} >
              开始日期:<DatePicker  defaultValue={moment(this.startDate, dateFormat)}    onChange={this.onStartDateChange} />{' '}
              结束日期:<DatePicker defaultValue={moment(this.endDate, dateFormat)} onChange={this.onEndDateChange} />{' '}
            </FormItem>
            <FormItem  label='搜索' {...formItemLayout4_16} >
              <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
              <Button  onClick={this.refresh} icon="reload" style={{margin:'0 0 5px 0'}} loading={loading} >刷新</Button>
            </FormItem>
          </Form>
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

export default SearchApiLogs;
