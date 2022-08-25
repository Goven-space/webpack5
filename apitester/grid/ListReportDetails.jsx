import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Popconfirm,Button,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ListMapByPlanId from './ListMapByPlanId';

//按应用列出测试计划

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TESTREPORTDETAILS.listByPage;
const DELETE_URL=URI.CORE_TESTREPORTDETAILS.delete;

class ListReportDetails extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.reportId=this.props.reportId;
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
    filters.reportId=[this.reportId]; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
         title: '验证结果',
         dataIndex: 'validateResult',
         width:'10%',
         render:(text,record)=>{
           if(text){
             return <Tag color="#87d068" >成功</Tag>;
           }else{
             return (<Tag color="#f50" >失败</Tag>)
           }
         }
       },{
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
          dataIndex: 'testUrl',
          width:'30%'
        },{
        title: '服务名称',
        dataIndex: 'testCaseName',
        width: '30%',
       },{
        title: '总耗时/秒',
        dataIndex: 'totalTime',
        width:'10%',
      },{
        title: '状态码',
        dataIndex: 'responseCode',
        width:'10%',
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='测试结果明细' bodyStyle={{padding:8}}>
              <Row><Col span={3} offset={1} >实际测试URL</Col><Col span={20} >{record.requestUrl}</Col></Row>
              <Row><Col span={3} offset={1}>请求头</Col><Col span={20}>{record.header}</Col></Row>
              <Row><Col span={3} offset={1}>输入参数</Col><Col span={20}>{record.inParams}</Col></Row>
              <Row><Col span={3} offset={1}>RequestBody</Col><Col span={20}>{record.RequestBody}</Col></Row>
              <Row><Col span={3} offset={1}>Rresponse Header</Col><Col span={20}>{record.responseHeader}</Col></Row>
              <Row><Col span={3} offset={1}>Rresponse Body</Col><Col span={20}>{record.responseBody}</Col></Row>
              <Row><Col span={3} offset={1}>HTTP状态码</Col><Col span={20}>{record.responseCode}</Col></Row>
              <Row><Col span={3} offset={1}>断言结果</Col><Col span={20}>{record.validateResult?'成功':'失败'}</Col></Row>
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

export default ListReportDetails;
