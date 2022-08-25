import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import UploadFile from '../form/UploadFile';

//文件管理

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.FileManager.listFiles;
const DELETE_URL=URI.ETL.FileManager.deleteFiles;
const DOWNLOAD_URL=URI.ETL.FileManager.downloadFile;

class ListDataFiles extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.id=this.props.id;
    this.url=LIST_URL+"?id="+this.id;
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


  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination:pagination});
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"filePath":ids};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '注意，删除后不可恢复!',
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
      this.loadData();
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"fileName":value};
    sorter={"order":'ascend',"field":'fileName'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  download=(fileName)=>{
    let url=DOWNLOAD_URL+"?id="+this.id+"&fileName="+fileName+"&identitytoken="+AjaxUtils.getCookie(URI.cookieId);
    window.location.href=url;
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '',
        dataIndex: '',
        width: '3%',
        render:(v,r)=>{return <Icon type='file' />}
      },{
        title: '文件名',
        dataIndex: 'filePath',
        width: '75%',
        render:(v,r)=>{
          return <a  onClick={this.download.bind(this,r.fileName)}>{r.fileName}</a>;
        }
      },{
        title: '更新时间',
        dataIndex: 'editTime',
        width: '15%',
      },{
          title: '大小',
          dataIndex: 'fileSize',
          width: '10%',
        }];

    return (
      <div >
    	          <Modal key={Math.random()} title="上传文件" maskClosable={false}
                    visible={this.state.visible}
                    width='600px'
                    footer=''
                    onOk={this.handleCancel}
                    onCancel={this.handleCancel} >
                    <UploadFile id={this.id} appId={this.props.applicationId}  close={this.closeModal} loadData={this.loadData} />
                </Modal>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >上传文件</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                  </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     搜索:<Search
                      placeholder="文件名"
                      style={{ width: 260 }}
                      onSearch={value => this.search(value)}
                    />
                     </span>
                  </Col>
                </Row>
                <Table
                  size='small'
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

export default ListDataFiles;
