import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewSqlConfig from './NewSqlConfig';
import NewSqlConfigService from './NewSqlConfigService';
import ListServicesBySqlConfigId from '../../designer/grid/ListApisByFilters';
import EditSQLCode from '../form/EditSQLCode';
import EditScriptCode from '../form/EditScriptCode';
import NewJsCode from './NewJsCode';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import SQLConditionList from './SQLConditionList';

//SQL语句以及Java脚本管理

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
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class ListSqlConfig extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.categoryId=this.props.categoryId||'AllSql';
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".SqlCategory&rootName=脚本分类";
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
      action:'',
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
      this.addTabPane('New','新增SQL语句');
    }else if(action==="NewJsCode"){
      this.addTabPane('NewJsCode','新增脚本代码');
    }else if(action==="Service"){
      this.setState({visible: true,currentRecord:record,action:action}); //生成服务
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','修改:'+record.configId,record);
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="EditCode"){
      this.addTabPane('SqlCodeEdit','代码:'+record.configName,record);
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
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的文件
    let url=LIST_URL;
    if(this.categoryId!=='AllSql' && this.categoryId!==''){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //保存修改的代码
  saveData=(record,code,closeFlag)=>{
    if(record.codeType==='sql'){
        if(record.dynamicFlag){
          if(code.toLowerCase().indexOf(" var sql=")===-1 && code.toLowerCase().indexOf("sql=")===-1){
            AjaxUtils.showError("错误提示:动态SQL必须指定sql变量 var sql='....'");
            return;
          }
        }else{
          if(code.toLowerCase().indexOf(" var sql=")!==-1 || code.toLowerCase().indexOf("sql=")!==-1){
            AjaxUtils.showError("错误提示:简单SQL不允许返回SQL变量，请修改为动态SQL!");
            return;
          }
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
          if(closeFlag){this.closeCurrentTab();}
        }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中脚本吗?',
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
        content=(<NewSqlConfig id="" appId={this.props.appId} modelId={this.modelId} categoryId={this.categoryId} close={this.closeCurrentTab} />);
      }else if(id==='NewJsCode'){
        //新增jscode
        content=(<NewJsCode id="" appId={this.props.appId} modelId={this.modelId} categoryId={this.categoryId} close={this.closeCurrentTab} />);
      }else if(id==='Edit'){
        //修改属性
        if(record.codeType==='sql'){
          content=(<NewSqlConfig id={record.id} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
        }else{
          //js,java
          content=(<NewJsCode id={record.id} appId={this.props.appId} modelId={this.modelId} close={this.closeCurrentTab} />);
        }
      }else if(id==='SqlCodeEdit'){
        let codeType="sql";
        let templateType="SqlConfig";
        if(record.codeType==='js'){
          codeType="javascript";
          templateType="JSCodeConfig";
        }else if(record.codeType==='java'){
          codeType="java";
          templateType="JavaCodeConfig";
        }else if(record.codeType==='shell'){
          codeType="sh";
          templateType="SehllCodeConfig";
        }else if(record.codeType==='python'){
          codeType="python";
          templateType="PythonCodeConfig";
        }
        tabActiveKey=record.id+"_CODE";
        content=(
          <span>
            {
              record.codeType=='sql'?
              <EditSQLCode   code={record.sql} record={record} saveData={this.saveData} templateType={templateType} codeType={codeType} close={this.closeCurrentTab} />
            :
              <EditScriptCode   code={record.sql} record={record} saveData={this.saveData} templateType={templateType} codeType={codeType} close={this.closeCurrentTab} />
            }
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
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value,"modelId":value,"sql":value,"permissionIds":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  changeCategoryId=(categoryId)=>{
    this.categoryId=categoryId;
    this.state.categoryId=categoryId;
    this.loadData();
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
        title: '类型',
        dataIndex: 'codeType',
        width: '6%',
        render:(text,record)=>{
          if(text==='sql'){
            return <Tag color="green"  style={{width:'45px'}} >SQL</Tag>;
          }else if(text==='js'){
            return <Tag color="orange" style={{width:'45px'}} >Script</Tag>;
          }else if(text==='shell'){
            return <Tag color="#999" style={{width:'45px'}}  >SHELL</Tag>;
          }else if(text==='java'){
            return <Tag color="blue" style={{width:'45px'}} >JAVA</Tag>;
          }else if(text==='python'){
            return <Tag color="cyan" style={{width:'48px'}} >Python</Tag>;
          }

        }
      },{
        title: '脚本名称',
        dataIndex: 'configName',
        width: '18%',
        ellipsis: true,
        render:(text,record)=>{return <a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />{text}</a>;}
      },{
        title: '唯一id(API数)',
        dataIndex: 'configId',
        width: '20%',
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
      title: '创建者',
      dataIndex: 'creatorName',
      width: '8%',
      sorter:true,
    },{
      title: '最后修改',
      dataIndex: 'editTime',
      width: '13%',
      ellipsis: true,
      sorter:true,
    },{
      title: '执行次数',
      dataIndex: 'runNumber',
      width: '8%',
      render:(text,record)=>{return record.codeType==='js'?'-':text;}
    },{
      title: '性能(秒)',
      dataIndex: 'avgPerformance',
      width: '8%',
      render:(text,record)=>{return record.codeType==='js'?'-':text;}
    },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
          return <span>
          <Dropdown overlay={<Menu style={{width:80}}>
                <Menu.Item><a  onClick={this.onActionClick.bind(this,"Edit",record)} >修改配置</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制本脚本吗?",this.onActionClick.bind(this,"Copy",record))} >复制脚本</Menu.Item>
                <Menu.Item><a  onClick={this.onActionClick.bind(this,"Service",record)} >创建API</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a className="ant-dropdown-link" href="#">
              操作 <Icon type="down" />
            </a>
          </Dropdown></span>}
      },];

      const expandedRow=(record)=>{
        return (
          <div style={{backgroundColor:'#fff',border:'1px solid #f4f4f4',padding:'8px'}}>
              {
                record.codeType=='sql'?
                    <Tabs
                      animated={false}
                      hideAdd={true}
                      size='large'
                    >
                      <TabPane tab="创建的API" key="apilist" style={{padding:'0px'}}>
                        <ListServicesBySqlConfigId id={record.id} appId={this.props.appId} filters={{sqlConfigId:[record.configId]}} close={this.closeModal} />
                      </TabPane>
                      <TabPane tab="SQL动态条件配置" key="sqlCondition" style={{padding:'0px'}}>
                        <SQLConditionList id={record.id} tableName={record.tableName} dbConnId={record.dbConnId} />
                      </TabPane>
                    </Tabs>
              :
                  <ListServicesBySqlConfigId id={record.id} appId={this.props.appId} filters={{sqlConfigId:[record.configId]}} close={this.closeModal} />
            }
          </div>
          );
      }

    return (
      <div>
        <Modal key={Math.random()} title='创建API' maskClosable={false}
            visible={this.state.visible}
            width='750px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewSqlConfigService close={this.closeModal} appId={this.appId} configId={currentRecord.configId} codeType={currentRecord.codeType} configName={currentRecord.configName} modelId={this.modelId} ></NewSqlConfigService>
        </Modal>

            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
            <TabPane tab="脚本列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增SQL语句</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,'NewJsCode')} icon="plus"  >新增脚本代码</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportSqlConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   分类:<TreeNodeSelect  url={this.menuUrl} defaultData={[{label:'所有脚本列表',value:''}]} onChange={this.changeCategoryId} value={this.state.categoryId} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                 {' '}搜索:<Search
                    placeholder="配置Id|名称"
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
      </div>
    );
  }
}

export default ListSqlConfig;
