import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ListReportDetails from './ListReportDetails';

//按应用列出测试结果

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TESTREPORT.listByPage;
const DELETE_URL=URI.CORE_TESTREPORT.delete;
const CLEAR_URL=URI.CORE_TESTREPORT.clear;

class ListTestReport extends React.Component {
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

  clearAll=()=>{
    this.setState({mask:true});
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
      this.setState({mask:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
      }
    })
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '报告名称',
        dataIndex: 'reportName',
        width: '40%',
      },{
        title: '测试通过率',
        dataIndex: 'passRate',
        width:'20%',
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
        title: '测试时间',
        dataIndex: 'runtTime',
        width:'20%',
      },{
        title: '成功数',
        dataIndex: 'sucessNum',
        width:'10%',
      },{
        title: '失败数',
        dataIndex: 'errorNum',
        width:'10%',
        render:(text,record)=>{
          if(text==="0" || text===undefined){
            return "0";
          }else{
            return (<Tag color="red" >{text}</Tag>)
          }
        }
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='测试结果' bodyStyle={{padding:8}}>
            <ListReportDetails reportId={record.id} appId={this.appId} />
          </Card>
          );
      }

    return (
      <div>
         <div style={divStyle}>
          <ButtonGroup>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'清空确认','需要清空所有测试记录吗?',this.clearAll)} icon="delete"    >清空</Button>
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

export default ListTestReport;
