import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const Search = Input.Search;
const LIST_URL=URI.CORE_INSSERVER.listByPage;

class ListHomepageServer extends React.Component {
  constructor(props) {
    super(props);
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
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    filters.state=['1']; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['1']};
    let sorter={};
    let searchFilters={};
    searchFilters={"serverId":value,"serverName":value,"runAppIds":value};
    sorter={"order":'ascend',"field":'serverId'};//使用serverId升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '服务实例名',
      dataIndex: 'serviceName',
      width: '10%'
    },{
        title: '集群Id',
        dataIndex: 'serverClusterFlag',
        width: '10%'
      },{
        title: 'IP:端口',
        dataIndex: 'serverIP',
        width:'15%',
        render:(text,record)=>{return text+":"+record.serverPort;}
      },{
        title: 'API',
        dataIndex: 'serviceNum',
        width:'5%',
        render:(text,record)=>{if(text===''){return '-'}else{return text;} }
      },{
        title: '线程',
        dataIndex: 'activeThreadCount',
        width:'5%',
        render:(text,record)=>{if(text===''){return '-'}else{return text;} }
      },{
        title: '异常',
        dataIndex: 'exceptionNum',
        width:'5%',
      },{
        title: '调用',
        dataIndex: 'accessTotalCount',
        width:'5%',
      },{
        title: '响应时间(秒)',
        dataIndex: 'avgResponseTime',
        width:'10%',
      },{
        title: '状态',
        dataIndex: 'state',
        width:'10%',
        render:(text,record)=>{if(record.manualMode=='0'){return <Tag color="green" >活跃</Tag>}else{return <Tag color="red" >手动</Tag>} }
      }];

    return (
      <div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ListHomepageServer;
