import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//列出所有无效的API参数

const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.invalidApis;
const DELETEURL=URI.LIST_CORE_SERVICES.delete;

class ListInvalidApis extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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

  onPageChange=(pagination, filters, sorter)=>{
      this.setState({pagination:pagination});
  }

  search=()=>{
   this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETEURL,"");
  }

  //通过ajax远程载入数据
  loadData=(pagination)=>{
    this.setState({loading:true});
    let url=LIST_URL;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        let pagination=this.state.pagination;
        pagination.total=data.length; //总数
        this.setState({rowsData:data,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
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
        title: 'API URL',
        dataIndex: 'mapUrl',
        width: '25%'
      },{
        title: '名称',
        dataIndex: 'configName',
        width: '20%'
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: 'BeanId',
        dataIndex: 'beanId',
        width:'15%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '错误原因',
        dataIndex: 'extAttribute',
        width:'10%',
      }];

    return (
      <div style={{minHeight:'600px'}}>
        <div style={divStyle}>
          <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除选中的API吗?",this.deleteData)} icon="check" disabled={!hasSelected}   >删除API</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
          <div style={{float:'right'}}>提示:本页统计的API是因为各种原因造成重复或者BeanId已不存在的API</div>
        </div>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          rowSelection={rowSelection}
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

export default ListInvalidApis;
