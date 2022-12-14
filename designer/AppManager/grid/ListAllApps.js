import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';
import NewApp from '../form/NewApp';
import InstallApp from '../form/InstallApp';
import ListCategoryNode from './ListAppCategoryNode';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_APP.listByPage;
const DELETE_URL=URI.LIST_APP.delete;
const NEW_VERSION_URL=URI.CORE_APPVERSIONS.newVersion;
const appUrl=URI.rootPath+"/designer";
const OUTDATA_URL=URI.CORE_APPVERSIONS.outInitData;
const PUBLISH_URL=URI.CORE_APIPORTAL_PUBLISH.publishAll;

class ListAllApps extends React.Component {
  constructor(props) {
    super(props);
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
    }else if(action==="Domain"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  newVersion=(appId)=>{
    this.setState({loading: true,});
    AjaxUtils.post(NEW_VERSION_URL,{appId:appId},(data)=>{
      if(data.state===false){
        Modal.error({title: '????????????',content:"??????????????????????????????????????????!",width:600});
      }else{
        Modal.info({title: '????????????',content:"????????????,?????????????????????????????????????????????!",width:600});
      }
      this.setState({loading: false});
    });
  }

  outInitData=()=>{
    this.setState({loading:true});
    let appIds=this.state.selectedRows.map(item=>{return item.appId}).join(",");
    AjaxUtils.post(OUTDATA_URL,{appIds:appIds},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError("???????????????????????????!");
      }else{
          AjaxUtils.showInfo("????????????????????????("+data.msg+")?????????!");
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '??????????????????????????????????',
      content: '??????:?????????????????????!',
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

  //??????ajax??????????????????
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

  //??????ajax??????????????????
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"appName":value,"appId":value};
    sorter={"order":'ascend',"field":'createTime'};//??????userName????????????
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '??????',
      dataIndex: 'state',
      width:'8%',
      render:text => {
            let stateName=text;
            if(text==="DEV"){
              return <Tag color="#f50" style={{width:50}} >?????????</Tag>;
            }else if(text==="END"){
              return <Tag color="#87d068" style={{width:50}} >?????????</Tag>;
            }else if(text==="??????"){
              return <Tag color="blue" style={{width:50}} >??????</Tag>;
            }else{
              return <Tag  color="#108ee9" style={{width:50}} >{stateName}</Tag>
            }
          }
      },{
        title: '????????????',
        dataIndex: 'appName',
        width: '18%',
        sorter: true,
        render:(text,record)=>{
          return <a onClick={this.openApp.bind(this,record.appId)} >{text}</a>;
        }
      },{
        title: '??????Id',
        dataIndex: 'appId',
        width: '15%',
        sorter: true
      },{
        title: 'API????????????',
        dataIndex: 'readRole',
        width: '15%',
        ellipsis: true
      },{
        title: '????????????',
        dataIndex: 'designer',
        width: '15%',
        ellipsis: true
      },{
        title: '?????????',
        dataIndex: 'creatorName',
        width:'10%',
        sorter: true
      },{
        title: '?????????',
        dataIndex: 'versionCount',
        width: '8%',
        render:(text,record)=>{return <Tag>{text}</Tag>}
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <span>
            <a onClick={this.onActionClick.bind(this,"Edit",record)} >??????</a>
            <Divider type="vertical" />
            <a onClick={AjaxUtils.showConfirm.bind(this,"????????????","???????????????????????????????",this.newVersion.bind(this,record.appId))} >??????</a>
            </span>;
        }
      },];

      let modelForm,modalTitle;
      if(this.state.action==='Install'){
          modalTitle='????????????'
          modelForm=(<InstallApp ref="InstallApp" close={this.closeModal} />);
      }else if(this.state.action==='Category'){
          modalTitle='??????????????????'
          modelForm=(<ListCategoryNode appId={this.appId} categoryId='AppCategory' rootName='??????????????????'  close={this.closeModal} />);
      }else{
          modalTitle='????????????'
          modelForm=(<NewApp ref="NewAppForm" id={currentId} close={this.closeModal} />);
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
            {this.state.newApp==='0'?'':<Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >????????????</Button>}
            <Button  type="ghost" onClick={this.onActionClick.bind(this,'Install')} icon="cloud-download-o" >????????????</Button>
            <Button  icon="download" onClick={AjaxUtils.showConfirm.bind(this,'?????????????????????','??????????????????????????????????????????????????????,???????????????????????????????????????????????????!',this.outInitData)}  >????????????</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >??????</Button>
            <Button  type="ghost" onClick={this.onActionClick.bind(this,'Category')} icon="appstore" >????????????</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             ??????:<Search
              placeholder="?????????????????????id"
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

export default ListAllApps;
