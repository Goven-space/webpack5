import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewSapRFC from '../form/NewSapRFC';
import NewSapRfcService from '../form/NewSapRfcService';
import SapInputParamsConfig from './components/SapInputParamsConfig';
import SapOutputParamsConfig from './components/SapOutputParamsConfig';
import SapTableParamsConfig from './components/SapTableParamsConfig';
import SapCropParamsConfig from './components/SapCropParamsConfig';
import ListApisByFilters from '../../../designer/designer/grid/ListApisByFilters';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CONNECT.SAPRFC.list;
const DELETE_URL=URI.CONNECT.SAPRFC.delete;
const exporConfigUrl=URI.CONNECT.SAPRFC.exportConfig;
const copyConfigUrl=URI.CONNECT.SAPRFC.copy;

class ListSapRfc extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      action:''
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.categoryId!==nextProps.categoryId){
      this.categoryId=nextProps.categoryId;
      this.state.pagination.current=1;
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
    if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','??????:'+record.functionId,record);
    }else if(action==="New"){
      this.addTabPane('New','????????????');
    }
  }

  //????????????
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exporConfigUrl+"?ids="+ids;
    window.open(url);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL;
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '????????????????????????????',
      content: '??????:?????????????????????!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  //Tab????????????
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab?????????????????????
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //??????X??????????????????Tab
  tabRemove=(targetKey)=>{
      let tabActiveKey = this.state.tabActiveKey;
      let lastIndex;
      this.state.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      if (lastIndex >= 0 && tabActiveKey === targetKey) {
        tabActiveKey = panes[lastIndex].key;
      }else{
        tabActiveKey="home";
      }
      this.setState({ panes, tabActiveKey });
  }
  //?????????????????????Tab?????????Grid??????
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //????????????Tab
  addTabPane=(id,name,record)=>{
      const panes = this.state.panes;
      let tabActiveKey = record===undefined?'new':record.id;
      let content;
      let docid=record===undefined?'':record.id;
      content=(<NewSapRFC id={docid} appId={this.props.appId} categoryId={this.categoryId} close={this.closeCurrentTab} />);
      const paneItem={ title: name, content: content, key: tabActiveKey };
      if(!this.containsTab(panes,paneItem)){
        if(panes.length>=5){
          panes.splice(-1,1,paneItem);
        }else{
          panes.push(paneItem);
        }
      }
      this.setState({ panes, tabActiveKey});
  }

  containsTab(arr, obj) {
      var i = arr.length;
      while (i--) {
          if (arr[i].key === obj.key) {
              return true;
          }
      }
      return false;
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

  newService=(record)=>{
    this.setState({currentRecord:record,visible: true,});
  }

  //??????ajax??????????????????
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"functionId":value,"functionName":value};
    sorter={"order":'ascend',"field":'createTime'};//??????userName????????????
    let url=LIST_URL;
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  testConnect=(id)=>{
      this.setState({loading:true});
      let url=TestConnectUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }


  //????????????
   copyDateSource=(id)=>{
     this.setState({loading:true});
     AjaxUtils.post(copyConfigUrl,{ids:id},(data)=>{
         this.setState({loading:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           AjaxUtils.showInfo("????????????("+data.msg+")?????????!");
           this.loadData();
         }
     });
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
          <Tabs  size='large'>
            <TabPane tab="??????????????????" key="in" style={{fontSize:'16px'}}>
              <SapInputParamsConfig id={record.id} inParamsDocs={record.inParamsDocs} />
            </TabPane>
            <TabPane tab="??????????????????" key="out" style={{fontSize:'16px'}}>
              <SapOutputParamsConfig id={record.id} outParamsDocs={record.outParamsDocs} />
            </TabPane>
            <TabPane tab="???????????????" key="table" style={{fontSize:'16px'}}>
              <SapTableParamsConfig id={record.id} tableParamsDocs={record.tableParamsDocs} />
            </TabPane>
            <TabPane tab="?????????API" key="api" style={{fontSize:'16px'}}>
              <ListApisByFilters id={record.id} appId={this.props.appId} filters={{connecterId:[record.id]}} close={this.closeModal} />
            </TabPane>
        </Tabs>
      </div>
        );
    }
    const columns=[
      {
        title: 'RFC?????????',
        dataIndex: 'functionId',
        width: '25%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
      title: 'RFC????????????',
      dataIndex: 'functionName',
      width: '20%',
      ellipsis: true,
    },{
      title: '?????????Id',
      dataIndex: 'dataSourceId',
      width:'10%',
      sorter: true
    },{
      title: '?????????',
      dataIndex: 'creatorName',
      width:'10%',
      sorter: true,
    },{
      title: '????????????',
      dataIndex: 'editTime',
      width:'13%',
      sorter: true,
    },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
                return <span>
                    <a onClick={this.onActionClick.bind(this,'Edit',record)} >??????</a>
                    <Divider type="vertical" />
                    <a onClick={AjaxUtils.showConfirm.bind(this,"??????RFC","??????????????????RFC????",this.copyDateSource.bind(this,record.id))} >??????</a>
                    <Divider type="vertical" />
                    <a onClick={this.newService.bind(this,record)} >??????API</a>
                  </span>;
              }
      },];


    return (
      <span>
            <Modal key={Math.random()} title='??????API' maskClosable={false}
                visible={this.state.visible}
                width='750px'
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewSapRfcService close={this.closeModal} appId={this.appId} record={currentRecord}  />
            </Modal>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="SAP????????????" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >????????????</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >??????</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >??????</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >??????</Button>

                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   ??????:<Search
                    placeholder="?????????"
                    style={{ width: 260 }}
                    onSearch={value => this.search(value)}
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
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </span>
    );
  }
}

export default ListSapRfc;
