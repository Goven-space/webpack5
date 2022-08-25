import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import * as GridActions from '../utils/GridUtils';
import NewApiCategoryNode from '../../apiportal/form/NewApiCategoryNode';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_CODEHISTORY.list; //分页显示
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;

//模板代码代码选择时使用

class ListCommitHistorySelect extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.configId;
    this.close=this.props.close;
    this.url=LIST_URL+"?configId="+this.configId;
    this.searchFilters = {};
    this.sorter = {};
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`}
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      action:'edit',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} : {};
    this.loadData(pagination);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {}
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    const filters = {}
    GridActions.loadData(this,this.url,pagination,filters,this.sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    this.searchFilters=value ? {"commitUserId":value,"commitDateTime":value} : {};
    this.loadData(this.defaultPagination)
  }

  onSelectOk=()=>{
    this.close(this.state.selectedRowKeys);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange, type:'radio'};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '唯一Id',
        dataIndex: 'commitConfigId',
        width: '40%',
        sorter:true,
      },{
        title: '提交人',
        dataIndex: 'commitUserId',
        width: '30%'
      },{
        title: '提交时间',
        dataIndex: 'commitDateTime',
        width: '30%'
      }];

      const expandedRow=(record)=>{
        return (
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 12 }} value={record[record.commitCodeField]} />
          );
      }

    return (
      <div>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onSelectOk} disabled={!hasSelected} icon="check"  >恢复到选中记录</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
                <Button onClick={this.close.bind(this,"")}  >关闭</Button>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  placeholder='提交人或提交时间'
                  onChange={e=>{this.searchKeyword=e.target.value}}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              size='small'
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              expandedRowRender={expandedRow}
            />
      </div>
    );
  }
}

export default ListCommitHistorySelect;
