import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewMockConfig from '../form/NewMockConfig';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_MOCK_MGR.list;
const DELETE_URL=URI.CORE_MOCK_MGR.delete;
const COPY_URL=URI.CORE_MOCK_MGR.copy;
const GenerateMockDataUrl=URI.CORE_MOCK_MGR.generateMockDataUrl;
const DeleteMockDataUrl=URI.CORE_MOCK_MGR.deleteMockDataUrl;

class ListMockConfigs extends React.Component {
  constructor(props) {
    super(props);
    this.sorter = {}
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      currentId:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {"order":sorter.order,"field":sorter.field} : {};
    this.loadData(pagination);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
    this.setState({visible: true,currentId:''});
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      // this.addTabPane('Edit',record.title,record);
      this.setState({visible: true,currentId:record.id});
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    let filters = {}
    if(this.props.appId!==undefined && this.props.appId!==''  && this.props.appId!==null){
      filters.appId=[this.props.appId]; //过虑只显示本应用的服务
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,this.sorter);
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
        content=(<NewMockConfig appId={this.props.appId} id=''  close={this.closeCurrentTab}/>);
      }else if(id==='Edit'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewMockConfig appId={this.props.appId} id={record.id} close={this.closeCurrentTab}/>);
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
      this.setState({
        visible: false,
      });
  }

  generateMockData=(id)=>{
    let url=GenerateMockDataUrl;
    this.setState({loading:true});
    let postData={id:id};
    AjaxUtils.post(url,postData,(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          AjaxUtils.showInfo("共成功产生("+data.msg+")条模拟数据!");
          this.loadData();
        }
    });
  }

  deleteMockData=(record)=>{
    let url=DeleteMockDataUrl;
    if(record.entryModelId!=='' && record.entryModelId!==undefined && record.entryModelId!==null){AjaxUtils.showError("不允许删除实体数据模型中的数据,如果要删除请到实体模型中去删除!");return;}
    this.setState({loading:true});
    let postData={id:record.id};
    AjaxUtils.post(url,postData,(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          AjaxUtils.showInfo("共成功删除("+data.msg+")条模拟数据!");
          this.loadData();
        }
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '模拟配置名称',
        dataIndex: 'configName',
        width: '30%',
        sorter: true
      },{
        title: '绑定实体数据模型',
        dataIndex: 'entryModelId',
        width: '25%',
        render:(text,record)=>{if(text==='' || text===undefined){return '-'}else{return text;}}
      },{
        title: '已生成模拟数据',
        dataIndex: 'mockDataNum',
        width: '25%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu >
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"操作确认","确定要产生模拟数据?",this.generateMockData.bind(this,record.id))} >生成数据</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"操作确认","确定要删除由本配置生成的所有模拟数据?",this.deleteMockData.bind(this,record))} >删除数据</Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

    return (
        <div>
        <Modal key={Math.random()} title="" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1000px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewMockConfig appId={this.props.appId} id={currentId} close={this.closeModal} />
        </Modal>
         <div style={divStyle}>
         <ButtonGroup>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增配置</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}

        />
        </div>
    );
  }
}

export default ListMockConfigs;
