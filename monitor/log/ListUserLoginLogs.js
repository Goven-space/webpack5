import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Popconfirm,Tabs,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ListServiceApmLog from './ListServiceApmLog';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import ApmChartByTraceId from '../apm/ApmChartByTraceId';
import ShowLog from './ShowLog';

const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.userLoginLogUrl;
const DELETE_URL=URI.LIST_MONITOR.deleteLoginLogUrl;

class ListUserLoginLogs extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate='',
    this.endDate='',
    this.userId=this.props.userId||''; //用户id
    this.hiddenCard=this.props.hiddenCard||false;
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

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中日志吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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

    let url=LIST_URL+"?&serverId="+this.state.serverId+"&userId="+this.userId+"&startDate="+this.startDate+"&endDate="+this.endDate+"&pageSize="+pageSize+"&pageNo="+pageNo;
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '用户',
        dataIndex: 'userId',
        width:'20%',
      },{
        title: '登录时间',
        dataIndex: 'loginTime',
        width: '20%'
      },{
        title: '是否成功',
        dataIndex: 'result',
        width: '15%',
        render:(text,record)=>{
          if(text===0){
            return <Tag color="red" >失败</Tag>
          }else{
            return <Tag color="green" >成功</Tag>
          }
        }
      },{
        title: '结果',
        dataIndex: 'resultMsg',
        width: '25%',
        ellipsis: true,
      },{
        title: 'IP',
        dataIndex: 'ip',
        width:'15%',
      }];

    return (
      <div style={{minHeight:'600px'}}>
      {
        this.hiddenCard?'':
        <Card style={{marginBottom:5}}  >
             用户Id：<Input onChange={this.handleChange} style={{width:'150px'}} prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} />{' '}
             开始日期：<DatePicker showTime={true} onChange={this.onStartDateChange} />{' '}
             结束日期：<DatePicker showTime={true} onChange={this.onEndDateChange} />{' '}
             <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
             <Button  onClick={this.refresh} icon="reload" style={{margin:'0 0 5px 0'}} loading={loading} >刷新</Button>{' '}
             <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
        </Card>
      }
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ListUserLoginLogs;
