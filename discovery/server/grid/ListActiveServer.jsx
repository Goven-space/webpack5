import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import EditServerState from '../form/EditServerState';
import ShowJvmInfo from '../../monitor/grid/ShowJvmInfo';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_INSSERVER.listByPage;
const DELETE_URL=URI.CORE_INSSERVER.delete;
const CLEAR_URL=URI.CORE_INSSERVER.clear;
const START_URL=URI.CORE_INSSERVER.startServer;
const STOP_URL=URI.CORE_INSSERVER.stopServer;
const DIRECT_STOP_URL=URI.CORE_INSSERVER.directStopServer;
const doubleWeightUrl =URI.CORE_INSSERVER.doubleWeight;
const halfWeightUrl =URI.CORE_INSSERVER.halfWeight;

class ListActiveServer extends React.Component {
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
    filters.state=['1']; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  clearData=()=>{
    this.setState({loading:true});
    let url=CLEAR_URL+"?state=1";
    AjaxUtils.post(url,{},(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功删除Drop所有服务器实例!");
          }
    });
  }

  //强制下线
  directStopServer=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(DIRECT_STOP_URL,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功下线("+data.msg+")个服务器实例!");
          }
    });
  }

  //失效
  stopServer=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(STOP_URL,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功失效("+data.msg+")个服务器实例!");
          }
    });
  }

  //倍权
  doubleWeight=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(doubleWeightUrl,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功倍权("+data.msg+")个服务器实例!");
          }
    });
  }

  //半权
  halfWeight=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(halfWeightUrl,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            this.setState({data:data});
            AjaxUtils.showInfo("成功倍权("+data.msg+")个服务器实例!");
          }
    });
  }

  showModal=()=>{
    this.setState({visible: true,currentId:''});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag==true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
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
        width:'20%',
        ellipsis: true,
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
        width:'6%',
        render:(text,record)=>{if(record.manualMode=='0'){return <Tag color="green" >活跃</Tag>}else{return <Tag color="red" >手动</Tag>} }
      }];

    const expandedRow=function(record){
      return (
        <Card title="注册服务器状态信息">
            <EditServerState data={record} id={record.id} />
      </Card>
      );
    }

    return (
      <div>
        <Modal key={Math.random()} title='手动注册服务器' maskClosable={false}
            visible={this.state.visible}
            width='850px'
            footer=''
            style={{top:20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <EditServerState id='' close={this.closeModal} />
        </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={16} >
              <Button  type="primary" onClick={this.showModal} icon="plus-circle-o"  >手动注册</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"下线确认","需要强制下线服务实例吗?",this.directStopServer)} icon="stop" title='强制下线后服务不能再自动上线,必须手动解除'  disabled={!hasSelected} >强制下线</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"失效确认","需要失效服务实例吗?",this.stopServer)} icon="stop" title='把服务失为失效状态,失效后服务还可再自动上线'  disabled={!hasSelected} >失效</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要Drop选中服务实例吗?",this.deleteData)} icon="delete" title='Drop选中的服务实例,Drop后服务还可再自动上线'  disabled={!hasSelected} >Drop</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"倍权确认","需要倍权选中服务实例吗?",this.doubleWeight)} icon="plus" title='倍权只对处于手动状态的服务实例有效'  disabled={!hasSelected} >倍权</Button>{' '}
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"半权确认","需要半权选中服务实例吗?",this.halfWeight)} icon="minus" title='半权只对处于手动状态的服务实例有效'  disabled={!hasSelected} >半权</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={8}>
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
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListActiveServer;
