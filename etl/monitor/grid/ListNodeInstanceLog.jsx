import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditText';

//列出一个流程的节点Log实例

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.ListProcessNodeInstanceLog;
const UpdateInsNodeData_URL=URI.ETL.MONITOR.UpdateInsNodeData;

class ListNodeInstanceLog extends React.Component {
  constructor(props) {
    super(props);
    this.logDbName=this.props.logDbName;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.url=LIST_URL+"?processId="+this.processId+"&transactionId="+this.transactionId;
    this.state={
      pagination:{pageSize:1500,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      rowsData: [],
      panes:[],
      loading: true,
      currentRecord:{},
      curEditIndex:-1,
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
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=this.url+"&logDbName="+this.logDbName;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value,record)} />);
  }

  renderSaveButton(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return '-';}
    return (<Button type='primary' onClick={value => this.update(record)} >保存</Button>);
  }

  onRowClick=(record, index)=>{
    this.setState({currentRecord:record,curEditIndex:index});
  }

  handleChange=(key, index, value,record)=>{
    record[key]=value;
    this.setState({currentRecord:record});
  }

  updateInsNode=()=>{
    this.setState({loading:true});
    AjaxUtils.post(UpdateInsNodeData_URL,this.state.currentRecord,(data)=>{
        this.setState({loading:false,curEditIndex:-1});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
        }
    });
  }

  render(){
    const columns=[
      {
        title: '状态',
        dataIndex: 'currentStatus',
        width:'6%',
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
          width: '10%',
      },{
        title: '节点名称',
        dataIndex: 'pNodeName',
        width: '10%',
        sorter:true,
      },{
          title: '读取',
          dataIndex: 'totalReadCount',
          width: '8%',
          render: (text,record) => {return <span style={{fontSize:'14px'}} >{text}</span>;}
      },{
        title: '插入',
        dataIndex: 'insertSuccessCount',
        width:'8%',
        render: (text,record) => {return text+'/'+record.insertFailedCount;}
      },{
        title: '更新',
        dataIndex: 'updateSuccessCount',
        width:'8%',
        render: (text,record) => {return text+'/'+record.updateFailedCount;}
      },{
        title: '删除',
        dataIndex: 'deleteSuccessCount',
        width:'8%',
        render: (text,record) => {return text+'/'+record.deleteFailedCount;}
      },{
        title: '结束位置',
        dataIndex: 'breakPointNum',
        width:'8%',
        render: (text, record, index) => this.renderEditText(index,'breakPointNum', text,record)
      },{
        title: '读取表',
        dataIndex: 'breakPointTableName',
        width:'10%',
        render: (text, record, index) => this.renderEditText(index,'breakPointTableName', text,record),
      },{
        title: '结束时间',
        dataIndex: 'endTime',
        width:'15%',
        sorter: true
      }];

    return (
      <div>
        <Button  type="primary" onClick={this.updateInsNode} icon="save" disabled={this.state.curEditIndex===-1}>保存</Button>{' '}
        <Button  type="ghost" onClick={this.refresh} icon="reload" >刷新</Button>{' '}
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={this.state.rowsData}
          columns={columns}
          loading={this.state.loading}
          onRowClick={this.onRowClick}
        />
      </div>
    );
  }
}

export default ListNodeInstanceLog;
