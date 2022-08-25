import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import ReactJson from 'react-json-view'

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DATAPUBLISH.listChildrenData; //分页显示
const changestatusUrl=URI.CORE_DATAPUBLISH.changestatus; //改变发布状态

class ListPublishDatas extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.batchId=this.props.batchId;
    this.columns=this.props.columns;
    this.state={
      pagination:{pageSize:500,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?batchId="+this.batchId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  changestatus=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({visible: false,});
    AjaxUtils.post(changestatusUrl,{ids:ids,status:1},(data)=>{
      AjaxUtils.showMsg(data);
      this.loadData();
    });
  }

  changeStopStatus=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({visible: false,});
    AjaxUtils.post(changestatusUrl,{ids:ids,status:0},(data)=>{
      AjaxUtils.showMsg(data);
      this.loadData();
    });
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=this.columns;
    const expandedRow=function(record){
      return <Card><ReactJson src={record} /></Card>
    }
    return (
      <Card title="可迁移的数据列表" >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'标记为可迁移','把设计数据标记为需要迁移的数据!',this.changestatus)} icon="check" disabled={!hasSelected} >标记为可迁移</Button>
                    <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'禁止迁移','把设计数据标识为禁止迁移状态!',this.changeStopStatus)} icon="delete" disabled={!hasSelected} >禁止迁移</Button>
                    </ButtonGroup>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              rowSelection={rowSelection}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              size='small'
              expandedRowRender={expandedRow}
            />
      </Card>
    );
  }
}

export default ListPublishDatas;
