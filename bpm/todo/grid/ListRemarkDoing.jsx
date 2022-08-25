import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.BPM.REMARKS.listDoing;

//列出正在审批的用户列表

class ListRemarkDoing extends React.Component {
  constructor(props) {
    super(props);
    this.transactionId=this.props.transactionId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?transactionId="+this.transactionId+"&applicationId="+this.applicationId; //事务id
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '审批人',
        dataIndex: 'userName',
        width:'15%'
      },{
      title: '所在节点',
      dataIndex: 'pNodeName',
      width:'20%',
      ellipsis: true,
    },{
      title: '来自',
      dataIndex: 'sourceUserId',
      width:'15%',
      ellipsis: true,
    },{
        title: '开始时间',
        dataIndex: 'startTime',
        width: '15%'
    },{
      title: '阅读时间',
      dataIndex: 'firstReadTime',
      width: '15%',
    },{
      title: '已耗时',
      dataIndex: 'totalRunTime',
      width:'10%',
      render: (text,record) => {return <Tag color='green'>{text}</Tag>}
    }];

    return (
      <div>
          <Row style={{marginBottom:5}} gutter={0} >
            <Col span={10} >
            <ButtonGroup>
              <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
            </Col>
            <Col span={14}>
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

export default ListRemarkDoing;
