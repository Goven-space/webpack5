import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//列出所有无效的API参数

const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.invalidApiParamsList;
const DELETEURL=URI.LIST_MONITOR.deleteInvalidApiParams;

class ListInvalidApiParams extends React.Component {
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
        title: '参数名',
        dataIndex: 'fieldName',
        width:'15%',
      },{
        title: '参数id',
        dataIndex: 'fieldId',
        width: '15%'
      },{
        title: '类型',
        dataIndex: 'fieldType',
        width: '15%'
      },{
        title: '对应无效的服务Id',
        dataIndex: 'urlConfigId',
        width: '25%'
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width:'15%',
      },{
        title: '修改时间',
        dataIndex: 'editTime',
        width:'15%'
      }];

    return (
      <div style={{minHeight:'600px'}}>
        <div style={divStyle}>
          <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除选中的参数配置吗?",this.deleteData)} icon="check" disabled={!hasSelected}   >删除参数</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
          <div style={{float:'right'}}>提示:本页统计的API参数是因为各种原因造成参数与API失去绑定的数据</div>
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

export default ListInvalidApiParams;
