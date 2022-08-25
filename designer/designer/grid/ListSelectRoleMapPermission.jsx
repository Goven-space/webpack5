import React from 'react';
import { Table,Icon,Tag,Button,Card,Input,Row,Col,Checkbox} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const LIST_URL=URI.CORE_PERMISSIONS.listByPage;
const listAllPermissionsByResCode=URI.CORE_PERMISSIONS.listAllPermissionsByResCode;
const deletePermissionMapOrg=URI.CORE_PERMISSIONS.deletePermissionMapOrg;
const addOrgMapPermissions=URI.CORE_PERMISSIONS.addOrgMapPermissions;

class ListSelectRoleMapPermission extends React.Component {
  constructor(props) {
    super(props);
    this.orgResCode=this.props.orgResCode;
    this.orgResName=this.props.orgResName;
    this.appId=this.props.appId;//当前角色所处应用id
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      permissionsData:[],
    }
  }

  componentDidMount(){
      this.loadData();
      this.loadPermissionName();
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
    let appId=this.appId;
    if(appId!==undefined && appId!==''  && appId!==null){
      let value = [appId];
      filters.appId=value; //过虑只显示本应用的服务
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  //获取当前角色已经具有的权限
  loadPermissionName=()=>{
    let url=listAllPermissionsByResCode+"?orgResCode="+this.orgResCode;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        let msg=data.msg||"权限加载失败";
        AjaxUtils.showError(msg);
      }else{
        data.map((item)=>{
          return {id:item.id,permissionsName:item.permissionsName};
        });
        this.setState({permissionsData:data});
      }
      this.setState({loading:false});
    });
  }

  addPermission=(record)=>{
    let appId=this.props.appId;
    let url=addOrgMapPermissions;
    this.setState({loading:true});
    let postJson={
      orgResType:"ROLE",
      orgResCode:this.orgResCode,
      orgResName:this.orgResName,
      permissionId:record.permissionId,
      permissionName:record.permissionName,
      appId:appId,
    };
    AjaxUtils.post(url,postJson,(data)=>{
      if(data.state===false){
        let msg=data.msg||"添加失败";
        AjaxUtils.showError(msg);
        this.setState({loading:false});
      }else{
        // AjaxUtils.showInfo("成功添加");
        this.loadPermissionName();
      }
    });
  }

  deletePermission=(id)=>{
    let url=deletePermissionMapOrg;
    let postData={ids:id};
    this.setState({loading:true});
    AjaxUtils.post(url,postData,(data)=>{
      this.setState({loading:false});
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let appId=this.appId;
    let filters={};
    if(appId!==undefined && appId!==''  && appId!==null){
      let value = [appId];
      filters.appId=value; //过虑只显示本应用的服务
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"permissionName":value,"permissionId":value};
    sorter={"order":'ascend',"field":'permissionId'};//使用roleName升序排序
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  onCheckBoxChange=(e)=>{
    let appId="";
    if(!e.target.checked){
      appId=this.props.appId;
    }
    this.appId=appId;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    let selectItem;
    if(this.state.permissionsData.length>0){
      selectItem=this.state.permissionsData.map(
            item => <Tag color='red' key={item.id}  onClose={this.deletePermission.bind(this,item.id)} closable={true}>{item.permissionName}</Tag>
          );
    }else{
      selectItem=<Tag>未绑定权限</Tag>;
    }
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
        sorter: true
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {return <a  onClick={() =>this.addPermission(record)} >添加</a>}
      },];

    return (
      <span>
        <Card title="已绑定权限">
        {selectItem}
        </Card>
        <br/>
        <Card title="可选权限">
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Checkbox onChange={this.onCheckBoxChange}>显示所有应用的权限</Checkbox>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="搜权限名称或Id"
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
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          size="small"
        />
        </Card>
      </span>
    );
  }
}

export default ListSelectRoleMapPermission;
