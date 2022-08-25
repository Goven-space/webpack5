import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ProcessMonitor from '../../process/ProcessMonitor';
import ShowPorcessInstanceInfo from './ShowPorcessInstanceInfo';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.compensateProcessUrl;
const DELETE_URL=URI.ETL.MONITOR.deleteCompensateProcessUrl;

//待重跑任务

class ListCompensateProcess extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.runType=this.props.runType; //0表示全部结束的
    this.url=LIST_URL+"?applicationId="+this.applicationId;
    this.searchKeyWords=''; //要搜索的关键字
    this.startDate='';
    this.endDate='';
    this.transactionId='';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      action:''
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
      let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate;
      GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '你确定要删除选中重跑任务吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={"processName":value};
    sorter={"order":'ascend',"field":'processName'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '状态',
        dataIndex: 'status',
        width:'8%',
        render: (text,record) => {
          if(text===1){
              return <Tag color='orange'>重跑中</Tag>
          }else{
            return <Tag color='blue'>待安排</Tag>
          }
        }
      },{
        title: '流程名称',
        dataIndex: 'processName',
        width: '18%',
        sorter:true,
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
      title: '最大重跑次数',
      dataIndex: 'maxReRunCount',
      width:'10%'
    },{
      title: '事务Id',
      dataIndex: 'transactionId',
      width:'15%'
    },{
    title: '任务执行结果',
    dataIndex: 'msg',
    width:'25%',
    ellipsis: true,
  },{
      title: '任务生成时间',
      dataIndex: 'createTime',
      width:'15%',
      sorter: true
    }];

    const expandedRow=(record)=>{
      return (<ShowPorcessInstanceInfo record={record} />);
    }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                  <span style={{float:'right'}} >
                    <Search
                     placeholder="流程名称"
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
                expandedRowRender={expandedRow}
              />
      </div>
    );
  }
}

export default ListCompensateProcess;
