import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import ReactJson from 'react-json-view'

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DATAPUBLISH.approverCategorysDataList; //分页显示

class ListApproverCategorysDatas extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.id=this.props.id;
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
    let url=LIST_URL+"?id="+this.id+"&parentId="+this.parentId;
    GridActions.loadData(this,url,pagination,filters,sorter);
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
      <Card title="需要更新的设计" >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
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

export default ListApproverCategorysDatas;
