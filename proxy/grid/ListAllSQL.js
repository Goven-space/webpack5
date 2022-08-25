import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'
import PublishAPI from '../form/PublishSQLToAPI';

//所有识别到的SQL语句

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TCPIP_SQL.list;
const DELETE_URL=URI.CORE_TCPIP_SQL.delete;
const CLEAR_URL=URI.CORE_TCPIP_SQL.clear;
const ButtonGroup = Button.Group;
const TabPane = Tabs.TabPane;

class ListAllSQL extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
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
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中日志吗?',
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //清空
  clear=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{parentId:this.parentId},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
      AjaxUtils.showError("已清空!");
      this.loadData();
      }
    });
  }

  showModal=(record)=>{
      this.setState({currentRecord:record,visible: true,});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
          title: '配置名称',
          dataIndex: 'configName',
          width: '15%',
      },{
          title: '服务器',
          dataIndex: 'serverId',
          width: '10%',
      },{
        title: '内容',
        dataIndex: 'body',
        width: '65%',
        ellipsis: true,
      },{
        title: '识别时间',
        dataIndex: 'createTime',
        width: '15%'
      },{
          title: '操作',
          dataIndex: '',
          key: 'x',
          width:'10%',
          render: (text,record) => {
                  return (<span>
                    <a onClick={this.showModal.bind(this,record)} >发布API</a>
                  </span>);
          }
      }];

      const expandedRow=(record)=>{
        return (
        <Card title='识别的SQL语句'>
          <Input.TextArea autoSize value={record.body} />
        </Card>);
      }

    return (
      <div >
        <Modal key={Math.random()} title='发布API接口' maskClosable={false}
            visible={this.state.visible}
            width='750px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <PublishAPI close={this.closeModal} record={this.state.currentRecord} />
        </Modal>

        <ButtonGroup style={{marginBottom:'5px'}} >
        <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
        <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
        <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'清空','需要清空所有日志吗?',this.clear)} icon="delete"   >清空</Button>
        </ButtonGroup>

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

export default ListAllSQL;
