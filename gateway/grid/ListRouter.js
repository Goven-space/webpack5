import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import NewRouter from '../form/NewRouter';
import ApiQpsAndLogMonitor from '../../monitor/charts/ApiQpsAndLogMonitor';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_ROUTER.list;
const DELETE_URL=URI.CORE_GATEWAY_ROUTER.delete;
const ButtonGroup = Button.Group;
const exportServices=URI.CORE_GATEWAY_ROUTER.exportRouterConfig;
const TabPane = Tabs.TabPane;

class ListRouter extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.gatewayAppId=this.props.gatewayAppId;
		this.defaultPagination = {pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`}
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
      this.loadData(this.defaultPagination);
  }

  componentWillReceiveProps=(nextProps)=>{
    /* if(this.gatewayAppId===nextProps.gatewayAppId){return;}
    this.gatewayAppId=nextProps.gatewayAppId;
    this.state.pagination.current=1;
    this.loadData(); */
		if(this.gatewayAppId !== nextProps.gatewayAppId) {
			this.gatewayAppId = nextProps.gatewayAppId
			this.loadData(this.defaultPagination)
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
  loadData=(pagination=this.state.pagination, filters={}, sorter={},searchFilters={})=>{
    sorter={"order":'ascend',"field":'routerUrl'};
    if(this.gatewayAppId!=='' && this.gatewayAppId!=='all'){
      filters.gatewayAppId=[this.gatewayAppId]; //??????????????????????????????
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
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

  //????????????
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportServices, { ids: ids });
  }

  //??????ajax??????????????????
  search=(value)=>{
    let sorter={};
    let searchFilters={};
    searchFilters={"routerUrl":value,"routerName":value,"serviceName":value};
    sorter={"order":'ascend',"field":'createTime'};//??????userName????????????
    /* let url=this.url;
    let pagination=this.state.pagination;
    pagination.current=1; */
		this.loadData(this.defaultPagination,undefined,sorter,searchFilters)
    /* GridActions.loadData(this,LIST_URL,this.defaultPagination,filters,sorter,searchFilters); */
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
  }

  openRouter=(apiUrl)=>{
    window.open(apiUrl);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '????????????',
        dataIndex: 'routerName',
        width: '15%',
      },{
        title: '????????????',
        dataIndex: 'routerUrl',
        width: '15%',
        render: (text,record) => {
            return (<a onClick={this.openRouter.bind(this,record.apiUrl)} title={record.apiUrl} >{text}</a>);
        }
      },{
        title: '??????????????????/URL',
        dataIndex: 'serviceName',
        width: '20%',
        ellipsis: true
      },{
        title: '??????/??????',
        dataIndex: 'totalAccessNum',
        width:'10%',
        render:(text,record)=>{
          let error=<span>{record.totalFailAccessNum}</span>;
          if(record.totalFailAccessNum!==0){
            error=<span style={{color:'red'}}>{record.totalFailAccessNum}</span>;
          }
          let success=<span style={{color:'green'}}>{text}</span>;
          return <span>{success}/{error}</span>;
        }
      },{
        title: '??????',
        dataIndex: 'averageResTime',
        width:'10%'
      },{
        title: '??????',
        dataIndex: 'sortNum',
        width:'8%'
      },{
        title: '??????',
        dataIndex: 'version',
        width:'8%'
      },{
        title: '??????',
        dataIndex: 'state',
        width:'6%',
        render: (text,record) => {if(text==='Y'){return <Tag color='green'>??????</Tag>} else if(text==='N'){return <Tag>??????</Tag>}else if(text==='D'){return <Tag color='red'>??????</Tag>}}
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return (<span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >??????</a>
            </span>);
        }
      },];

      const expandedRow=(record)=>{
        return (
          <ApiQpsAndLogMonitor id={record.id} />
          );
      }

    return (
      <div style={{minHeight:'600px'}}  >
          <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1000px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewRouter  id={currentId} gatewayAppId={this.gatewayAppId} close={this.closeModal} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >??????????????????</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >??????</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportData)} icon="download"   disabled={!hasSelected}  >??????</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             ??????:<Search
              placeholder="??????URL|??????|???????????????"
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
    );
  }
}

export default ListRouter;
