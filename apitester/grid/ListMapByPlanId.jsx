import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewCaseMapPlan from '../form/NewCaseMapPlan';

//按测试任务列出所有关联的测试用例

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TESTCASEMAPPLAN.listByPage;
const DELETE_URL=URI.CORE_TESTCASEMAPPLAN.delete;

class ListMapByPlanId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.testPlanId=this.props.planId;
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
    if(this.appId!==undefined && this.appId!=='' && this.appId!==null){
      filters.appId=[this.appId]; //过虑只显示本应用的服务
    }
    filters.testPlanId=[this.testPlanId]; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
          title: 'Method',
          dataIndex: 'method',
          width: '10%',
          render:(text,record) => {
              let method=text;
              if(method==="POST"){
                  return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
              }else if(method==="GET"){
                  return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
              }else if(method==="DELETE" ){
                  return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
              }else if(method==="PUT"){
                  return <Tag color="pink" style={{width:50}} >PUT</Tag>;
              }else if(method==="*"){
                  return <Tag color="#f50" style={{width:50}} >全部</Tag>;
              }
            },
        },{
          title: 'URI',
          dataIndex: 'url',
          width:'35%',
        },{
        title: '服务名称',
        dataIndex: 'serviceName',
        width: '25%',
      },{
        title: '测试次数',
        dataIndex: 'testNum',
        width: '10%',
      },{
        title: '错误次数',
        dataIndex: 'errorNum',
        width: '10%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return  <div>
            <Popconfirm title="确定从本任务中删除吗?" onConfirm={this.deleteData.bind(this,record.id)} ><a>删除</a></Popconfirm>
          </div>;
        }
      },];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='测试结果验证配置' bodyStyle={{padding:8}}>
            <NewCaseMapPlan id={record.id} close={this.closeModal} />
          </Card>
          );
      }

    return (
      <div>
         <div style={divStyle}>
          <ButtonGroup>
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

export default ListMapByPlanId;
