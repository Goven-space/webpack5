import React from 'react';
import { Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditPermissionMapRole from './EditPermissionMapRole';
import EditPermissionsMapResInner from '../../designer/grid/EditPermissionsMapResInner';
import NewPermission from '../../designer/form/NewPermission';

const confirm = Modal.confirm;
const Search = Input.Search;
const LIST_URL=URI.CORE_PERMISSIONS.listByPage;
const DELETE_URL=URI.CORE_PERMISSIONS.delete;
const TabPane = Tabs.TabPane;

class ListAllPermissions extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      curRecord:{},
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
      this.addTabPane('New','新增权限');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',record.permissionName,record);
    }
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"permissionName":value,"permissionId":value};
    sorter={"order":'ascend',"field":'permissionName'};//使用roleName升序排序
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }
  showService=(record)=>{
    this.setState({visible: true,curRecord:record});
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '权限名称',
        dataIndex: 'permissionName',
        width: '25%',
        sorter: true
      },{
        title: '权限Id',
        dataIndex: 'permissionId',
        width: '20%',
        sorter: true
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '30%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'15%',
        sorter: true,
      },{
        title: '修改',
        dataIndex: 'serviceList',
        width:'10%',
        render:(text,record)=>{
            return (
              <span>
              <a onClick={this.showService.bind(this,record)}>修改</a>
              <Divider type="vertical" />
              <a href="javascript:void(0)"   >
                <Popconfirm title="狠心删除?" onConfirm={this.deleteData.bind(this,record.id)}>删除</Popconfirm>
              </a>
            </span>
          );
        }
      }];

    const expandedRow=(record)=>{
      return (
        <Card style={{padding:'0',margin:'0'}}>
          <Tabs
            animated={false}
            hideAdd={true}
            size="large"
          >
           <TabPane tab="绑定角色" key="tab_role" style={{padding:'0px'}}>
             <EditPermissionMapRole permissionId={record.permissionId} permissionName={record.permissionName} />
           </TabPane>
            <TabPane tab="绑定服务API" key="tab_service" style={{padding:'0px'}}>
              <EditPermissionsMapResInner appId={record.appId} permissionId={record.permissionId} permissionName={record.permissionName} closeTab={this.closeCurrentTab}/>
            </TabPane>
         </Tabs>
      </Card>
        );
    }

    let appId='';
    let id='';
    if(this.state.curRecord!==undefined && this.state.curRecord!==null ){
      appId=this.state.curRecord.appId;
      id=this.state.curRecord.id;
    }else{
      appId='core';
    }
    return (
      <Card title="权限管理" style={{minHeight:'600px'}}>
        <Modal key={Math.random()} title="权限属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewPermission appId={appId} id={id} closeTab={this.closeModal}/>
        </Modal>
       <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.showService.bind(this,null)} icon="plus-circle-o"  >新增权限</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 <Search
                  placeholder="搜索权限名称或Id"
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
          expandedRowRender={expandedRow}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}

        />
      </Card>
    );
  }
}

export default ListAllPermissions;
