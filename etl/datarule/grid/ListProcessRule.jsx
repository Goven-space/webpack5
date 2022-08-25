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
      this.addTabPane('New','新增规则');
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('Edit','修改:'+record.ruleName,record);
    }else if(action==="EditCode"){
      this.addTabPane('EditCode','修改:'+record.ruleName,record);
    }else if(action==="category"){
      this.addTabPane('category','分类管理');
    }
  }

  //保存代码
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
          AjaxUtils.showInfo("保存成功!");
        }
      }
    });
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=exporUrl+"?ids="+ids;
    window.open(url);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
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
      title: '确定删除选中规则?',
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"ruleId":value,"ruleName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
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
        title: '规则名称',
        dataIndex: 'ruleName',
        width: '30%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
          title: '规则Id',
          dataIndex: 'ruleId',
          width: '15%',
          sorter:true,
      },{
      title: '应用Id',
      dataIndex: 'applicationId',
      width:'10%',
      sorter: true,
    },{
      title: '创建者',
      dataIndex: 'editorName',
      width:'8%',
      sorter: true,
    },{
      title: '修改时间',
      dataIndex: 'editTime',
      width:'13%',
      sorter: true,
    },{
      title: '公开',
      dataIndex: 'publicType',
      width:'8%',
      render:(text,record)=>{
        if(text===1){
          return <Tag color='green'>公开</Tag>
        }else{
          return <Tag>私有</Tag>
        }
    }
    },{
        title: '代码',
        dataIndex: 'code',
        width: '8%',
        render:(text,record)=>{
          if(record.applicationId===this.applicationId){
            return (<a  onClick={this.onActionClick.bind(this,"EditCode",record)}><Icon type="edit" />代码</a>);
          }else{
            return '-';
          }
        }
    },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
            if(record.applicationId===this.applicationId){
              return (<span><a onClick={this.onActionClick.bind(this,'Edit',record)} >修改</a></span>);
            }else{
              return '-';
            }
          }
      }];

      const expandedRow=(record)=>{
        return (
          <Card title='引用本规则的流程列表'>
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
            <TabPane tab="规则列表" key="home" style={{padding:'0px'}}>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增规则</Button>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.onActionClick.bind(this,'category')} icon="file"  >分类管理</Button>
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出规则','导出规则后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="配置Id|说明"
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
