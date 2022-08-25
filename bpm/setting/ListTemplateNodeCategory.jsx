import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewServiceCategoryNode from './NewServiceCategoryNode';
import ListTemplateNode from './ListTemplateNode';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPSERVICECATEGORY.ListTreeGridDataUrl;
const DELETE_URL=URI.CORE_APPSERVICECATEGORY.Delete;
const exportConfigUrl=URI.CORE_APPSERVICECATEGORY.exportConfig;

class ListTemplateNodeCategory extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId;
    this.appId=this.props.appId;
    this.rootName=this.props.rootName;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      parentNodeId:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
      if(this.categoryId!==nextProps.categoryId){
        this.categoryId=nextProps.categoryId;
          this.rootName=nextProps.rootName;
        this.loadData();
      }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
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

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(exportConfigUrl,{ids:ids},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        window.open(URI.baseResUrl+data.msg); //msg为文件路径
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?categoryId="+this.categoryId+"&rootName="+this.rootName;
    GridActions.loadData(this,url,pagination,filters,sorter);
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
      this.setState({visible: false,});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确认要删除选中组件分类吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentNodeId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '分类名称',
      dataIndex: 'nodeText',
      width:'35%',
      },{
        title: '唯一Id',
        dataIndex: 'nodeId',
        width: '20%',
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '10%'
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%'
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'150%',
        render: (text,record) => {
          return (<span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            </span>)
        }
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} bodyStyle={{padding:8}}>
            <ListTemplateNode categoryId={record.nodeId} />
          </Card>
          );
      }

    return (
      <div >
        <Modal key={Math.random()} title="分类属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewServiceCategoryNode id={currentId} appId={this.appId} rootName={this.rootName}  categoryId={this.categoryId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
            <ButtonGroup   >
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增组件分类</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)}
              icon="download" disabled={!hasSelected}  >导出</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}

export default ListTemplateNodeCategory;
