import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ImportAppVersion from '../form/ImportAppVersion';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPVERSIONS.list;
const DELETE_URL=URI.CORE_APPVERSIONS.delete;
const INSTALL_URL=URI.CORE_APPVERSIONS.install;
const IMPORT_URL=URI.CORE_APPVERSIONS.import;
const DOWNLOAD_URL=URI.CORE_APPVERSIONS.download;

class ListAppVersions extends React.Component {
  constructor(props) {
    super(props);
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
      action:'',
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
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }else if(action==="publish"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  install=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(INSTALL_URL,{id:id},(data)=>{
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo(data.msg);
      }
      this.setState({loading:false});
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    if(this.props.appId!==undefined && this.props.appId!==""){
      let value = [this.props.appId];
      filters.appId=value; //?????????????????????????????????
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
      content: '??????:?????????????????????!',
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

  //??????ajax??????????????????
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"packageAppName":value,"packageAppId":value};
    sorter={"order":'ascend',"field":'createTime'};//??????userName????????????
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }
  download=(id)=>{
    var url=DOWNLOAD_URL+"?id="+id+"&identitytoken="+AjaxUtils.getCookie(URI.cookieId);
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '????????????',
        dataIndex: 'packageAppName',
        width: '25%',
        sorter: true
      },{
        title: '??????Id',
        dataIndex: 'packageAppId',
        width: '15%'
      },{
        title: '????????????',
        dataIndex: 'fileName',
        width: '25%',
        render:(text,record)=>{
          return <a href='#' onClick={this.download.bind(this,record.id)}>{text}</a>;
        }
      },{
        title: '??????',
        dataIndex: 'fileSize',
        width: '10%',
        render:text=>{return <span>{text}k</span>;}
      },{
        title: '????????????',
        dataIndex: 'createTime',
        width: '15%',
        sorter: true,
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"???????????????????????????","??????:????????????????????????????????????,???????????????!",this.install.bind(this,record.id))} >??????</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"????????????","?????????????????????!",this.onActionClick.bind(this,"Delete",record))} >??????</Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a>Action <Icon type="down" /></a>
          </Dropdown>}
      },];

    let modelElement;
    let title="";
    let width='600px';
    title="??????????????????";
    modelElement=<ImportAppVersion id={currentId} appId={this.props.appId} close={this.closeModal} />;
    return (
      <div style={{minHeight:'600px'}}>
            <Modal key={Math.random()} title={title} maskClosable={false}
                visible={this.state.visible}
                width={width}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {modelElement}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add"   >??????????????????</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"   disabled={!hasSelected} >??????</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"   loading={loading} >??????</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 ??????:<Search
                  placeholder="?????????????????????id"
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

export default ListAppVersions;
