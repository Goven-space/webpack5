import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ReadProcessForm from '../form/ReadProcessForm';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.BPM.TODO.allDocs;
const DELETE_URL=URI.BPM.TODO.tododelete;

class ListAllDocs extends React.Component {
  constructor(props) {
    super(props);
    this.applicationId=this.props.applicationId; //2表示全部包括成功和失败的
    this.processId=this.props.processId; //按指定流程显示
    this.url=LIST_URL+"?processId="+this.processId; //流程id
    this.deleteUrl=DELETE_URL+"?applicationId="+this.applicationId; //应用id
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      approveUserId:'',
      currentRecord:{processId:'',transactionId:''},
      searchKeyWords:'',
      collapsed:false,
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,this.deleteUrl,argIds);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,{},{},{});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中的流程吗?',
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

  openForm=(record,userId)=>{
    this.setState({visible: true,currentRecord:record});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流水号',
        dataIndex: 'wf_serialNumber',
        width:'10%'
      },{
          title: '待办标题',
          dataIndex: 'subject',
          width: '35%'
      },{
        title: '流程名称',
        dataIndex: 'wf_processName',
        width: '15%',
        ellipsis: true,
      },{
      title: '申请人',
      dataIndex: 'wf_creatorName',
      width:'10%',
      sorter: true
    },{
      title: '申请时间',
      dataIndex: 'wf_startTime',
      width:'15%',
      sorter: true,
      ellipsis: true
    },{
      title: '结束时间',
      dataIndex: 'wf_endTime',
      width:'15%',
      sorter: true,
      ellipsis: true
    },{
      title: '总耗时',
      dataIndex: 'wf_totalTime',
      width:'10%',
      render: (text,record) => {return <Tag color='green'>{text}</Tag>}
    }];
    const expandedRow=(record)=>{
      return (
        <Card bordered={true} size='small' >
          <ReadProcessForm processId={record.processId} transactionId={record.transactionId} />
        </Card>
        );
    }
    return (
      <div>
          <Modal key={Math.random()} title='' maskClosable={false}
              visible={this.state.visible}
              width='1200px'
              style={{top:20}}
              footer=''
              onOk={this.handleCancel}
              onCancel={this.handleCancel} >
              <ReadProcessForm processId={this.state.currentRecord.processId} transactionId={this.state.currentRecord.transactionId} close={this.closeModal} />
          </Modal>
          <Row style={{marginBottom:5}} gutter={0} >
            <Col span={10} >
            <ButtonGroup>
              <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
              <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
            </Col>
            <Col span={14}>
            </Col>
          </Row>
          <Table
            bordered={false}
            rowKey={record => record.transactionId}
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

export default ListAllDocs;
