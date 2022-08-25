import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewSqlConfig from './NewSqlConfig';
import NewSqlConfigService from './NewSqlConfigService';
import ListServicesBySqlConfigId from '../../designer/grid/ListApisByFilters';
import EditSQLCode from '../form/EditSQLCode';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_SQLCONFIG.ListByPage; //分页列出
const DELETE_URL=URI.CORE_SQLCONFIG.Delete;
const COPY_URL=URI.CORE_SQLCONFIG.Copy;
const SubmitUrl=URI.CORE_SQLCONFIG.Save; //存盘地址
const ExportSqlConfigUrl=URI.CORE_SQLCONFIG.exportSqlConfig;
const ListByModelIdUrl=URI.CORE_SQLCONFIG.ListByModelId; //按模型id列出全部

class ListSqlConfig extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
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
    this.modelId=nextProps.modelId;
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
      // this.setState({visible: true,currentId:'',action:action}); //新增sql
      this.addTabPane('New','新增SQL配置');
    }else if(action==="Service"){
      this.setState({visible: true,currentRecord:record,action:action}); //生成服务
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      // this.setState({visible: true,currentId:record.id});
      this.addTabPane('Edit','修改:'+record.configId,record);
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="EditCode"){
      this.addTabPane('SqlCodeEdit','SQL代码:'+record.configId,record);
    }
  }

  //导出设计
  exportSqlConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, ExportSqlConfigUrl, { ids: ids });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
    if(this.props.reload!==undefined){
      this.props.reload(); //刷新左则菜单
    }
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的文件
    if(this.modelId!=='' && this.modelId!==undefined && this.modelId!==null && this.modelId!=='all'){
      filters.modelId=[this.modelId];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //保存修改的代码
  saveData=(record,code)=>{
    if(record.dynamicFlag){
      if(code.toLowerCase().indexOf(" var sql=")==-1 && code.toLowerCase().indexOf("sql=")==-1){
        AjaxUtils.showError("错误提示:动态SQL必须指定sql变量 var sql='....'");
        return;
      }
    }
    record.sql=code; //更新代码
    this.setState({mask:true});
    AjaxUtils.post(SubmitUrl,record,(data)=>{
        if(data.state===false){
          this.showInfo(data.msg);
        }else{
          this.setState({mask:false});
          AjaxUtils.showInfo("保存成功!");
        }
    });
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
        //新增SQL
        content=(<NewSqlConfig id="" appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        //修改SQL
        content=(<NewSqlConfig id={record.id} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
      }else if(id==='SqlCodeEdit'){
        //查看数据模型的数据
        tabActiveKey=record.id+"_CODE";
        content=(
          <span>
          <EditSQLCode   code={record.sql} record={record} saveData={this.saveData} templateType="SqlConfig" close={this.closeCurrentTab} />
          注意:可从模板中选择SQL示例 <Tooltip title="使用?或者#{变量}表示SQL的预编译变量，使用${变量}可直接替换为request参数或系统变量
              SQL示例:select * from tableName where id=#{id} or userid='${userId}',
              使用#{$id}可自动生成一个唯一Id" >
            <a style={{cursor:'pointer'}}>显示SQL定义帮助</a>
          </Tooltip>{' '}
          <Tooltip title='示例:var sql="select * from table where userid=#{userId}";
              if(RequestUtil.getString("userId")==="admin"){
                    sql+=" where state=2";
              } 注意:使用RdbMapperUtil.selectListByPage()进行分页时,sql定义中必须返回countSql变量,可在模板中选择示例SQL'
              style={{width:'500px'}}
          >
          <a style={{cursor:'pointer'}}  >动态SQL示例</a>
          </Tooltip>
          </span>
        );
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
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={appId:[this.props.appId]};
    if(this.modelId!=='' && this.modelId!==undefined && this.modelId!==null && this.modelId!=='all'){
      filters.modelId=[this.modelId];
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value,"modelId":value,"sql":value,"permissionIds":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }


  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
    this.props.toggle();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '唯一id(服务数)',
        dataIndex: 'configId',
        width: '25%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },
      {
          title: 'SQL说明',
          dataIndex: 'configName',
          width: '25%',
      },{
      title: '权限',
      dataIndex: 'permissionIds',
      width: '10%'
    },{
      title: '执行次数',
      dataIndex: 'runNumber',
      width: '10%',
      render:(text,record)=>{
          return <Tag color="green" >{text}</Tag>
      }
    },{
      title: '性能(秒)',
      dataIndex: 'avgPerformance',
      width: '10%',
      render:(text,record)=>{
          return <Tag color="green" >{text}</Tag>
      }
    },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'20%',
        render: (text,record) => {
          return <span>
            <a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />SQL</a>
            <Divider type="vertical" />
            <a onClick={this.onActionClick.bind(this,'Edit',record)} >修改</a>
            <Divider type="vertical" />
            <a onClick={this.onActionClick.bind(this,'Service',record)} >创建API</a>
            </span>;
          }
      },];

      const expandedRow=(record)=>{
        return (
          <Card title="关联的API服务">
              <ListServicesBySqlConfigId id={record.id} appId={this.props.appId} filters={{sqlConfigId:[record.configId]}} close={this.closeModal} />
          </Card>
          );
      }

    return (
      <div>
        <Modal key={Math.random()} title='发布服务' maskClosable={false}
            visible={this.state.visible}
            width='750px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewSqlConfigService close={this.closeModal} appId={this.appId} configId={currentRecord.configId} configName={currentRecord.configName}  codeType={currentRecord.codeType} modelId={this.modelId} ></NewSqlConfigService>
        </Modal>

            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="SQL配置列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增SQL</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportSqlConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="配置Id|说明|SQL语句|权限"
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
                size='small'
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

export default ListSqlConfig;
