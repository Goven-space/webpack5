import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import { browserHistory } from 'react-router'
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import NewApp from '../form/NewApplication';
import ImportData from '../../portal/ImportData';
import ListApiByManager from '../lifecycle/apiregister/ListApiByManager'; //所有未发布的和已发布的
import ListApiCategoryNode from './ListApiCategoryNode';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_APIPORTAL_APPLICATION.list;
const DELETE_URL=URI.LIST_APIPORTAL_APPLICATION.delete;
const PUBLISH_URL=URI.CORE_APIPORTAL_PUBLISH.publishAll;
const DOWNLOAD_URL=URI.LIST_APIPORTAL_APPLICATION.download;

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
      showRegApiGrid:false,
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
    }else if(action==="Install"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '警告:如果应用与其他模块相关联则会删除其他模块发布的API，确定要删除吗?',
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
    searchFilters={"portalAppName":value,"portalAppId":value,"creator":value,"creatorName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?action=3";
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
    browserHistory.push(URI.adminIndexUrl+"/apiportal/api?appid="+portalAppId);
  }

  download=(appId)=>{
    let url=DOWNLOAD_URL+"?portalAppId="+appId;
    window.location.href=url;
  }

  componentWillReceiveProps=(nextProps)=>{
    this.setState({showRegApiGrid:false});
  }

  showRegApiGrid=(record)=>{
    this.setState({showRegApiGrid:true,currentRecord:record});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '应用名称',
        dataIndex: 'portalAppName',
        width: '15%',
        sorter: true
      },{
        title: '应用Id',
        dataIndex: 'portalAppId',
        width: '12%',
        sorter: true
      },{
        title: 'API注册数',
        dataIndex: 'total_reg',
        width:'10%',
        render: (text,record) => {return <span style={{fontSize:'14px',color:'green'}}>{text}</span>}
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
        width:'15%',
        render: (text,record) => {
            return (
            <span>
              <a onClick={this.showRegApiGrid.bind(this,record)} >API管理</a>
              <Divider type="vertical" />
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
              <Divider type="vertical" />
              <a onClick={AjaxUtils.showConfirm.bind(this,"打包下载","确定要打包下载本应用吗?",this.download.bind(this,record.portalAppId))} >打包</a>
            </span>
            );
        }
      },];

      let modelForm,modalTitle;
      if(this.state.action==='Install'){
          modalTitle='导入应用'
          modelForm=(<ImportData close={this.closeModal} />);
      }else{
          modalTitle=''
          modelForm=(<NewApp  id={currentId} close={this.closeModal} />);
      }

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} bodyStyle={{padding:8}}>
            <ListApiCategoryNode  appId={record.portalAppId} categoryId={record.portalAppId+'.ServiceCategory'}  closeModal={this.closeModal} />;
          </Card>
          );
      }

    return (
      <div>
        <Modal key={Math.random()} title={modalTitle} maskClosable={false}
          visible={this.state.visible}
          footer=''
          width='850px'
          style={{ top: 20}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          {modelForm}
        </Modal>
        {this.state.showRegApiGrid==false?
          <div>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus" >新建应用</Button>
                <Button  type="ghost" onClick={this.onActionClick.bind(this,'Install')} icon="cloud-download-o" >导入应用</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="应用名|应用id|创建者"
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
              expandedRowRender={expandedRow}
            />
        </div>
      :
          <ListApiByManager appId={this.state.currentRecord.portalAppId} apiReg={true} />
      }
    </div>
    );
  }
}

export default ListApplication;
