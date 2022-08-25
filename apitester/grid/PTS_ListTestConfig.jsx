import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewTest from '../form/PTS_NewTest';
import PTS_ListTestResult from './PTS_ListTestResult';

//压力测试配置列表

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const LIST_URL=URI.CORE_PTS_TESTCONFIG.list;
const DELETE_URL=URI.CORE_PTS_TESTCONFIG.delete;
const COPY_URL=URI.CORE_PTS_TESTCONFIG.copy;
const exportConfigUrl=URI.CORE_PTS_TESTCONFIG.exportConfig;
const ExecuteTestUrl=URI.CORE_PTS_TESTCONFIG.run;

class PTS_ListTestConfig extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      currentId:'',
      serviceId:'',
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
      this.addTabPane('New','压力测试配置',record);
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit',record.title,record);
    }else if(action==="Run"){
      this.runTest(record.id);
    }
  }

  //运行任务
  runTest=(id)=>{
    this.setState({loading:false});
    AjaxUtils.post(ExecuteTestUrl,{id:id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    });
    AjaxUtils.showInfo("已提交压测命令请点击+号查看测试结果!");
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportConfigUrl, { ids: ids });
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    //管理员看所有，其他用户只能看自已的
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
      if(id==='New'){
        //新增服务
        content=(<NewTest appId={this.props.appId} id='' serviceId='' close={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTest appId={this.props.appId} id={record.id} close={this.closeCurrentTab} />);
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '压测名称',
        dataIndex: 'title',
        width: '40%',
      },{
          title: '请求数',
          dataIndex: 'maxRequestCount',
          width: '8%'
      },{
          title: '线程数',
          dataIndex: 'maxThreadCount',
          width: '8%'
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%'
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render:(text,record)=>{
            return (
              <span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
              <Divider type="vertical" />
              <a  onClick={AjaxUtils.showConfirm.bind(this,"删除用户","删除后不可恢复!",this.onActionClick.bind(this,"Copy",record))} >复制</a>
              <Divider type="vertical" />
              <a  onClick={AjaxUtils.showConfirm.bind(this,"运行压力测试","确定要执行本压测任务吗?",this.onActionClick.bind(this,"Run",record))} >运行</a>
            </span>
          );
        }
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='压力测试结果' bodyStyle={{padding:8}}>
            <PTS_ListTestResult parentId={record.id} />
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
      <TabPane tab="压力测试场景" key="home" style={{padding:'0px'}}>
         <div style={divStyle}>
          <ButtonGroup>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增压力测试</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          expandedRowRender={expandedRow}
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
      </TabPane>
      {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
    </Tabs>
    );
  }
}

export default PTS_ListTestConfig;
