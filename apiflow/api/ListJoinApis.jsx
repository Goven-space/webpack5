import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';

//列出所有被编排的API列表

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.CORE_ESB_API.listJoinApis; //分页显示

class ListJoinApis extends React.Component {
  constructor(props) {
    super(props);
    this.applicationId=this.props.applicationId;
    this.processId=this.props.processId||'*';
    this.url=LIST_URL+"?applicationId="+this.applicationId+"&processId="+this.processId;
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"apiUrl":value,"configId":value};
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
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '10%',
        sorter:true
      },{
        title: 'API URL',
        dataIndex: 'apiUrl',
        width: '30%',
        ellipsis: true,
      },{
        title: '流程名称',
        dataIndex: 'processName',
        width: '20%',
        sorter:true,
      },{
        title: '引用节点',
        dataIndex: 'nodeName',
        width: '15%'
      },{
        title: '节点Id',
        dataIndex: 'nodeId',
        width: '10%',
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%',
      }];

    return (
      <div style={{minHeight:600,margin:'5px'}}>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
              <ButtonGroup>
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
              </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                 placeholder="URL"
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
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
        </div>
    );
  }
}

export default ListJoinApis;
