import React, { PropTypes } from 'react';
import { Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
const confirm = Modal.confirm;

const LIST_URL=URI.CORE_ASYNCQUEUE.list+"?status=0";
const DELETE_URL=URI.CORE_ASYNCQUEUE.delete;
const RUN_URL=URI.CORE_ASYNCQUEUE.runQueue;
const RUNSelected_URL=URI.CORE_ASYNCQUEUE.runSelectedQueue;

class ListAsyncRequestQueue extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:10,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL,"");
  }



  runSelectedQueue=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(RUNSelected_URL,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功调度当前服务器下的("+data.msg+")个队列!");
          }
    });
  }

  runQueue=()=>{
    this.setState({loading:true});
    AjaxUtils.post(RUN_URL,{},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功调度当前服务器下的异步队列中的所有服务!");
          }
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'Method',
      dataIndex: 'requestMethod',
      width:'8%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#108ee9">{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#87d068">{text}</Tag>
        }else if(text==="PUT" || text==="DELETE" || text==="*"){
            return <Tag color="#f50">全部</Tag>
        }
      },
      },{
        title: '请求URL',
        dataIndex: 'serviceUrl',
        width: '30%',
      },{
        title: '调度服务器',
        dataIndex: 'serverId',
        width: '10%',
      },{
        title: '回调接口id',
        dataIndex: 'callBackConfigId',
        width:'9%'
      },{
        title: '当前状态',
        dataIndex: 'status',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){return <Tag color='blue'>待调度</Tag>;}
          else if(text==='1'){return <Tag color='blue'>待回调</Tag>;}
          else if(text==='2'){return <Tag color='blue'>等待中</Tag>;}
          else if(text==='3'){return <Tag color='red'>调度失败</Tag>;}
        }
      },{
      title: '请求时间',
      dataIndex: 'createTime',
      width:'13%'
      },{
      title: '请求用户',
      dataIndex: 'userId',
      width:'10%'
      },{
      title: '调度次数',
      dataIndex: 'runNum',
      width:'8%',
      }];

    return (
      <div>
        <div style={divStyle}>
          <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"调度确认","需要调度选中任务吗?",this.runSelectedQueue)} icon="check" disabled={!hasSelected}   >立即调度选中队列</Button>{' '}
          <Button  type="danger" onClick={AjaxUtils.showConfirm.bind(this,"调度确认","需要调度所有任务吗?",this.runQueue)} icon="check"  >立即调度所有队列</Button>{' '}
          <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected}   >删除队列</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table bordered
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
    </div>
    );
  }
}

export default ListAsyncRequestQueue;
