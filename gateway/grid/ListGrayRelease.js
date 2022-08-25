import { Button, Card, Col, Input, Modal, Row, Table } from 'antd';
import React from 'react';
import * as URI from '../../core/constants/RESTURI';
import * as GridActions from '../../core/utils/GridUtils';
import NewGrayRelease from '../form/NewGrayRelease';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_GRAY.list;
const DELETE_URL=URI.CORE_GATEWAY_GRAY.delete;

class ListGrayRelease extends React.Component {
  constructor(props) {
    super(props);
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.sorter = {}
    this.searchFilters = {}
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
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
    this.sorter = sorter.order ? {"order":sorter.order,"field":sorter.field}:{};
    this.loadData(pagination);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中策略吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {}
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    const filters = {}
    GridActions.loadData(this,LIST_URL,pagination,filters,this.sorter,this.searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    this.searchFilters = value ? {"configName":value,"configId":value} : {};
    this.loadData(this.defaultPagination);
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '策略名称',
        dataIndex: 'configName',
        width: '20%',
        sorter: true,
      },{
        title: '策略Id',
        dataIndex: 'configId',
        width: '15%',
        sorter: true
      },{
        title: 'BeanId',
        dataIndex: 'beanId',
        width: '15%',
        sorter: true
      },{
        title: '默认参数',
        dataIndex: 'defaultParamsValue',
        width: '15%',
        sorter: true
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '15%',
        sorter: true
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return (<span><a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></span>);
        }
      },];


    return (
      <Card style={{minHeight:'600px'}} title='灰度发布策略管理' >
          <Modal key={Math.random()} title='策略属性' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewGrayRelease  id={currentId} close={this.closeModal} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新增策略</Button>{' '}
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button> {' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="策略名称|策略Id"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
    </Card>
    );
  }
}

export default ListGrayRelease;
