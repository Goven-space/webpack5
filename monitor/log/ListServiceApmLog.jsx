import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowLog from './ShowLog';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.listServiceApmLog;

class ListServiceApmLog extends React.Component {
  constructor(props) {
    super(props);
    this.traceId=this.props.traceId;
    this.parentSpanId=this.props.spanId;
    this.url=LIST_URL+"?traceId="+this.traceId+"&parentSpanId="+this.parentSpanId;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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


  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"mapUrl":value,"beanId":value};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    this.searchFilters=searchFilters;
    GridActions.loadData(this,this.url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '方法',
        dataIndex: 'methodType',
        width:'8%',
        render:text => {
          if(text==="POST"){
              return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
          }else if(text==="GET"){
              return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
          }else if(text==="PUT" || text==="DELETE" ){
              return <Tag color="#f50" style={{width:50}} >{text}</Tag>
          }else if(text==="*"){
              return <Tag color="#f50" style={{width:50}} >全部</Tag>
          }
        }
      },{
        title: '服务URI',
        dataIndex: 'requestUrl',
        width: '20%'
      },{
        title: 'ServerId',
        dataIndex: 'serverId',
        width: '10%'
      },{
        title: 'traceId',
        dataIndex: 'traceId',
        width: '25%',
        render:(text,record)=>{return text+"-"+record.spanId}
      },{
        title: '请求时间',
        dataIndex: 'actionTime',
        width:'15%',
        sorter: true
      },{
        title: '总耗时',
        dataIndex: 'runTotalTime',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}(毫秒)</Tag>
          }
        }
      },{
        title: '用户',
        dataIndex: 'userId',
        width:'10%',
      }];

    const expandedRow=function(record){
      return (<Card>
        <Tabs defaultActiveKey="RequestInfo"  >
            <TabPane tab="请求信息" key="RequestInfo" animated={false}>
              <ShowLog record={record} ></ShowLog>
            </TabPane>
        <TabPane tab="下级调用链跟踪" key="apm" animated={false}>
              <ListServiceApmLog traceId={record.traceId} spanId={record.spanId} />
        </TabPane>
      </Tabs>
    </Card>);
    }

    return (
      <div >
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListServiceApmLog;
