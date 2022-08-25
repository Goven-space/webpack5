import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewRole from '../form/NewRole';
import EditRoleMember from './EditRoleMember';
import ListSelectRoleMapPermission from '../../designer/grid/ListSelectRoleMapPermission';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_USER_ROLE.list; //显示全部角色
const DELETE_URL=URI.CORE_USER_ROLE.delete;//删除角色
const exporConfigUrl=URI.CORE_USER_ROLE.exporConfigUrl; //导出角色

class ListRoles extends React.Component {
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
      roleName:'',
      roleAppId:'',
      searchKeyWords:'',
      action:'',
      modelTitle:'角色属性',
      modelType:'NewRole',
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
      this.setState({action:action,visible: true,currentId:'',roleName:record.roleName});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({action:action,visible: true,currentId:record.id,roleName:record.roleName});
    }else if(action==="MemberMgr"){
      this.setState({action:action,visible: true,currentId:record.roleCode,roleName:record.roleName});
    }else if(action==='Permission'){
      this.setState({action:action,currentId:record.roleCode,roleName:record.roleName,roleAppId:record.appId,visible: true});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={"order":'ASC',"field":'sort'})=>{
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
    searchFilters={"roleName":value,"roleCode":value};
    sorter={"order":'ascend',"field":'sort'};//使用roleName升序排序
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  //导出
  exportConfig=()=>{
    let url=exporConfigUrl;
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,roleName,roleAppId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '角色名',
      dataIndex: 'roleName',
      sorter: true,
      width:'18%',
      render:(text,record)=>{
          return (<span><Icon type="user" />{text}</span>);
        }
      },{
        title: '角色编码',
        dataIndex: 'roleCode',
        width: '15%',
        sorter: true,
      },{
        title: '应用',
        dataIndex: 'appId',
        width: '10%',
        sorter: true,
      },{
        title: '所属部门',
        dataIndex: 'departmentName',
        width: '20%',
        sorter: true,
      },{
        title: '成员数',
        dataIndex: 'memberNum',
        width: '10%',
        render:(text,record)=>{
          return <Tag color="green">{text}</Tag>;
        }
      },{
        title: '级别',
        dataIndex: 'roleLevel',
        width: '8%',
        sorter: true,
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '8%',
        sorter: true,
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
              <a  onClick={AjaxUtils.showConfirm.bind(this,"删除角色","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</a>
            </span>
          );
        }
      },];

    let modelContent;
    let width='700px';
    let action=this.state.action;
    this.state.modelTitle='';
    modelContent=(<NewRole id={currentId} closeModal={this.closeModal} appId={this.props.appId} />);

    const expandedRow=(record)=>{
      return (
        <Card>
          <Tabs size="large">
            <TabPane  tab="角色绑定权限" key="props"  >
              <ListSelectRoleMapPermission orgResCode={record.roleCode} orgResName={record.roleName} appId={record.appId} closeModal={this.closeModal} />
            </TabPane>
            <TabPane  tab="角色成员管理" key="users"  >
              <EditRoleMember roleCode={record.roleCode} roleName={roleName} closeModal={this.closeModal} />
            </TabPane>
          </Tabs>
        </Card>
        );
    }

    return (
      <div style={{minHeight:600}}>
            <Modal key={Math.random()} title={this.state.modelTitle} maskClosable={false}
                visible={this.state.visible}
                width={width}
                style={{ top: 45 }}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {modelContent}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增角色</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出角色','导出所有角色后可以使用导入功能重新导入!',this.exportConfig)} icon="download"   >导出</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 <Search
                  placeholder="搜索角色名或Id"
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
              expandedRowRender={expandedRow}
            />
      </div>
    );
  }
}

export default ListRoles;
