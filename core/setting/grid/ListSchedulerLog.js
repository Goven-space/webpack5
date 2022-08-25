import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_SCHEDULER.schedulerLogList; //分页显示
const CLEAR_URL=URI.CORE_SCHEDULER.schedulerLogClear;//删除

class ListSchedulerLog extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.url=LIST_URL+"?parentId="+this.parentId;
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '清空确认?',
      content: '注意:清空后不可恢复!',
      onOk(){
        return self.clear();
      },
      onCancel() {},
      });
  }

  clear=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{parentId:this.parentId},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo("共清除("+data.msg+")条数据!");
      }
      this.loadData();
    });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '调度时间',
        dataIndex: 'startTime',
        width: '20%',
        sorter:true,
      },{
          title: '执行服务器',
          dataIndex: 'serverId',
          width: '20%',
          sorter:true,
        },{
        title: '调度结果',
        dataIndex: 'resultMsg',
        width: '40%'
      },{
        title: '耗时(毫秒)',
        dataIndex: 'totalRunTime',
        width: '10%',
      }];

    return (
      <Card title="调度日志" >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.showConfirm} icon="delete"  >清空</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    </ButtonGroup>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              size='small'
            />
      </Card>
    );
  }
}

export default ListSchedulerLog;
