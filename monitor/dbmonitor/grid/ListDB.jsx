import React from 'react';
import ReactDOM from 'react-dom';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListColl from './ListColl';
import ImportData from '../form/ImportDataFromBson';
import BackupFromPath from '../form/BackupFromPath';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DBMGR_MONGODB.getDatabaseNames;

class ListDB extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.url=LIST_URL;
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
      width:500,
      action:'',
      visibleBac:false,
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
    if(action==="New"){
      this.addTabPane('New','新增流程','','NewProcess');
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','修改:'+record.configName,record);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    if(this.categoryId!==undefined && this.categoryId!=='' && this.categoryId!=='home' && this.categoryId!=='all'){
      filters.categoryId=[this.categoryId];
    }
    if(this.userId==="admin"){
      GridActions.loadData(this,this.url,pagination,filters,sorter);
      // console.log(this.userId)
    }else{
      filters.creator=[this.userId];
      GridActions.loadData(this,this.url,pagination,filters,sorter);
      // console.log(this.userId)
      }

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
  addTabPane=(id,name,record,tabKey)=>{
      const panes = this.state.panes;
      let tabActiveKey = tabKey||record.id;
      let content;
      if(id==='New'){
        //新增SQL
        content=(<NewProcess id="" appId={this.props.appId} categoryId={this.categoryId} close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        content=(<NewProcess id={record.id} appId={this.props.appId}  close={this.closeCurrentTab} />);
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

MenuClick=(key,record)=>{
  if(key==='Import'){
    this.setState({visible:true});
  }else if(key==='Backups'){
    this.setState({visibleBac:true,dbName:record.db});
  }
}

  showModal=(record)=>{
    // console.log(record)
    this.setState({visible: true,currentRecord:record});
  }
  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,visibleBac:false});
  }

  search=(value)=>{
      var arr=this.state.rowsData;
      if (value.length===0) {
        this.loadData();
      }else{var manArr = arr.filter(function(obj){
        if (obj.db.split(value).length > 1){
         return true;
        }else{
          return false;
        }
     })
     this.setState(this.state.rowsData=manArr);}
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '数据库名',
        dataIndex: 'db',
        width: '50%',
      },{
        title: '总数据量',
        dataIndex: 'objects',
        width: '20%',
      },{
        title: '存储大小',
        dataIndex: 'storageSize',
        width:'20%',
        render: (text,record) =>{return (text/1024/1024).toFixed(2)+"M";}
    },{
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'10%',
      render: (text,record) => {
        return <a onClick={AjaxUtils.showConfirm.bind(this,"备份数据","您确定要备份本数据库吗?如果数据量较大则将花费较长时间!",this.MenuClick.bind(this,"Backups",record))} >备份数据</a>
      }
    }];

    const expandedRow=(record)=>{
      return (
        <div style={{backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
              <ListColl dbName={record.db} />
      </div>
        );
    }


    return (
      <div>
            <Modal key={Math.random()} title='备份' maskClosable={false}
               visible={this.state.visibleBac}
               footer=''
               width='760px'
               onOk={this.handleCancel}
               onCancel={this.closeModal} >
               <BackupFromPath close={this.closeModal} dbName={this.state.dbName} />
           </Modal>
          <Modal key={Math.random()} title='导入数据' maskClosable={false}
                visible={this.state.visible}
                footer=''
                width='760px'
                onOk={this.handleCancel}
                onCancel={this.closeModal} >
                <ImportData close={this.closeModal} />
            </Modal>
            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="系统MongoDB数据库" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
                  <Button  type="ghost" onClick={this.MenuClick.bind(this,'Import')} icon="download"  >导入数据</Button>{' '}
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="数据库名"
                    style={{ width: 260 }}
                    onSearch={value => this.search(value)}
                  />
                   </span>
                </Col>
              </Row>
              <Table
                bordered={false}
                rowKey={rowsData.id}
                dataSource={rowsData}
                columns={columns}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                expandedRowRender={expandedRow}
              />
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </div>
    );
  }
}

export default ListDB;
