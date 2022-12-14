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

  //????????????
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
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
      title: '?????????????????????????????????????',
      content: '??????:?????????????????????!',
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
      title: '????????????',
      dataIndex: 'nodeText',
      width:'35%',
      },{
        title: '??????Id',
        dataIndex: 'nodeId',
        width: '20%',
      },{
        title: '??????',
        dataIndex: 'sort',
        width: '10%'
      },{
        title: '?????????',
        dataIndex: 'creator',
        width: '10%'
      },{
        title: '????????????',
        dataIndex: 'createTime',
        width: '15%'
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'150%',
        render: (text,record) => {
          return (<span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >??????</a>
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
        <Modal key={Math.random()} title="????????????" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewServiceCategoryNode id={currentId} appId={this.appId} rootName={this.rootName}  categoryId={this.categoryId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
            <ButtonGroup   >
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >??????????????????</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >??????</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportConfig)}
              icon="download" disabled={!hasSelected}  >??????</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>
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
