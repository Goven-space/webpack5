import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListData from './ListData';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DBMGR_MONGODB.getCollInf;
const exportUrl=URI.CORE_DBMGR_MONGODB.export;

class ListColl extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.runType=this.props.runType||"2"; //2表示全部包括成功和失败的
    this.dbName=this.props.dbName; //按指定流程显示
    this.url=LIST_URL+"?dbName="+this.dbName; //流程id
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

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination});
  }

  onActionClick=(action,record,url)=>{
    if(action==="preview"){

      this.addTabPane('preview','预览'+record.ns,record);
    }else if(action==="Process"){
      this.addTabPane('Process','流程监控:'+record.pNodeName,record);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
     if (this.userId==='admin') {
        filters={};
      } else {
        filters.creator=[this.userId];
      }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  //Tab相关函数
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
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
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //增加一个Tab
  addTabPane=(id,name,record)=>{
    console.log(record)
      const panes = this.state.panes;
      let tabActiveKey = record.ns;

      let content;
      if(id==='preview'){
        content=(<ListData status='current' dbName={this.dbName} collName={record.ns} appId={this.appId}  close={this.closeCurrentTab} />);
      }else{
        return;
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

  search=(value)=>{
    var arr=this.state.rowsData;
    if (value.length===0) {
      this.loadData();
    }else{var manArr = arr.filter(function(obj){
      if (obj.ns.split(value).length > 1){
       return true;
      }else{
        return false;
      }
    })
    this.setState(this.state.rowsData=manArr);}
  }

  //导出设计
  exportConfig=(collName)=>{
    GridActions.downloadBlob(this, exportUrl, { ids: '', dbName: this.dbName, collName: collName });
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '表名',
        dataIndex: 'ns',
        width:'50%',

      },{
        title: '数据量',
        dataIndex: 'count',
        width: '35%',
        sorter:true,
      },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'15%',
      render: (text,record) => {
        return (
          <div>
              <a onClick={AjaxUtils.showConfirm.bind(this,'导出数据','注意：如果数据量很大导出数据将会花费较长时间!',this.exportConfig.bind(this,record.ns))}  >导出数据</a>
              <Divider type="vertical"  ></Divider>
              <a onClick={this.onActionClick.bind(this,"preview",record)} >预览</a>
          </div>
            );
      }
    }];

    const expandedRow=(record)=>{
      return (
        <Card bordered={true} >
        <li>index详细：key(索引名)，value(索引大小)</li>
        <li>{record.indexSizes}</li>
        </Card>
        );
    }

    return (
      <div>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="数据库集合列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="CollectionName"
                    style={{ width: 230 }}
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
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
              />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </div>
    );
  }
}

export default ListColl;
