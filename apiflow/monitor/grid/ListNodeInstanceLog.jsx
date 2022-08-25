import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'

//列出一个流程的节点Log实例

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.CORE_ESB_MONITOR.listProcessNodeInstances;

class ListNodeInstanceLog extends React.Component {
  constructor(props) {
    super(props);
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.url=LIST_URL+"?processId="+this.processId+"&transactionId="+this.transactionId;
    this.sorter = {};
    this.state={
      pagination:{pageSize:1500,current:1},
      rowsData: [],
      panes:[],
      loading: true,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    const filters = {}
    GridActions.loadData(this,this.url,pagination,filters,this.sorter);
  }

  onSorterChange=(pagination,filters,sorter)=>{
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} : {};
    this.loadData()
  }

  render(){
    const columns=[
      {
        title: '状态',
        dataIndex: 'currentStatus',
        width:'8%',
        render: (text,record) => {
          if(text==='end'){
            return <Tag color='#87d068'>结束</Tag>
          }else if(text==='current'){
            return <Tag color='#f50'>活动</Tag>
          }else{
            return <Tag color='orange'>等待</Tag>
          }
        }
      },{
          title: '节点Id',
          dataIndex: 'pNodeId',
          width: '8%',
      },{
        title: '节点名称',
        dataIndex: 'pNodeName',
        width: '20%',
        sorter:(a, b) => a.pNodeName.localeCompare(b.pNodeName),
      },{
          title: '状态码',
          dataIndex: 'responseCode',
          width: '8%',
          render: (text,record) => {
            if(text!=='200'){
              return <span style={{color:'red'}} >{text}</span>;
            }else{
              return <span style={{color:'green'}} >{text}</span>;
            }
          }
      },{
          title: '断言',
          dataIndex: 'assertResult',
          width: '8%',
          render: (text,record) => {
            if(text===1){
              return <span style={{color:'green'}} >成立</span>;
            }else{
              return <span style={{color:'red'}} >失败</span>;
            }
          }
      },{
          title: '补偿',
          dataIndex: 'compensateFlag',
          width: '8%',
          render: (text,record) => {
            if(text===1){
              return <span style={{color:'red'}} >是</span>;
            }else{
              return <span style={{color:'green'}} >否</span>;
            }
          }
      },{
        title: '总耗时(毫秒)',
        dataIndex: 'totalRunTime',
        width:'10%'
      },{
        title: '结束时间',
        dataIndex: 'endTime',
        width:'18%',
        ellipsis: true,
        sorter: (a, b)=> new Date(a.endTime.substring(0,19)).getTime() - new Date(b.endTime.substring(0,19)).getTime(),
        render: (text) => text?text.substring(0,19):text
      }];

    const expandedRow=function(record){
      return <ReactJson src={record} />
    }

    return (
      <div>
        <Button  type="primary" onClick={this.refresh} icon="reload" >刷新</Button>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={this.state.rowsData}
          columns={columns}
          loading={this.state.loading}
          onChange={this.onSorterChange}
          expandedRowRender={expandedRow}
          pagination={false}
        />
      </div>
    );
  }
}

export default ListNodeInstanceLog;
