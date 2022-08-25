import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.listAllStopServices;
const DELETE_URL=URI.LIST_CORE_SERVICES.deleteStopServices;
const CLEAR_URL=URI.LIST_CORE_SERVICES.clearAllStopServices;

class ListStopServices extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }
  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters,(data)=>{
      this.setState({rowsData:data.rows});
    });
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  clearData=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.loadData();
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功解冻所有服务!");
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
        dataIndex: 'method',
        width:'10%',
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
        },
      },{
        title: 'Url地址',
        dataIndex: 'url',
        width: '25%'
      },{
        title: '冻结开始时间',
        dataIndex: 'startTime',
        width:'15%',
      },{
        title: '冻结分钟',
        dataIndex: 'FreezeTime',
        width:'10%',
      },{
        title: '状态标识',
        dataIndex: 'status',
        width:'10%',
      },{
        title: '服务器ID',
        dataIndex: 'serverId',
        width:'10%'
      },{
        title: '冻结原因',
        dataIndex: 'remark',
        width:'20%'
      }];

    return (
      <div>
        <div style={divStyle}>
          <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"恢复确认","需要恢复所有服务吗?",this.clearData)} icon="delete"  >清空(全部恢复服务)</Button>{' '}
          <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"恢复确认","需要恢复选中服务吗?",this.deleteData)} icon="delete" disabled={!hasSelected}  >恢复选中服务</Button>{' '}
        <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
        </div>
        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ListStopServices;
