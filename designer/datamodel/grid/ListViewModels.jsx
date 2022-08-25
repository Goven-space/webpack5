import React, { PropTypes } from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input,Badge} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewViewModel from '../form/NewViewModel';
import EditViewColumnsConfig from './EditViewColumnsConfig';
import NewViewModelService from '../form/NewViewModelService';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.CORE_DATAMODELS.list;
const DELETE_URL=URI.CORE_DATAMODELS.delete;
const COPY_URL=URI.CORE_DATAMODELS.copy;
const ExportModelConfigUrl=URI.CORE_DATAMODELS.ExportModelConfig;

class ListViewModels extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      visible:false,
      currentModelId:'',
      action:'',
      currentRecord:'',
      collapsed:false,
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

  onActionClick=(action,record)=>{
    if(action==="new"){
      this.addTabPane('new','新增业务视图');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"模型:"+record.modelName,record);
    }else if(action==="Service"){
      this.setState({currentRecord:record,visible:true});
    }
  }

  //导出设计
  exportModelConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, ExportModelConfigUrl, { ids: ids });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '删除确认?',
      content: '注意:视图模型删除后不可恢复!',
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
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的服务
    filters.modelType=["V"]; //模型类型
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
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
      if(id==='new'){
        //新增业务模型
        content=(<NewViewModel appId={this.props.appId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        content=(<NewViewModel appId={this.props.appId} id={record.id}   closeTab={this.closeCurrentTab}/>);
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"modelId":value,"modelName":value,"entryModelId":value};
    let appIdArray = [this.props.appId];
    filters.appId=appIdArray; //过虑只显示本应用的服务
    filters.modelType=["V"]; //模型类型
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}

    const columns=[{
      title: '视图名称',
      dataIndex: 'modelName',
      width: '30%',
      sorter: true
    },{
      title: '视图id(API数)',
      dataIndex: 'modelId',
      width: '30%',
      sorter: true,
      render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
    },{
      title: '数据层级',
      dataIndex: 'dataJsonPath',
      width: '15%'
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
        return <Dropdown overlay={<Menu style={{width:80}}>
              <Menu.Item><a  onClick={this.onActionClick.bind(this,"Edit",record)} >修改视图</a></Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制本数据模型吗?",this.onActionClick.bind(this,"Copy",record))} >复制视图</Menu.Item>
              <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除视图</Menu.Item>
            </Menu>}
            trigger={['click']}
          >
          <a className="ant-dropdown-link" href="#">
            操作 <Icon type="down" />
          </a>
        </Dropdown>}
    },];

    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:5}}>
        <EditViewColumnsConfig appId={this.props.appId} id={record.id} keyId={record.keyId} modelId={record.modelId} modelType={record.modelType} entryModelId={record.entryModelId} modelName={record.modelName} dbType={record.dbType} closeTab={this.closeCurrentTab}/>
        </Card>
        );
    }

    return (
      <div>
        <Modal key={Math.random()} title={this.state.action==='New'?"SQL配置":"发布服务"} maskClosable={false}
            visible={this.state.visible}
            width='800px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewViewModelService id={this.state.currentRecord.id} appId={this.props.appId} modelId={this.state.currentRecord.modelId} modelName={this.state.currentRecord.modelName} close={this.closeModal} />
        </Modal>
        <Tabs
          onChange={this.onTabChange}
          onEdit={this.onTabEdit}
          type="editable-card"
          activeKey={this.state.tabActiveKey}
          animated={false}
          hideAdd={true}
        >
        <TabPane tab="业务视图" key="home" style={{padding:'0px'}}>
          <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,"new")} icon="plus-circle-o" >新增业务视图</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete" style={{display:hasSelected?'':'none'}} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportModelConfig)} icon="download"  style={{display:hasSelected?'':'none'}}  >导出配置</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="搜索modelId或名称"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              expandedRowRender={expandedRow}
              rowKey={record => record.id}
              rowSelection={rowSelection}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
        </TabPane>
        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} >{pane.content}</TabPane>)}
        </Tabs>
    </div>
    );
  }
}

export default ListViewModels;
