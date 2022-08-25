import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Popover } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as GridActions from '../../../core/utils/GridUtils';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewCategory from '../form/NewCategory';
import ListMenuItem from './ListMenuItem';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPMENU_CATEGORY.page; //分页显示
const DELETE_URL=URI.CORE_APPMENU_CATEGORY.delete;//删除
const exportConfigUrl=URI.CORE_APPMENU_CATEGORY.exportConfig;

class ListMenuCategory extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.url=LIST_URL+"?appId="+this.appId;
    this.sorter = {};
    this.searchFilters = {};
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`}
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {"order":sorter.order,"field":sorter.field} : {};
    this.loadData(pagination);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
    }
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {};
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    const filters = {}
    GridActions.loadData(this,this.url,pagination,filters,this.sorter,this.searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showDevLog=(id)=>{
    this.setState({visible: true,currentId:id,action:'read'});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:此菜单下的子菜单也会被删除,且不能恢复!',
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
    this.searchFilters= value ? {"configName":value,"categoryId":value} : {};
    this.loadData(this.defaultPagination);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '菜单分类名称',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '菜单Id',
        dataIndex: 'categoryId',
        width: '25%',
        sorter:true,
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '15%',
      },{
        title: '排序',
        dataIndex: 'sortNumber',
        width: '10%',
      },{
        title: '菜单服务',
        dataIndex: 'url',
        width: '10%',
        render:(text,record)=>{
              let url=host+"/rest/base/menu/tree?categoryId="+record.categoryId;
              return <Popover content={url} title="菜单数据的URI地址" >
              <a href={url} target='_blank' >API URL</a>
              </Popover>;
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
          return <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
        }
      },];

    const expandedRow=(record)=>{
      return (<Card><ListMenuItem categoryId={record.categoryId} record={record} appId={record.appId} /></Card>);
    }

    return (
      <div style={{minHeight:600}}>
	          <Modal key={Math.random()} title='分类设置' maskClosable={false}
                visible={this.state.visible}
                width='1010px'
                footer=''
                style={{top:'20px'}}
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewCategory appId={this.appId} id={currentId} close={this.closeModal} />
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup  style={{marginTop:2}} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增菜单分类</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                  placeholder="搜索菜单id或名称"
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

export default ListMenuCategory;
