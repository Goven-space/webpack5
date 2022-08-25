import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover} from 'antd';
import { browserHistory } from 'react-router'
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import NewApp from '../../apiportal/form/NewApplication';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_APIPORTAL_APPLICATION.list;
const DELETE_URL=URI.LIST_APIPORTAL_APPLICATION.delete;
const PUBLISH_URL=URI.CORE_APIPORTAL_PUBLISH.publishAll;

class ListApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中应用吗?',
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
    let url=LIST_URL+"?action=2";
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
      this.setState({
        visible: false,
      });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"portalAppName":value,"portalAppId":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?action=me";
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  publish=(appId)=>{
    this.setState({loading:true});
    AjaxUtils.post(PUBLISH_URL,{appId:appId},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo(data.msg);
      }
    });
  }

  openapp=(portalAppId)=>{
    let url=URI.adminIndexUrl+"/apiportal/application?appid="+portalAppId;
    // browserHistory.push(url);
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '应用名称',
        dataIndex: 'portalAppName',
        width: '18%',
        sorter: true,
        render: (text,record) => {return <a onClick={this.openapp.bind(this,record.portalAppId)}>{text}</a>}
      },{
        title: '应用Id',
        dataIndex: 'portalAppId',
        width: '12%',
        sorter: true
      },{
        title: 'API数',
        dataIndex: 'total',
        width:'10%',
        render: (text,record) => {return <a onClick={this.openapp.bind(this,record.portalAppId)}><span style={{fontSize:'16px',color:'green'}}>{text}</span></a>}
      },{
        title: '管理员',
        dataIndex: 'appSuperAdmin',
        width:'10%',
        sorter: true,
        ellipsis: true,
      },{
        title: '审批者',
        dataIndex: 'approverUserId',
        width:'10%',
        sorter: true,
        ellipsis: true,
      },{
        title: '可见范围',
        dataIndex: 'visibleUserIds',
        width:'15%',
        ellipsis: true,
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width: '15%',
        sorter: true
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return (
            <span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            </span>
            );
        }
      },];

    return (
      <Card style={{minHeight:'600px'}} title='应用API管理' >
        <Modal key={Math.random()} title={this.state.action==='snapshot'?'初始化配置':'应用属性'} maskClosable={false}
          visible={this.state.visible}
          footer=''
          width='850px'
          style={{ top: 20}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <NewApp  id={currentId} close={this.closeModal} />
        </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新建应用</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="应用名称或应用id"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
    </Card>
    );
  }
}

export default ListApplication;
