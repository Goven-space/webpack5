import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';
import NewApplication from '../form/NewApplication';
import InstallApplication from '../form/InstallApplication';
import ListCategory from './ListCategory';

//Etl应用管理

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.APPLICATION.listByPage;
const DELETE_URL=URI.ETL.APPLICATION.delete;
const DOWNLOAD_URL=URI.ETL.APPLICATION.download;

const appUrl=URI.rootPath+"/etl/application";

class ListApplicationsManager extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId='ETLAppCategory';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      action:'',
      visible:false,
      newApp:'1',
    }
  }

  componentDidMount(){
      this.loadData();
      ContextUtils.getSystemPermissions((data)=>{
        this.setState({newApp:data.newApp})
      });
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
    }else if(action==="Install"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Category"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  download=(appId)=>{
    let url=DOWNLOAD_URL+"?applicationId="+appId;
    window.location.href=url;
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中应用吗?',
      content: '注意:将删除本应用下的流程以及规则等全部数据且不可恢复!',
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
    searchFilters={"applicationName":value,"applicationId":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '应用名称',
        dataIndex: 'applicationName',
        width: '18%',
        sorter: true,
        render:(text,record)=>{
          return <a onClick={this.openApp.bind(this,record.applicationId)} >{text}</a>;
        }
      },{
        title: '应用Id',
        dataIndex: 'applicationId',
        width: '10%',
        sorter: true
      },{
        title: '开发权限',
        dataIndex: 'designer',
        width: '15%',
        ellipsis: true,
        render:(text,record)=>{
          return text.join(",");
        }
      },{
        title: '创建者',
        dataIndex: 'creatorName',
        width:'10%'
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width:'13%'
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            <Divider type="vertical" />
            <a onClick={AjaxUtils.showConfirm.bind(this,"打包下载","确定要打包下载本应用吗?",this.download.bind(this,record.applicationId))} >打包下载</a>
            </span>;
        }
      },];

      let modelForm,modalTitle;
      if(this.state.action==='Install'){
          modalTitle='安新应用'
          modelForm=(<InstallApplication close={this.closeModal} />);
      }else if(this.state.action==='Category'){
          modalTitle='应用分类管理'
          modelForm=(<ListCategory appId={this.appId} categoryId={this.categoryId} rootName='应用分类管理'  close={this.closeModal} />);
      }else{
          modalTitle='应用属性'
          modelForm=(<NewApplication ref="NewAppForm" id={currentId} close={this.closeModal} />);
      }

    return (
      <div style={{minHeight:'600px'}}>
          <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='950px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {modelForm}
          </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            {this.state.newApp==='0'?'':<Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新建应用</Button>}
            <Button  type="ghost" onClick={this.onActionClick.bind(this,'Install')} icon="cloud-download-o" >安装应用</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={this.onActionClick.bind(this,'Category')} icon="appstore" >分类管理</Button>
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
      </div>
    );
  }
}

export default ListApplicationsManager;
