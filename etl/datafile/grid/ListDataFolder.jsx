import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewDataFile from '../form/NewDataFolder';
import ListDataFiles from './ListDataFiles';

//文件夹管理

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.FileManager.list;
const DELETE_URL=URI.ETL.FileManager.delete;
const START_URL=URI.ETL.FileManager.startMonitor;
const CLOSE_URL=URI.ETL.FileManager.stopMonitor;

class ListDataFolder extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.categoryId=this.props.categoryId||'AllFile';
    this.url=LIST_URL+"?applicationId="+this.applicationId;
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
    if(this.categoryId!=='all' && this.categoryId!==''){
      filters.categoryId=[this.categoryId];
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '注意，如果文件夹下面有文件时不会删除文件!',
      content: '确认删除!',
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
    searchFilters={"remark":value,"filePath":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  start=(id)=>{
      this.setState({loading:true});
      let url=START_URL;
      AjaxUtils.post(url,{id:id},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }

  close=(id)=>{
      this.setState({loading:true});
      let url=CLOSE_URL;
      AjaxUtils.post(url,{id:id},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo(data.msg);
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
        title: '存储路径',
        dataIndex: 'filePath',
        sorter: true,
        width: '30%',
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%',
        sorter: true,
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%',
        sorter: true,
      },{
        title: '监听',
        dataIndex: 'monitorFlag',
        width:'6%',
        render: (text,record) => {
          if(text===1){
            return <Tag color='blue' >是</Tag>
          }else{
            return <Tag color='#ccc'>否</Tag>
          }
        }
      },{
        title: '状态',
        dataIndex: 'status',
        width:'10%',
        render: (text,record) => {
          if(text==='1'){
            return <Tag color='red' >监听中</Tag>
          }else{
            return <Tag color='#ccc'>未启动</Tag>
          }
        }
      },{
          title: '备注',
          dataIndex: 'remark',
          width: '15%'
        },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
                return (<span>
                  <a onClick={this.onActionClick.bind(this,'Edit',record)} >修改</a>
                  {record.monitorFlag===1?
                  <span><Divider type="vertical" />
                  <a onClick={AjaxUtils.showConfirm.bind(this,'启动监听','确定要启动监听器接收数据吗?',this.start.bind(this,record.id))} >启动</a>
                  <Divider type="vertical" />
                  <a onClick={AjaxUtils.showConfirm.bind(this,'关闭监听器','确定要关闭监听器吗?',this.close.bind(this,record.id))} >停止</a>
                  </span>
                  :
                  <span><Divider type="vertical" />
                  -
                  <Divider type="vertical" />
                  -
                </span>}

                </span>);
        }
      }];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
                <ListDataFiles id={record.id} applicationId={this.applicationId} />
          </div>
          );
      }

    return (
      <div >
    	          <Modal key={Math.random()} title="文件夹属性" maskClosable={false}
                    visible={this.state.visible}
                    width='900px'
                    footer=''
                    style={{top:20}}
                    onOk={this.handleCancel}
                    onCancel={this.handleCancel} >
                    <NewDataFile id={currentId} appId={this.props.appId} applicationId={this.applicationId} categoryId={this.categoryId} close={this.closeModal} />
                </Modal>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >创建文件夹</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     搜索:<Search
                      placeholder="搜索文件夹"
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
      </div>
    );
  }
}

export default ListDataFolder;
