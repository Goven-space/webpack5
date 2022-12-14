import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewProcessRule from '../form/NewProcessRule';
import EditJavaCode from '../../../core/components/EditJavaCode';
import ListProcessByRuleId from './ListProcessByRuleId';
import ListAppServiceCategoryNode from '../../setting/ListAppServiceCategoryNode';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const baseUrl=URI.ETL.RULE.convertBaseUrl;
const LIST_URL=URI.ETL.RULE.list;
const DELETE_URL=URI.ETL.RULE.delete;
const SubmitUrl=URI.ETL.RULE.save;
const exporUrl=URI.ETL.RULE.export;


class ListProcessRule extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.modelId=this.props.modelId;
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
    if(action==="New"){
      this.addTabPane('New','????????????');
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','??????:'+record.ruleName,record);
    }else if(action==="EditCode"){
      this.addTabPane('EditCode','??????:'+record.ruleName,record);
    }else if(action==="category"){
      this.addTabPane('category','????????????');
    }
  }

  //????????????
  saveEditCode=(classPath,code,record,showMsg)=>{
    this.setState({loading:true});
    record.classPath=classPath;
    record.ruleCode=code;
    AjaxUtils.post(SubmitUrl,record,(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        if(showMsg){
          AjaxUtils.showInfo("????????????!");
        }
      }
    });
  }

  //????????????
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exporUrl+"?ids="+ids;
    window.open(url);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?applicationId="+this.applicationId;
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
      title: '?????????????????????????',
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
      let tabActiveKey = record===undefined?id:record.id;
      let content;
      if(id==='New'){
        content=(<NewProcessRule id="" categoryId={this.categoryId} appId={this.props.appId} applicationId={this.applicationId}  close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        content=(<NewProcessRule id={record.id} appId={this.props.appId} close={this.closeCurrentTab} applicationId={this.applicationId}  />);
      }else if(id==='EditCode'){
        content=<EditJavaCode  code={record.ruleCode} record={record} beanId={record.classPath} saveEditCode={this.saveEditCode} applicationId={this.applicationId}  templateType="ETLProcessRule"  />;
      }else if(id==='category'){
        content=<ListAppServiceCategoryNode  appId={this.appId}  categoryId={this.applicationId+'.ruleCategory'} applicationId={this.applicationId}  />;
      }
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

  //??????ajax??????????????????
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"ruleId":value,"ruleName":value};
    sorter={"order":'ascend',"field":'createTime'};//??????userName????????????
    let url=LIST_URL;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '????????????',
        dataIndex: 'ruleName',
        width: '30%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '??????Id',
          dataIndex: 'ruleId',
          width: '15%',
          sorter:true,
      },{
      title: '??????Id',
      dataIndex: 'applicationId',
      width:'10%',
      sorter: true,
    },{
      title: '?????????',
      dataIndex: 'editorName',
      width:'8%',
      sorter: true,
    },{
      title: '????????????',
      dataIndex: 'editTime',
      width:'13%',
      sorter: true,
    },{
      title: '??????',
      dataIndex: 'publicType',
      width:'8%',
      render:(text,record)=>{
        if(text===1){
          return <Tag color='green'>??????</Tag>
        }else{
          return <Tag>??????</Tag>
        }
    }
    },{
        title: '??????',
        dataIndex: 'code',
        width: '8%',
        render:(text,record)=>{
          if(record.applicationId===this.applicationId){
            return (<a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />??????</a>);
          }else{
            return '-';
          }
        }
    },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
            if(record.applicationId===this.applicationId){
              return (<span><a onClick={this.onActionClick.bind(this,'Edit',record)} >??????</a></span>);
            }else{
              return '-';
            }
          }
      }];

      const expandedRow=(record)=>{
        return (
          <Card title='??????????????????????????????'>
            <ListProcessByRuleId ruleId={record.ruleId}></ListProcessByRuleId>
          </Card>
          );
      }

    return (
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="????????????" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >????????????</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >??????</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,'category')} icon="file"  >????????????</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >??????</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >??????</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   ??????:<Search
                    placeholder="??????Id|??????"
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
    );
  }
}

export default ListProcessRule;
