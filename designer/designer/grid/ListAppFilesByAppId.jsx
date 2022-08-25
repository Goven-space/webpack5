import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewAppResources from '../form/NewAppResources';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//新版本的应用文件管理

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPRESOURCES.list;
const DELETE_URL=URI.CORE_APPRESOURCES.delete;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class ListAppFilesByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId||'AllFile';
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".FileCategory&rootName=API分类";
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      folderId:'all',
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
      this.setState({visible: true,currentId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let value = [this.props.appId];
    filters.appId=value; //过虑只显示本应用的文件
    if(this.categoryId!=='AllFile' && this.categoryId!==''){
      filters.folderId=[this.categoryId];
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"title":value,"filePath":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  changeCategoryId=(categoryId)=>{
    this.categoryId=categoryId;
    this.state.categoryId=categoryId;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '文件说明',
        dataIndex: 'title',
        width: '20%',
        sorter: true
      },{
        title: '文件名',
        dataIndex: 'fileName',
        sorter: true,
        width: '30%',
        render:(text,record)=>{
          return <a href={URI.baseResUrl+record.filePath} target='_blank' >{text}</a>;
        }
      },{
        title: '大小',
        dataIndex: 'fileSize',
        width: '10%'
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%',
        sorter: true,
      },{
        title: '更新时间',
        dataIndex: 'editTime',
        width: '15%',
        sorter: true,
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

    return (
      <div >
    	          <Modal key={Math.random()} title="应用资源" maskClosable={false}
                    visible={this.state.visible}
                    width='600px'
                    footer=''
                    onOk={this.handleCancel}
                    onCancel={this.handleCancel} >
                    <NewAppResources id={currentId} appId={this.props.appId} categoryId={this.categoryId} close={this.closeModal} />
                </Modal>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增资源文件</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     分类:<TreeNodeSelect  url={this.menuUrl} defaultData={[{label:'所有资源列表',value:''}]} onChange={this.changeCategoryId} value={this.state.categoryId} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                   {' '}搜索:<Search
                      placeholder="搜索文件名"
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
                />
      </div>
    );
  }
}

export default ListAppFilesByAppId;
