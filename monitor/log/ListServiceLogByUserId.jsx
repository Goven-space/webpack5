import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,Tabs,DatePicker} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import ListServiceApmLog from './ListServiceApmLog';
import ApmChartByTraceId from '../apm/ApmChartByTraceId';
import ShowLog from './ShowLog';

//统计每个API针对每个用户的调用量统计

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR_CENTER.listServiceLogByUserId;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class ListServiceLogByUserId extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
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


  search=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?id="+this.props.id+"&startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
    GridActions.loadData(this,url,pagination,filters,sorter,{});
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
        title: '用户Id',
        dataIndex: 'userId',
        width: '30%'
      },{
        title: '平均响应(ms)',
        dataIndex: 'avgTime',
        width:'15%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
        title: '最小(ms)',
        dataIndex: 'min',
        width:'15%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
        title: '最大(ms)',
        dataIndex: 'max',
        width:'15%',
        sorter: (a, b) => a.avgTime - b.avgTime,
      },{
      title: '总次数',
      dataIndex: 'accessTotal',
      width:'15%',
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
      <div style={{minHeight:'100px'}}>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={20} >
            日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
            开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
            结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
            <Button  type="primary" onClick={this.search} icon="search" >开始统计</Button>{' '}
          </Col>
          <Col span={4}>
          </Col>
        </Row>
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

export default ListServiceLogByUserId;
