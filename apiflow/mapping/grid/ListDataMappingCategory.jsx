import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Popover,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as GridActions from '../../../core/utils/GridUtils';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewDataMappingCategory from '../form/NewDataMappingCategory';
import DataMappingTest from '../form/DataMappingTest';
import ListDataMappingConfig from './ListDataMappingConfig';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.DATAMAPPING_CATEGORY.page; //分页显示
const DELETE_URL=URI.ESB.DATAMAPPING_CATEGORY.delete;//删除
const COPY_URL=URI.ESB.DATAMAPPING_CATEGORY.copy;//拷贝
const exportConfigUrl=URI.ESB.DATAMAPPING_CATEGORY.exportConfig;

class ListDataMappingCategory extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?applicationId="+this.applicationId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      currentRecord:{},
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
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
    }else if(action==="Test"){
      this.setState({visible: true,currentId:record.id,action:'test',currentRecord:record});
    }else if(action==="Copy"){
      this.copyData(record.id);
    }
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids })
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    sorter={};
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  copyData=(argIds)=>{
    GridActions.copyData(this,COPY_URL,argIds);
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
      title: '删除确认?',
      content: '注意:此配置下的字段也会被删除,且不能恢复!',
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
    searchFilters={"configName":value,"categoryId":value};
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
        title: '映射配置名称',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '配置Id',
        dataIndex: 'categoryId',
        width: '20%',
        sorter:true,
      },{
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '15%',
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%',
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            <Divider type="vertical" />
            <a onClick={this.onActionClick.bind(this,"Test",record)} >测试</a>
            <Divider type="vertical" />
            <a onClick={this.onActionClick.bind(this,"Copy",record)} >复制</a>
          </span>
        }
      },];

    const expandedRow=(record)=>{
      return (<Card><ListDataMappingConfig categoryId={record.categoryId} applicationId={this.applicationId} record={record} appId={record.appId} /></Card>);
    }

    let ModalWindow="",title="";
    if(this.state.action=='test'){
      title="映射测试";
      ModalWindow=<DataMappingTest data={this.state.currentRecord} close={this.closeModal} />
    }else{
      title="配置属性";
      ModalWindow=<NewDataMappingCategory appId={this.appId} applicationId={this.applicationId} id={currentId} close={this.closeModal} />
    }

    return (
      <div style={{minHeight:600}}>
	          <Modal key={Math.random()} title={title} maskClosable={false}
                visible={this.state.visible}
                width='1010px'
                footer=''
                style={{top:'20px'}}
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {ModalWindow}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup  style={{marginTop:2}} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增映射配置</Button>
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
                  placeholder="搜索id或名称"
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

export default ListDataMappingCategory;
