import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import NewNotice from '../form/NewNotice';
import ShowNotice from '../form/ShowNotice';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_NOTICE.list; //分页显示公告
const DELETE_URL=URI.CORE_NOTICE.delete;//删除公告

class ListNotices extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
      isAdminUser:false,
    }
  }

  componentDidMount(){
      ContextUtils.getContext((data)=>{
        if(data.permissionId.indexOf("core.superadmin")!=-1){
          this.setState({isAdminUser:true});
        }
      });
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
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
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
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showNotice=(id)=>{
    this.setState({visible: true,currentId:id,action:'read'});
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
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"title":value,"body":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '类型',
      dataIndex: 'noticeType',
      sorter: true,
      width:'10%',
      render:(text,record)=>{
          if(text==='info'){
            return (<Tag color="green">通知</Tag>);
          }else if(text==='warning'){
            return (<Tag color="red">警告</Tag>);
          }else if(text==='success'){
            return (<Tag color="cyan">提示</Tag>);
          }else if(text==='error'){
            return (<Tag color="pink-inverse">错误</Tag>);
          }
        }
      },{
        title: '标题',
        dataIndex: 'title',
        width: '40%',
        render:(text,record)=>{
          return (<a href='#' onClick={this.showNotice.bind(this,record.id)}>{text}</a>)
        }
      },{
        title: '发布者',
        dataIndex: 'creator',
        width: '20%',
        sorter: true,
      },{
        title: '发布时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter: true,
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render:(text,record)=>{
          if(this.state.isAdminUser){
            return (<a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>);
          }else{
            return '-';
          }
        }
      },];

      let formObj,title;
      if(this.state.action==='edit'){
        title="公告属性";
        formObj=<NewNotice id={currentId} close={this.closeModal} />;
      }else{
        title="公告内容";
        formObj=<ShowNotice id={currentId} close={this.closeModal} />;
      }
    return (
      <Card title="系统公告" style={{minHeight:600}}>
	          <Modal key={Math.random()} title={title} maskClosable={false}
                visible={this.state.visible}
                width='850px'
				        style={{ top: 20}}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {formObj}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o" disabled={!this.state.isAdminUser} >发布公告</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected || !this.state.isAdminUser} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="搜索标题和内容"
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
      </Card>
    );
  }
}

export default ListNotices;
