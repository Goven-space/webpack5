import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewPartTimeDepartment from '../form/NewPartTimeDepartment';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_USERMAP_PERSON.list; //显示全部具有兼职配置的人员
const DELETE_URL=URI.CORE_USERMAP_PERSON.delete;//删除兼职配置

class ListPersonsPartTimeDept extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
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
      this.setState({visible: true,currentId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
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
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
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
    searchFilters={"userName":value,"userId":value};
    sorter={"order":'ascend',"field":'userName'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '用户名',
      dataIndex: 'userName',
      sorter: true,
      width:'15%',
      render:(text,record)=>{
          return (<span><Icon type="user" />{text}</span>);
        }
      },{
        title: '用户Id',
        dataIndex: 'userId',
        width: '15%',
        sorter: true,
      },{
        title: '所属部门',
        dataIndex: 'departmentName',
        width: '20%'
      },{
        title: '兼职部门',
        dataIndex: 'partTimeDepartmentName',
        width: '20%'
      },{
        title: '兼任职位',
        dataIndex: 'partTimeJobDesc',
        width: '10%'
      },{
        title: '状态',
        dataIndex: 'partTimeFlag',
        width: '10%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a></Menu.Item>
                <Menu.Item>
                  <a href="javascript:void(0)"   >
                   <Popconfirm title="狠心删除?" onConfirm={this.onActionClick.bind(this,"Delete",record)}>删除</Popconfirm>
                  </a>
                </Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

    return (
      <Card title="兼职管理" style={{minHeight:600}}>
	     <Modal key={Math.random()} title="兼职属性" maskClosable={false}
                visible={this.state.visible}
                width='600px'
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewPartTimeDepartment id={currentId} closeModal={this.closeModal} />
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增兼职</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 <Search
                  placeholder="搜索用户名或Id"
                  style={{ width: 160 }}
                  prefix={<Icon type="user" />}
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
            />
      </Card>
    );
  }
}

export default ListPersonsPartTimeDept;
