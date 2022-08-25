import React from 'react';
import {Tabs,Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag  } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewPermission from '../form/NewPermission';
import EditPermissionsMapResInner from './EditPermissionsMapResInner';
import EditPermissionMapRole from '../../org/grid/EditPermissionMapRole';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const LIST_URL=URI.CORE_PERMISSIONS.listByPage;
const DELETE_URL=URI.CORE_PERMISSIONS.delete;
const COPY_URL=URI.CORE_PERMISSIONS.copy;

class ListPermissionsByAppId extends React.Component {
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
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
  }

  //Tab相关函数
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
  tabRemove=(targetKey)=>{
      let tabActiveKey = this.state.tabActiveKey;
      let lastIndex;
      this.state.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      if (lastIndex >= 0 && tabActiveKey === targetKey) {
        tabActiveKey = panes[lastIndex].key;
      }else{
        tabActiveKey="home";
      }
      this.setState({ panes, tabActiveKey });
  }
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //增加一个Tab
  addTabPane=(id,name,record)=>{
      const panes = this.state.panes;
      let tabActiveKey = id;
      let content;
      if(id==='New'){
        //新增权限
        content=(<NewPermission appId={this.props.appId} id='' closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改权限
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewPermission appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
      }
      const paneItem={ title: name, content: content, key: tabActiveKey };
      if(!this.containsTab(panes,paneItem)){
        if(panes.length>=5){
          panes.splice(-1,1,paneItem);
        }else{
          panes.push(paneItem);
        }
    }
      this.setState({ panes, tabActiveKey});
  }

  containsTab(arr, obj) {
      var i = arr.length;
      while (i--) {
          if (arr[i].key === obj.key) {
              return true;
          }
      }
      return false;
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"permissionName":value,"permissionId":value};
    sorter={"order":'ascend',"field":'permissionId'};//使用roleName升序排序
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '权限名称',
        dataIndex: 'permissionName',
        width: '30%',
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
        title: '应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
        }
      },];

    const expandedRow=(record)=>{
      return (
        <Card>
          <Tabs
            animated={false}
            hideAdd={true}
          >
            <TabPane tab="绑定服务API" key="tab_service" style={{padding:'0px'}}>
              <EditPermissionsMapResInner appId={this.props.appId} permissionId={record.permissionId} permissionName={record.permissionName} closeTab={this.closeCurrentTab}/>
            </TabPane>
            <TabPane tab="绑定角色" key="tab_role" style={{padding:'0px'}}>
              <EditPermissionMapRole permissionId={record.permissionId} permissionName={record.permissionName} />
            </TabPane>
        </Tabs>
       </Card>
        );
    }

    return (
      <Tabs
        onChange={this.onTabChange}
        onEdit={this.onTabEdit}
        type="editable-card"
        activeKey={this.state.tabActiveKey}
        animated={false}
        hideAdd={true}
      >
      <TabPane tab="权限管理" key="home" style={{padding:'0px'}}>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
          <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增权限</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
          </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="权限名称或Id"
              style={{ width: 200 }}
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
      </TabPane>
      {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
    </Tabs>
    );
  }
}

export default ListPermissionsByAppId;
