import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,DatePicker} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import ListApproverCategorysDatas from './ListApproverCategorysDatas';

//待审核的数据分类列表

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_DATAPUBLISH.approverCategorysList; //分页显示

class ListApproverCategorys extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.state={
      pagination:{pageSize:150,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: false,
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
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }
  }

  searchData=()=>{
    this.searchFlag='1';
    this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFlag='0';
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?id="+this.id;
    GridActions.loadData(this,url,pagination,filters,sorter,{});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '需要更新的数据分类',
        dataIndex: 'categoryName',
        width: '40%',
      },{
        title: '数据说明',
        dataIndex: 'categoryRemark',
        width: '45%',
      },{
        title: '查询时间',
        dataIndex: 'creatTime',
        width: '15%',
      }];
      const expandedRow=(record)=>{
        return (
          <ListApproverCategorysDatas parentId={this.id} id={record.id} columns={record.columns} />
          );
      }
    return (
      <div>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={8} >
                <ButtonGroup>
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

export default ListApproverCategorys;
