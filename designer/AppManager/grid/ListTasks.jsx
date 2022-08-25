import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewTask from '../form/NewTask';
import ShowTask from '../form/ShowTask';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TASK.list; //分页显示
const DELETE_URL=URI.CORE_TASK.delete;//删除
const EXCEL_URL=URI.CORE_TASK.toExcel;

class ListTasks extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.status=this.props.status;
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
    let state=this.status;
    if(state!==undefined && state!==''){
       let value = [state];
      filters.taskState=value; //只显示指定类型的任务
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showTask=(id)=>{
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
    if(this.status!==undefined && this.status!==''){
      filters.taskState=[this.status]; //只显示指定类型的任务
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"title":value,"body":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  //导出到excel
  exportExcel=()=>{
    let url=EXCEL_URL+"?taskState="+this.status;
    AjaxUtils.get(url,(data)=>{
      window.open(URI.baseResUrl+data.msg);
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '类型',
        dataIndex: 'taskType',
        width: '8%',
        render:(text,record)=>{
          if(text==='需求'){
            return  (<Tag color="green-inverse">{text}</Tag>);
          }else if(text==='BUG'){
            return  (<Tag color="#f50">{text}</Tag>);
          }else if(text==='建议'){
            return  (<Tag color="cyan">{text}</Tag>);
          }else{
            return  (<Tag color="#2db7f5">{text}</Tag>);
          }
        }
      },{
        title: '任务说明',
        dataIndex: 'title',
        width: '25%',
        render:(text,record)=>{
          return (<a href='#' onClick={this.showTask.bind(this,record.id)}>{text}</a>)
        }
      },{
        title: '开发者',
        dataIndex: 'taskOwner',
        width: '10%',
        sorter: true,
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%',
        sorter: true,
      },{
        title: '发布日期',
        dataIndex: 'createTime',
        width: '15%',
        sorter: true,
      },{
        title: '期望完成日期',
        dataIndex: 'endDate',
        width: '15%',
        sorter: true,
      },{
        title: '状态',
        dataIndex: 'taskState',
        width: '8%',
        render:(text,record)=>{
          if(text==='1'){return '开发'}
          else if(text==='2'){return '测试'}
          else if(text==='5'){return '结束'}
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="#"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除版本","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

      let formObj,title;
      if(this.state.action==='edit'){
        formObj=<NewTask id={currentId} close={this.closeModal} />;
      }else{
        formObj=<ShowTask id={currentId} close={this.closeModal} />;
      }
    return (
      <Card title="开发任务管理" style={{minHeight:600}}>
	          <Modal key={Math.random()} title='开发任务' maskClosable={false}
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
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增任务</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.exportExcel} icon="file"   >导出到Excel</Button>{' '}
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

export default ListTasks;
