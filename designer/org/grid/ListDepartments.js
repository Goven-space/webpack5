import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewCompany from '../form/NewDepartment';

const confirm = Modal.confirm;
const LIST_URL=URI.CORE_ORG_DEPT.list;
const DELETE_URL=URI.CORE_ORG_DEPT.delete;
const exporConfigUrl=URI.CORE_ORG_DEPT.exporConfigUrl; //导出部门

class ListDepartments extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      parentDepartmentCode:'',
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
      this.setState({visible: true,currentId:'',parentDepartmentCode:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }else if(action==="NewSubDept"){
      this.setState({visible: true,currentId:'',parentDepartmentCode:record.departmentCode});
    }
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

  //导出所有用户
  exportConfig=()=>{
    let url=exporConfigUrl;
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentDepartmentCode}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '部门名称',
      dataIndex: 'departmentName',
      width:'25%'
      },{
        title: '部门编码',
        dataIndex: 'departmentCode',
        width: '15%',
      },{
        title: '路径',
        dataIndex: 'departmentNamePath',
        width: '30%',
      },{
        title: '级别',
        dataIndex: 'departmentLevel',
        width: '10%'
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '10%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          if(record.departmentLevel==='0'){return "-";}
          return (<Dropdown  overlay={
            <Menu style={{width:80}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑部门</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除部门","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除部门</Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"NewSubDept",record)} >新增部门</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>)}
      },];

    return (
      <Card title="部门管理" style={{minHeight:'600px'}}>
        <Modal key={Math.random()} title="部门属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewCompany id={currentId} parentDepartmentCode={parentDepartmentCode} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增部门</Button>{' '}
          <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出部门','导出所有部门后可以使用导入功能重新导入!',this.exportConfig)} icon="download"   >导出</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          defaultExpandAllRows={true}
        />
    </Card>
    );
  }
}

export default ListDepartments;
