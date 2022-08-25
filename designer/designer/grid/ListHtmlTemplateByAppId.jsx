import React, { PropTypes } from 'react';
import {Card, Tabs,Table,Row, Col,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Popover,Input,Layout,Menu} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewTemplate from '../form/NewTemplate';
import EditTemplateCode from '../form/components/EditViewHtmlCode';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//应用视图模板开发界面

const { Sider, Content } = Layout;
const Search = Input.Search;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.CORE_VIEWTEMPLATE.list;
const DELETE_URL=URI.CORE_VIEWTEMPLATE.delete;
const COPY_URL=URI.CORE_VIEWTEMPLATE.copy;
const exportConfigUrl=URI.CORE_VIEWTEMPLATE.exportConfig;
const saveDataUrl=URI.CORE_VIEWTEMPLATE.save;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class ListHtmlTemplateByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.searchFilters={};
    this.categoryId=this.props.categoryId||'';
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".TemplateCategory&rootName=模板分类";
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
      categoryId:''
    }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
      if(nextProps.categoryId!==this.categoryId){
          this.categoryId=nextProps.categoryId;
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
      this.addTabPane('New','新增模板');
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',"模板:"+record.templateId,record);
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"模板代码:"+record.templateId,record);
    }else if(action==='Preview'){
      let url=URI.CORE_VIEWTEMPLATE.previewUrl+record.templateId;
      window.open(url);
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
    filters.appId=[this.props.appId]; //过虑只显示本应用的服务
    let templateFolder=this.categoryId;
    if(templateFolder!=='' && templateFolder!=='AllView'){
      filters.templateFolder=[templateFolder]; //按分类显示
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"templateName":value,"templateId":value};
    let appIdArray = [this.props.appId];
    filters.appId=appIdArray; //过虑只显示本应用的服务
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
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

  //保存修改的代码
  saveData=(record,code)=>{
    record.body=code; //更新代码
    this.setState({mask:true});
    AjaxUtils.post(saveDataUrl,record,(data)=>{
        if(data.state===false){
          this.showInfo(data.msg);
        }else{
          this.setState({mask:false});
          AjaxUtils.showInfo("保存成功!");
        }
    });
  }

  //增加一个Tab
  addTabPane=(id,name,record)=>{
      const panes = this.state.panes;
      let tabActiveKey = id;
      let content;
      if(id==='New'){
        //新增
        content=(<NewTemplate nodeId={this.state.templateFolder} appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTemplate appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditCode'){
        //修改
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<div><EditTemplateCode   code={record.body} record={record} saveData={this.saveData} templateType="ViewTemplate" codeType="html" close={this.closeCurrentTab} />提示:使用[T]模板id[/T]可以引入其他模板</div>);
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
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  changeCategoryId=(categoryId)=>{
    this.categoryId=categoryId;
    this.state.categoryId=categoryId;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '3px',}

    const columns=[{
        title: '模板类型',
        dataIndex: 'templateType',
        width: '10%',
        render:(text,record)=>{return <Tag color='green'>{text}</Tag>;}
      },{
        title: '模板名称',
        dataIndex: 'templateName',
        width: '20%',
        sorter: true
      },{
        title: '模板id',
        dataIndex: 'templateId',
        width: '20%',
        sorter: true
      },{
        title: '所属分类',
        dataIndex: 'templateFolderName',
        width: '15%',
      },{
        title: '更新时间',
        dataIndex: 'editTime',
        width: '15%',
        sorter: true,
      },{
        title: '模板代码',
        dataIndex: 'code',
        width: '8%',
        render:(text,record)=>{
          return (<a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />代码</a>);
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Preview",record)} >预览</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

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
        <TabPane tab="模板列表" key="home" style={{padding:'0px'}}>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                    <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增模板</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"   disabled={!hasSelected}   >导出</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     分类:<TreeNodeSelect  url={this.menuUrl} defaultData={[{label:'所有视图模板列表',value:''}]} onChange={this.changeCategoryId} value={this.state.categoryId} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                   {' '}搜索:<Search
                      placeholder="搜索模板id或名称"
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
                />
        </TabPane>
        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
      </Tabs>

    </div>
    );
  }
}

export default ListHtmlTemplateByAppId;
