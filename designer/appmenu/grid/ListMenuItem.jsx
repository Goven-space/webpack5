import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider,Popover } from 'antd';
import NewMenuItem from '../form/NewMenuItem';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const listByPage=URI.CORE_APPMENU_ITEM.page;
const DELETE_URL=URI.CORE_APPMENU_ITEM.delete;
const GETBYID_URL=URI.CORE_APPMENU_ITEM.getById;

class ListMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId;
    this.appId=this.props.appId;
    this.sorter = {};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      columns:[],
      loading: true,
      visible:false,
      currentId:'',
      parentNodeId:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field}: {};
    this.loadData(pagination);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',parentNodeId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }else if(action==="NewSubNode"){
      this.setState({visible: true,currentId:'',parentNodeId:record.nodeId});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除数据后不可恢复!',
      onOk(){
        let ids=self.state.selectedRowKeys.join(",");
        return self.deleteData(ids);
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    let url=listByPage+"?categoryId="+this.categoryId;
    const filters = {}
    GridActions.loadData(this,url,pagination,filters,this.sorter);
  }

  deleteData=(argIds)=>{
    let postData={"ids":argIds};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      AjaxUtils.showInfo(data.msg);
      this.loadData();
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentNodeId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '菜单名称',
        dataIndex: 'menuName',
        width: '40%'
      },{
        title: '菜单Id',
        dataIndex: 'nodeId',
        width: '18%',
        sorter:true,
      },{
        title: '排序',
        dataIndex: 'sortNum',
        width: '10%',
      },{
        title: '权限',
        dataIndex: 'permission',
        width: '10%',
        render: (text,record) => {
          let value="";
          if(record.permission!=='' && record.permission!==undefined){
            value="绑定:"+record.permission;
          }
          if(record.excPermission!=='' && record.excPermission!==undefined){
            value+="排除:"+record.excPermission;
          }
          if(value===''){return '无';}else{
            return <Popover content={value} title="权限列表" >
            <a >查看</a>
            </Popover>;
          }
        }
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '10%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'17%',
        render: (text,record) => {
          return <div>
                <a  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a>
                <Divider type="vertical"/>
                <a  onClick={this.onActionClick.bind(this,"NewSubNode",record)} >新增子菜单</a>
                </div>
          }
      },];
    return (
      <div>
        <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            width='950px'
            style={{top:'20px'}}
            onCancel={this.handleCancel} >
            <NewMenuItem id={currentId}  appId={this.appId} categoryId={this.categoryId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <ButtonGroup  style={{marginTop:2}} >
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增菜单</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
          </ButtonGroup>
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
          size='small'
          rowSelection={rowSelection}
        />
    </div>
    );
  }
}

export default ListMenuItem;
