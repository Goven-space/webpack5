import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewCompany from '../form/NewCompany';

const confirm = Modal.confirm;
const LIST_URL=URI.CORE_ORG_COMPANY.list;
const DELETE_URL=URI.CORE_ORG_COMPANY.delete;

class ListCompany extends React.Component {
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
      this.setState({
        visible: false,
      });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '机构名称',
      dataIndex: 'companyName',
      width:'50%'
      },{
        title: '机构编码',
        dataIndex: 'companyCode',
        width: '15%',
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '10%'
      },{
        title: '更新时间',
        dataIndex: 'editTime',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render:(text,record)=>{
            return (
              <span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
              <Divider type="vertical" />
              <a  onClick={AjaxUtils.showConfirm.bind(this,"删除机构","请确认机构下没有部门和用户再删除,删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</a>
            </span>
          );
        }
      },];

    return (
      <Card title='机构管理' style={{minHeight:600}}>
        <Modal key={Math.random()} title="组织属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewCompany id={currentId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o" >新增</Button>{' '}
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
        />
    </Card>
    );
  }
}

export default ListCompany;
