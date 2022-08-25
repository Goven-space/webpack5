import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,DatePicker} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//待补偿节点列表

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.ESB.CORE_ESB_CompensateNode.list;
const DELETE_URL=URI.ESB.CORE_ESB_CompensateNode.delete;
const CANCEL_URL=URI.ESB.CORE_ESB_CompensateNode.cancel;
const RUN_URL=URI.ESB.CORE_ESB_CompensateNode.run;

class ListCompensateNodeIns extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.url=LIST_URL+"?compensateFlag=1&applicationId="+this.applicationId;
    this.startDate='';
    this.endDate='';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  cancelProcess=(argIds)=>{
    if(this.state.selectedRowKeys.length===0){
      AjaxUtils.showError("请选择一个节点再执行本操作!");
    }else{
      let ids=this.state.selectedRowKeys.join(",");
      let postData={"ids":ids};
      this.setState({loading:true});
      AjaxUtils.post(CANCEL_URL,postData,(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("成功取消("+data.msg+")个节点的补偿状态!");
          this.loadData();
        }
      });
    }
  }

  runProcessCompensate=(argIds)=>{
      if(this.state.selectedRowKeys.length===0){
        AjaxUtils.showError("请选择一个节点再执行本操作!");
      }else{
        let ids=this.state.selectedRowKeys.join(",");
        let postData={"ids":ids};
        this.setState({loading:true});
        AjaxUtils.post(RUN_URL,postData,(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("成功运行("+data.msg+")个节点的补偿请求!");
            this.loadData();
          }
        });
      }
    }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '你确定要删除选中节点的补偿数据吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={appId:[this.props.appId]};
    let sorter={};
    let searchFilters={};
    searchFilters={"processName":value,"transactionId":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url+"&startTime="+this.startDate+"&endTime="+this.endDate;
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
        dataIndex: 'compensateFlag',
        width:'8%',
        render: (text,record) => {
          return <Tag color='blue'>待补偿</Tag>
        }
      },{
        title: '流程名称',
        dataIndex: 'processName',
        width: '20%',
        ellipsis: true,
      },{
        title: '节点名称',
        dataIndex: 'pNodeName',
        width: '15%',
        ellipsis: true,
      },{
          title: '服务器',
          dataIndex: 'runServerId',
          width: '8%',
      },{
          title: '状态码',
          dataIndex: 'responseCode',
          width: '10%',
      },{
      title: '事务Id',
      dataIndex: 'transactionId',
      width:'15%',
      ellipsis: true,
    },{
      title: '创建时间',
      dataIndex: 'startTime',
      width:'15%',
      sorter: true
    },{
      title: '次数',
      dataIndex: 'compensateRunCount',
      width:'8%'
    },{
      title: '最后补偿时间',
      dataIndex: 'lastCompensateTime',
      width:'15%',
      sorter: true
    }];

    const expandedRow=(record)=>{
      return (
        <Card  >
          <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(record))} style={{minHeight:'400px',maxHeight:'650px'}} />
        </Card>
        );
    }

    return (
      <div>
          <Row style={{marginBottom:5}} gutter={0} >
            <Col span={8} >
            <ButtonGroup>
              <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"取消被偿","确定要取消补偿的流程吗?",this.cancelProcess)}  disabled={!hasSelected} icon="poweroff"   >取消补偿</Button>
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"立即进行补偿","确定要立即补偿选中流程吗?",this.runProcessCompensate)}  disabled={!hasSelected} icon="safety"   >立即补偿</Button>
              <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
              <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
            </Col>
            <Col span={16}>
             <span style={{float:'right'}} >
               开始时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
               结束时间:<DatePicker   showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
               关键字:<Search
                placeholder="流程名或事务id"
                style={{ width: 200 }}
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

export default ListCompensateNodeIns;
