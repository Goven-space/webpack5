import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider,Badge} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewTestPlan from '../form/NewTestPlan';
import ListMapByPlanId from './ListMapByPlanId';

//按应用列出测试计划

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TESTPLAN.listByPage;
const DELETE_URL=URI.CORE_TESTPLAN.delete;
const RUNTASK_URL=URI.CORE_TESTPLAN.runTask;

class ListTestPlan extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      visible:false,
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
      this.setState({visible: true,currentId:record.id});
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }
  }

  runTask=(id)=>{
    let url=RUNTASK_URL.replace('{id}',id);
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '任务名称',
        dataIndex: 'configName',
        width: '20%',
          render:(text,record)=>{return <span>{text}<Badge count={record.testCaseCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span>;}
      },{
        title: '运行频率',
        dataIndex: 'runDateTime',
        width:'15%',
        render:(text,record)=>{
          if(text.indexOf(":")===-1){
            return "每("+text+")小时";
          }else if(record.state==='0'){
            return "-";
          }else{
            return "每天("+text+")";
          }
        }
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '最后运行时间',
        dataIndex: 'lastRunTime',
        width:'20%',
      },{
        title: '测试通过率',
        dataIndex: 'passRate',
        width:'10%',
        render:(text,record)=>{
          if(text===""){
            return "-";
          }else if(text==='100.0%'){
            return (<Tag color="#87d068" >100%</Tag>)
          }else{
            return (<Tag color="red" >{text}</Tag>)
          }
        }
      },{
        title: '运行方式',
        dataIndex: 'state',
        width:'10%',
        render:(text,record)=>{
          if(text==="1"){
            return (<Tag color="#87d068" >自动</Tag>)
          }else{
            return (<Tag color="#f50" >手动</Tag>)
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
          return  <div>
            <a onClick={this.onActionClick.bind(this,'Edit',record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm title="立即运行测试任务?" onConfirm={this.runTask.bind(this,record.id)}><a>手动运行</a></Popconfirm>
          </div>;
        }
      },];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='列入本任务的测试用例' bodyStyle={{padding:8}}>
            <ListMapByPlanId planId={record.id} appId={this.appId} />
          </Card>
          );
      }

    return (
      <div>
        <Modal key={Math.random()} title="测试任务属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='960px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewTestPlan appId={this.appId} id={currentId} close={this.closeModal} />
        </Modal>
         <div style={divStyle}>
          <ButtonGroup>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增测试计划</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          expandedRowRender={expandedRow}
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

export default ListTestPlan;
