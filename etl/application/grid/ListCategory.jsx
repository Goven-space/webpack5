import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewCategoryNode from '../form/NewCategoryNode';

const confirm = Modal.confirm;
const LIST_URL=URI.CORE_CATEGORYNODE.syncListAllNodeJson; //仅显示自已创建的
const DELETE_URL=URI.CORE_CATEGORYNODE.delete;

//ETL应用分类管理

class ListCategory extends React.Component {
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?categoryId="+this.categoryId+"&rootName="+this.rootName+"&creatorOnly=1";
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    if(argIds==='root'){AjaxUtils.showError("不能删除根节点!");return;}
    let postData={"ids":argIds};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      AjaxUtils.showInfo(data.msg);
      this.loadData();
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentNodeId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '分类名称',
      dataIndex: 'nodeText',
      width:'35%'
      },{
        title: '分类Id',
        dataIndex: 'nodeId',
        width: '20%',
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '10%'
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return (
            <span>
                 <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
                 <Divider type="vertical" />
                 <a  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</a>
            </span>
          )}
      },];

    return (
      <div>
        <Modal key={Math.random()} title="分类属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width={800}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewCategoryNode id={currentId} rootName={this.rootName} categoryId={this.categoryId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增分类</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table
          size='small'
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          defaultExpandAllRows={true}
        />
    </div>
    );
  }
}

export default ListCategory;
