import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as GridActions from '../../core/utils/GridUtils';
import NewControlpanel from './form/NewControlpanel';

//网关路由分类管理

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_BUSINESSLOG_APPCONFIG.list;
const DELETE_URL=URI.CORE_BUSINESSLOG_APPCONFIG.delete;

class Controlpanel extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      action:'',
      visible:false,
      searchValue:"",
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
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中日志查询字段嘛',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
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
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    if(value!=''){
      searchFilters={"field":value};
    }
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns=[{
        title: '字段',
        dataIndex: 'field',
        width: '15%',
        sorter: true
      },{
        title: '字段描述',
        dataIndex: 'fieldDes',
        width: '15%'
      },{
        title: '是否是查询条件',
        dataIndex: 'queryCondition',
        width: '10%',
        render:(text,record) => {
          let queryCondition=record.queryCondition;
          if(queryCondition=='1'){
              return <span>是</span>;
          }else{
            return <span>否</span>;
          }
        }
      },{
        title: '是否是表头',
        dataIndex: 'tableHeader',
        width: '10%',
        render:(text,record) => {
          let tableHeader=record.tableHeader;
          if(tableHeader==1){
              return <span>是</span>;
          }else{
            return <span>否</span>;
          }
        }
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '15%'
      },{
        title: '排序',
        dataIndex: 'tableHeaderIndex',
        width: '8%'
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return <a   onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>;
        }
      }];

    return (
      <Card title="业务日志控制面板" style={{minHeight:'600px'}}>
          <Modal key={Math.random()} title="字段属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='750px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewControlpanel ref="NewAppForm" id={currentId} close={this.closeModal} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新建字段</Button>{' '}
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button> {' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="字段名称"
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

export default Controlpanel;
