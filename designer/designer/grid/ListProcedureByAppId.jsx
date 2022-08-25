import React, { PropTypes } from 'react';
import {Card, Tabs,Table,Row, Col,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Popover,Input,Layout,Menu,Divider,Badge} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewProcedure from '../form/NewProcedure';
import NewProcedureAPI from '../form/NewProcedureAPI';
import ListServicesByProcedureId from './ListApisByFilters';

//存储过程列表

const { Sider, Content } = Layout;
const Search = Input.Search;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.CORE_DESIGNER_PROCEDURE.list;
const DELETE_URL=URI.CORE_DESIGNER_PROCEDURE.delete;
const exportConfigUrl=URI.CORE_DESIGNER_PROCEDURE.exportConfig;

class ProduceParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.searchFilters={};
    this.categoryId=this.props.categoryId||'';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      visible:false,
      currentId:'',
      menuData:[],
      currentRecord:{}
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
      this.addTabPane('New','新增存储过程');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"过程:"+record.procedureId,record);
    }else if(action==="API"){
      this.setState({visible:true,currentRecord:record});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?appId="+this.appId;
    GridActions.loadData(this,url,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"procedureId":value};
    let url=LIST_URL+"?appId="+this.appId;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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
      const panes = this.state.panes;
      let tabActiveKey = id;
      let content;
      if(id==='New'){
        //新增
        content=(<NewProcedure  appId={this.appId}  closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewProcedure appId={this.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
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

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag){this.loadData();}
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '3px',}

    const columns=[{
        title: '存储过程Id',
        dataIndex: 'procedureId',
        width: '25%',
        sorter: true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
        title: '存储过程说明',
        dataIndex: 'configName',
        width: '25%',
        sorter: true
      },{
        title: '数据源',
        dataIndex: 'dbConnId',
        width: '13%',
      },{
        title: '创建者',
        dataIndex: 'creatorName',
        width: '8%',
        sorter: true,
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width: '13%',
        sorter: true,
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
          return  <span>
            <a  type="ghost" size='small' onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            <Divider type="vertical"   />
            <a  type="ghost" size='small' onClick={this.onActionClick.bind(this,"API",record)} >发布API</a>
          </span>
      }}];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
              <ListServicesByProcedureId id={record.id} appId={this.props.appId} filters={{procedureId:[record.id]}} close={this.closeModal} />
        </div>
          );
      }

    return (
      <div>
        <Modal key={Math.random()} title='发布API服务' maskClosable={false}
            visible={this.state.visible}
            width='750px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewProcedureAPI close={this.closeModal} appId={this.appId} record={this.state.currentRecord} ></NewProcedureAPI>
        </Modal>
        <Tabs
          onChange={this.onTabChange}
          onEdit={this.onTabEdit}
          type="editable-card"
          activeKey={this.state.tabActiveKey}
          animated={false}
          hideAdd={true}
        >
        <TabPane tab="存储过程列表" key="home" style={{padding:'0px'}}>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                    <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增存储过程</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"   disabled={!hasSelected}   >导出</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     <Search
                      placeholder="搜索存储过程id或名称"
                      style={{ width: 260 }}
                      prefix={<Icon type="user" />}
                      onSearch={value => this.search(value)}
                    />
                     </span>
                  </Col>
                </Row>
                <Table
                  bordered={false}
                  rowKey={record => record.id}
                  dataSource={rowsData}
                  rowSelection={rowSelection}
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

export default ProduceParamsConfig;
