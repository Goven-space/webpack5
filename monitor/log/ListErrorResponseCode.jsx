import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,Tabs,DatePicker} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import ShowLogDetails from './ShowLogDetails';

//非200状态码请求

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR_CENTER.errorResponsecodeList;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class ListErrorResponseCode extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.searchFilters={};
    this.startDate='';
    this.endDate='';
    this.state={
      pagination:{pageSize:15, current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    this.loadData({...this.state.pagination, current:1});
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
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
        title: 'Method',
        dataIndex: 'methodType',
        width:'8%',
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
        title: 'API',
        dataIndex: 'actionMapUrl',
        width: '25%',
        sorter: true
      },{
        title: '请求时间',
        dataIndex: 'actionTime',
        width:'15%',
      },{
        title: 'IP',
        dataIndex: 'ip',
        width:'10%',
      },{
        title: 'ServerId',
        dataIndex: 'serverId',
        width:'10%',
      },{
        title: '用户',
        dataIndex: 'userId',
        width:'10%',
      },{
        title: '状态码',
        dataIndex: 'responseCode',
        width:'8%',
        render:(text,record)=>{
            return <Tag color="red" >{text}</Tag>
        }
      },{
        title: '业务标签',
        dataIndex: 'tags',
        width:'8%',
        render:(text,record)=>{
          return text.map((item)=>{return <Tag color="blue" >{item}</Tag>;});
        }
      }
    ];

    const expandedRow=(record)=>{
      return (<ShowLogDetails record={record} logDbName={this.state.logDbName} />);
    }

    return (
      <div style={{minHeight:'100px'}}>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={20} >
            日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
            开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
            结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
            <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
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
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListErrorResponseCode;
