import { Button, Col, Icon, Input, Modal, Popconfirm, Row, Table, Tag } from 'antd';
import React from 'react';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListSelectResourceByAppId from './ListSelectResourceByAppId';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_PERMISSIONS.ListPageByPermissionId;
const DELETE_URL=URI.CORE_PERMISSIONS.DeleteResourceById;
const SAVE_RESOURCE_URL=URI.CORE_PERMISSIONS.saveServiceMap;

class EditPermissionsMapResInner extends React.Component {
  constructor(props) {
    super(props);
    this.permissionId=this.props.permissionId;
    this.permissionName=this.props.permissionName;
    this.appId=this.props.appId;
    this.state = {
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      visible:false,
      loading:true,
      rowsData: [],
      selectedRowKeys:[],
      selectedRows:[],
      selectedResourceRowKeys:[],
    };
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

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    this.setState({deleteIds:[]});
    let url=LIST_URL.replace('{permissionId}',this.permissionId);
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  savePermissionResource=()=>{
    this.setState({loading:true,visible:false});
    let postJson={serviceIds:this.state.selectedResourceRowKeys.join(","),permissionId:this.permissionId,permissionName:this.permissionName,appId:this.props.appId};
    AjaxUtils.post(SAVE_RESOURCE_URL,postJson,(data)=>{
      if(data.state===false){
        let msg=data.msg||"添加失败";
        AjaxUtils.showError(msg);
      }else{
        AjaxUtils.showInfo("成功添加");
      }
      this.setState({loading:false});
      this.loadData();
    });
  }

  getSelectedResource=(selectedRowKeys)=>{
      this.state.selectedResourceRowKeys=selectedRowKeys;
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return GridActions.deleteData(self,DELETE_URL,"");
      },
      onCancel() {},
      });
  }

  deleteRow=(id)=>{
    //删除选中行
    this.setState({loading:true});
    let postJson={ids:id};
    AjaxUtils.post(DELETE_URL,postJson,(data)=>{
      if(data.state===false){
        AjaxUtils.showError();
      }else{
        AjaxUtils.showInfo("成功删除("+data.number+")条数据");
      }
      this.setState({loading:false});
      this.loadData();
    });
  }

  showModal=()=>{
    this.setState({visible: true});
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"resourceName":value,"resourceDesc":value};
    let url=LIST_URL.replace('{permissionId}',this.permissionId);
    this.searchFilters=searchFilters;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,data}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns=[{
      title: 'Method',
      dataIndex: 'serviceMethod',
      width:'10%',
      render:text => {
          if(text==="POST"){
              return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
          }else if(text==="GET"){
              return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
          }else if(text==="PUT" || text==="DELETE" ){
              return <Tag color="#f50" style={{width:50}} >{text}</Tag>
          }
        },
      },{
      title: '服务URL',
      dataIndex: 'resourceDesc',
      width:'50%',
    },{
      title: '服务名称',
      dataIndex: 'resourceName',
      width:'30%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (
              <a href="javascript:void(0)"   >
                 <Popconfirm title="狠心删除?" onConfirm={this.deleteRow.bind(this,record.id)} >删除</Popconfirm>
              </a>);
      },
    }];

    return (
      <div>
        <Modal key={Math.random()} title="添加服务资源" maskClosable={false}
            width='850px'
            style={{ top: 20 }}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onOk={this.savePermissionResource}
            cancelText='关闭'
            okText='确定'
            >
            <ListSelectResourceByAppId appId={this.appId} onSelect={this.getSelectedResource} closeModal={this.closeModal} />
        </Modal>

         <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <div style={{paddingBottom:2}} >
            <ButtonGroup>
              <Button type="primary"  onClick={this.showModal} icon="plus-circle-o"  >添加服务</Button>
              <Button  type="ghost" onClick={this.showConfirm} icon="delete"   disabled={!hasSelected} >删除</Button>{' '}
              <Button  onClick={this.refresh} icon="reload"  >刷新</Button>
            </ButtonGroup>
            </div>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             <Search
              placeholder="搜索服名称或url"
              style={{ width: 260 }}
              prefix={<Icon type="user" />}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
        rowKey={record => record.id}
        rowSelection={rowSelection}
        dataSource={rowsData}
        columns={columns}
        loading={this.state.loading}
        size="small"
        onChange={this.onPageChange}
        pagination={pagination}
        />
      </div>
      );
  }
}

export default EditPermissionsMapResInner;
