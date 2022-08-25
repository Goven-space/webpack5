import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import EditServerState from '../form/EditServerState';

const Search = Input.Search;
const LIST_URL=URI.CORE_INSSERVER.listByPage;
const DELETE_URL=URI.CORE_INSSERVER.delete;
const CLEAR_URL=URI.CORE_INSSERVER.clear;
const START_URL=URI.CORE_INSSERVER.startServer;
const STOP_URL=URI.CORE_INSSERVER.stopServer;

class ListStopServer extends React.Component {
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
  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    filters.state=['0','2']; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  stopData=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.loadData();
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功解冻所有服务!");
          }
    });
  }

  clearData=()=>{
    this.setState({loading:true});
    let url=CLEAR_URL+"?state=0";
    AjaxUtils.post(url,{},(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功删除所有失败服务!");
          }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['0']};
    let sorter={};
    let searchFilters={};
    searchFilters={"serverId":value,"serverName":value};
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
        title: '服实例名称',
        dataIndex: 'serviceName',
        width:'15%'
      },{
      title: '服务唯一Id',
      dataIndex: 'serverId',
      width: '15%'
    },{
        title: '集群标识',
        dataIndex: 'serverClusterFlag',
        width: '8%'
      },{
        title: '服务器IP',
        dataIndex: 'serverIP',
        width:'12%',
        render:(text,record)=>{return text+":"+record.serverPort;}
      },{
        title: 'API URL',
        dataIndex: 'serviceBaseUrl',
        width:'20%'
      },{
        title: '权重',
        dataIndex: 'weight',
        width:'6%'
      },{
        title: '最后更新',
        dataIndex: 'lastUpdateTime',
        width:'13%'
      },{
        title: '状态',
        dataIndex: 'state',
        width:'5%',
        render:(text,record)=>{
            if(text==='0'){
              return <Tag color="red" >超时失效</Tag>
            }else if(text==='2'){
              return <Tag color="#f50" >强制下线</Tag>
            }
          }
      }];

    const expandedRow=function(record){
      return (<Card title="服务实例状态信息" ><EditServerState data={record} id={record.id} /></Card>);
    }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除所有服务实例吗?",this.clearData)} icon="delete"  >删除所有服务实例</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除选中服务实例吗?",this.deleteData)} icon="delete"   disabled={!hasSelected} >删除选中服务实例</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload" >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索ServerId"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={this.onPageChange}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListStopServer;
