import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,Tabs,DatePicker} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowLogDetails from './ShowLogDetails';
import AjaxSelect from '../../core/components/AjaxSelect';

//API+号前面点击API调用日志的log显示界面

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.listServiceLog;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class ListServiceLog extends React.Component {
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
      columnsDocs:[],
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
    let url=LIST_URL+this.props.id+"?startTime="+this.startDate+"&endTime="+this.endDate+"&logDbName="+this.state.logDbName;
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      pagination.total=data.total; //总数
      this.setState({rowsData:data.rows, columnsDocs:data.columnsDocs||[],pagination:pagination,selectedRows:[],selectedRowKeys:[]});
    });
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
    let columns=[{
        title: '请求Url',
        dataIndex: 'requestUrl',
        width: '35%',
        ellipsis: true,
      },{
        title: '请求时间',
        dataIndex: 'receiveTime',
        width:'15%',
      },{
          title: '状态码',
          dataIndex: 'responseCode',
          width:'8%',
          render:text => {
            if(text===200){
                return <Tag color="green" >{text}</Tag>
            }else{
                return <Tag color="red" >{text}</Tag>
            }
          }
        },{
        title: '总耗时/毫秒',
        dataIndex: 'runTotalTime',
        width:'10%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
        title: 'ServerId',
        dataIndex: 'serverId',
        width:'10%',
      },{
        title: '用户',
        dataIndex: 'userId',
        width:'10%',
      },{
        title: 'IP',
        dataIndex: 'ip',
        width:'15%',
      }];

      columns=columns.concat(this.state.columnsDocs); //增加自定义标签列
      const expandedRow=(record)=>{
        return (<ShowLogDetails record={record} logDbName={this.state.logDbName} />);
      }

    return (
      <div style={{minHeight:'100px'}}>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={24} >
            日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'300px'} }} />{' '}
            开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
            结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
            <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
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

export default ListServiceLog;
