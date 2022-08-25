import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.BPM.REMARKS.listByPage;
const DELETE_URL=URI.BPM.REMARKS.delete;

//列出所有审批记录

class ListRemarks extends React.Component {
  constructor(props) {
    super(props);
    this.transactionId=this.props.transactionId;
    this.nodeId=this.props.nodeId||'';
    this.applicationId=this.props.applicationId||'';
    this.url=LIST_URL+"?&applicationId="+this.applicationId+"&transactionId="+this.transactionId; //事务id
    this.deleteUrl=DELETE_URL+"?applicationId="+this.applicationId; //应用id
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
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
    if(this.nodeId!=''){
      filters.nodeId=[this.nodeId];
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,this.deleteUrl,argIds);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,{},{},{});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中的审批记录吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
      title: '审批节点',
      dataIndex: 'nodeName',
      width:'15%',
      ellipsis: true,
    },{
        title: '审批人',
        dataIndex: 'userName',
        width:'10%'
      },{
      title: '提交后续节点',
      dataIndex: 'nextNodeName',
      width:'15%',
      ellipsis: true
    },{
      title: '提交后续用户',
      dataIndex: 'nextUserNameList',
      width:'15%',
      ellipsis: true
    },{
        title: '开始时间',
        dataIndex: 'startTime',
        width: '15%',
        ellipsis: true,
    },{
      title: '结束时间',
      dataIndex: 'endTime',
      width: '15%',
      ellipsis: true,
    },{
      title: '总耗时',
      dataIndex: 'totalRunTime',
      width:'10%',
      render: (text,record) => {return <Tag color='green'>{text}</Tag>}
    }];

    const expandedRow=(record)=>{
      return (
        <Card bordered={true} title='审批意见' >
          {record.remark}
        </Card>
        );
    }

    return (
      <div>
          <Row style={{marginBottom:5}} gutter={0} >
            <Col span={10} >
            <ButtonGroup>
              <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
              <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
            </Col>
            <Col span={14}>
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

export default ListRemarks;
