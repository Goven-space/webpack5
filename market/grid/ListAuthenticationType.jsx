import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Popover,Badge} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as GridActions from '../../core/utils/GridUtils';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ListCategoryData from './ListAuthenticationConfig';

//认证信息配置

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.MARKET.ADMIN.authorizationTypeList; //分页显示

class ListAuthenticationType extends React.Component {
  constructor(props) {
    super(props);
    this.appId='market';
    this.url=LIST_URL+"?appId="+this.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"categoryName":value,"categoryId":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '认证配置名称',
        dataIndex: 'categoryName',
        width: '25%',
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.dataCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
        title: '分类id',
        dataIndex: 'categoryId',
        width: '15%',
        sorter:true,
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '60%',
      }];

    const expandedRow=(record)=>{
      return (<Card><ListCategoryData categoryId={record.categoryId} record={record} appId={record.appId} /></Card>);
    }

    return (
      <div style={{minHeight:600}}>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup  style={{marginTop:2}} >
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
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

export default ListAuthenticationType;
