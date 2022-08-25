import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import ListApproverCategorys from './ListApproverCategorys';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DATAPUBLISH.approverDataList;
const DELETE_URL=URI.CORE_DATAPUBLISH.deleteApproverData;//删除
const AGREE_URL=URI.CORE_DATAPUBLISH.agreeApproverData;//同意

class ListApproverData extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:200,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
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
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '删除待审核数?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"userName":value,"userId":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  agreeData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(AGREE_URL,{ids:ids},(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
        }
    });
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '申请者姓名',
        dataIndex: 'userName',
        width: '10%',
      },{
        title: '申请者id',
        dataIndex: 'userId',
        width: '10%',
      },{
        title: '来自服务器',
        dataIndex: 'serverId',
        width: '10%'
      },{
        title: '更新数据量',
        dataIndex: 'dataCount',
        width: '10%',
      },{
        title: '更新说明',
        dataIndex: 'remark',
        width: '35%',
      },{
        title: '更新状态',
        dataIndex: 'updateStatus',
        width: '10%',
        render: (text,record) => {
          if(text==0){
            return <Tag color='green'>未审核</Tag>;
          }else{
            return <Tag color='red'>已更新</Tag>;
          }
        }
      },{
        title: '申请时间',
        dataIndex: 'createTime',
        width: '15%',
        sorter:true,
      }];

      const expandedRow=(record)=>{
        return (
          <Card>
            <ListApproverCategorys id={record.id} />
          </Card>
          );
      }

    return (
      <div >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'同意更新数据','同意后数据将更新和覆盖本服务器中的数据!',this.agreeData)} icon="file"  disabled={!hasSelected}  >同意更新</Button>
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Table
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

export default ListApproverData;
