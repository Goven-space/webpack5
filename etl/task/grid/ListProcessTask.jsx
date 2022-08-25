import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ShowPorcessInstanceInfo from '../../monitor/grid/ShowPorcessInstanceInfo';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.TASK.list;
const DELETE_URL=URI.ETL.TASK.delete;
const CLEAR_URL=URI.ETL.TASK.clear;
const CHAGESTATUS_URL=URI.ETL.TASK.changestatus;

//所有任务列表

class ListProcessTask extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId||'';
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
      status:'*'
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    if(this.state.searchKeyWords!==''){
      this.search(this.state.searchKeyWords,pagination,filters,sorter);
    }else{
      this.loadData(pagination,filters,sorter);
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
      let url=this.url+"&status="+this.state.status;
      GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  changestatus=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(CHAGESTATUS_URL,{ids:ids},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功重置("+data.msg+")个任务!");
        this.loadData();
      }
    });
  }

  clear=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(CLEAR_URL,{applicationId:this.applicationId},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功清空("+data.msg+")个任务!");
        this.loadData();
      }
    });
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
  search=(value,pagination=this.state.pagination,filters={},sorter={})=>{
    let searchFilters={"processName":value};
    sorter={"order":'desc',"field":'createTime'};
    let url=this.url+"&status="+this.state.status;
    this.setState({"searchKeyWords":value});
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  setStatus=(e)=>{
    this.state.pagination.current=1;
    let value=e.target.value;
    this.state.status=value;
    this.loadData();
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
          if(text==="0"){
              return <Tag color='blue'>等待</Tag>
          }else if(text==="1"){
            return <Tag color='orange'>已领取</Tag>
          }else if(text==="2"){
            return <Tag color='red'>失败</Tag>
          }else if(text==="3"){
            return <Tag color='green'>已结束</Tag>
          }else if(text==="4"){
            return <Tag color='orange'>执行中</Tag>
          }
        }
      },{
        title: '任务名称',
        dataIndex: 'processName',
        width: '18%',
      },{
        title: '所属应用',
        dataIndex: 'applicationId',
        width:'10%',
      },{
        title: '级别',
        dataIndex: 'taskLevel',
        width:'6%',
      },{
        title: '任务创建时间',
        dataIndex: 'createTime',
        width:'15%'
      },{
        title: '创建服务器',
        dataIndex: 'createServerId',
        width:'10%'
      },{
        title: '领取服务器',
        dataIndex: 'serverId',
        width:'10%',
        render: (text,record) => {
          if(text==''){
              return <Tag color='#ccc'>待领取</Tag>
          }else{
            return <Tag color='green'>{text}</Tag>
          }
        }
      },{
            title: '线程Id',
            dataIndex: 'threadId',
            width:'8%',
      },{
            title: '结束时间',
            dataIndex: 'endTime',
            width:'15%',
            sorter: true
      },{
          title: '执行结果',
          dataIndex: 'msg',
          width:'10%',
          ellipsis: true
        }];



    const expandedRow=(record)=>{
      record.currentStatus='end';
      return (<ShowPorcessInstanceInfo record={record} />);
    }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={18} >
                <Radio.Group  value={this.state.status} onChange={this.setStatus} >
                  <Radio.Button  value="*">所有任务 </Radio.Button>
                  <Radio.Button  value="0">待领取 </Radio.Button>
                  <Radio.Button  value="1">已领取</Radio.Button>
                  <Radio.Button  value="4">执行中</Radio.Button>
                  <Radio.Button  value="2">失败的</Radio.Button>
                  <Radio.Button  value="3">成功的</Radio.Button>
                </Radio.Group>
                {' '}
                <ButtonGroup>
                  <Button  type="ghost"  onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost"  onClick={AjaxUtils.showConfirm.bind(this,"清空任务","清空所有任务数据,清空后不可恢复!",this.clear)} icon="delete"  >清空</Button>
                  <Button  type="ghost"  onClick={AjaxUtils.showConfirm.bind(this,"重置调度","选中的任务将被重新加入到待领取队列中!",this.changestatus)}  icon="file"  disabled={!hasSelected} >重置任务</Button>
                  <Button  type="ghost"  onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                {' '}
                </Col>
                <Col span={6}>
                  <span style={{float:'right'}} >
                    <Search
                     placeholder="任务名称"
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

export default ListProcessTask;
