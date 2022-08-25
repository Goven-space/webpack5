import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Popover } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as GridActions from '../../../core/utils/GridUtils';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewCategory from '../form/NewCategory';
import ListCategoryData from './ListCategoryData';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPBASEDATACATEGORY.list; //分页显示
const DELETE_URL=URI.CORE_APPBASEDATACATEGORY.delete;//删除
const exportConfigUrl=URI.CORE_APPBASEDATACATEGORY.exportConfig;

class ListCategory extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.url=LIST_URL+"?appId="+this.appId;
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
      action:'edit',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids });
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
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

  showDevLog=(id)=>{
    this.setState({visible: true,currentId:id,action:'read'});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除分类时此分类下的数据也会被删除!',
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
    searchFilters={"categoryName":value,"categoryId":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '数据分类',
        dataIndex: 'categoryName',
        width: '20%'
      },{
        title: '分类id',
        dataIndex: 'categoryId',
        width: '15%',
        sorter:true,
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '10%',
      },{
        title: '数据API',
        dataIndex: 'treeData',
        width: '15%',
        render:(text,record)=>{
          if(text==='Y'){
              let url=host+"/rest/base/datadic/tree?categoryId="+record.categoryId;
              return <Popover content={url} title="数据分类的URI地址" >
              <a href={url} target='_blank' >API URL</a>
              </Popover>;
          }else if(text==='N'){
            let url=host+"/rest/base/datadic/page?categoryId="+record.categoryId;
            let allUrl=host+"/rest/base/datadic/listall?categoryId="+record.categoryId;
            return <span><Popover content={url} title="分页列出数据API" >
              <a href={url} target='_blank' >分页</a>
            </Popover> <Popover content={url} title="列出所有数据API" >
              <a href={allUrl} target='_blank' >所有</a>
            </Popover></span>;
          }
        }
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '20%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            </span>
        }
      },];

    const expandedRow=(record)=>{
      return (<Card><ListCategoryData categoryId={record.categoryId} record={record} appId={record.appId} /></Card>);
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
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增数据分类</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download" disabled={!hasSelected}  >导出</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
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

export default ListCategory;
