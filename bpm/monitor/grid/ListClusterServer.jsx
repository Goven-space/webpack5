import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Progress} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const LIST_URL=URI.CORE_CLUSTERSERVER.List;
const DELETE_URL=URI.CORE_CLUSTERSERVER.Delete;
const CLEAR_URL=URI.CORE_CLUSTERSERVER.Clear;
const ChangeMasterServerUrl=URI.CORE_CLUSTERSERVER.changeMasterServer;

class ListClusterServer extends React.Component {
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }


    changeMasterServer=()=>{
      this.setState({loading:true});
      let serverId=this.state.selectedRows[0].serverId;
      AjaxUtils.post(ChangeMasterServerUrl,{serverId:serverId},(data)=>{
            this.setState({loading:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              this.loadData();
              this.setState({data:data,loading:false});
              AjaxUtils.showInfo("成功切换主服务器!");
            }
      });
    }

  clearData=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.loadData();
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功删除Drop所有服务器实例!");
          }
    });
  }

  showModal=()=>{
    this.setState({visible: true,currentId:''});
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['1']};
    let sorter={};
    let searchFilters={};
    searchFilters={"serverId":value,"serverName":value};
    sorter={"order":'ascend',"field":'serverId'};//使用serverId升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  clearAllCache=(record)=>{
    let url=record.serviceBaseUrl+"/rest/core/container/clearUrlServiceCache";
    AjaxUtils.post(url,{},(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '服务器唯一Id',
      dataIndex: 'serverId',
      ellipsis: true,
      width: '10%'
    },{
        title: '服务实例名',
        dataIndex: 'currentServiceName',
        ellipsis: true,
        width:'10%'
      },{
        title: '集群标识',
        dataIndex: 'currentServerClusterFlag',
        width: '8%'
      },{
        title: 'IP',
        dataIndex: 'serverIP',
        width:'12%',
        ellipsis: true,
        render:(text,record)=>{return text+":"+record.currentServerPort;}
      },{
        title: 'URL',
        dataIndex: 'serviceBaseUrl',
        width:'10%',
        ellipsis: true,
        render:(text,record)=>{let url=text+"/admin";return <a href={url} target='_blank'>进入管理</a>}
      },{
        title: '内存使用率',
        dataIndex: 'memoryUsage',
        width: '15%',
        render:(text,r)=>{
          if((text-0)>60){
            return <Progress percent={text} status="exception" />;
          }else{
            return <Progress percent={text}  />;
          }
        }
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        ellipsis: true,
        width:'13%'
      },{
        title: '主节点',
        dataIndex: 'masterServerFlag',
        width:'10%',
        render:(text,record)=>{
          if(text==='true'){return <Tag color='red'>是</Tag>}else{
            return '否';
          }
        }
      }];

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"Drop确认","需要Drop所有服务器吗?",this.clearData)} icon="delete"  >Drop所有服务器</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"Drop确认","需要Drop选中服务器吗?",this.deleteData)} icon="delete" disabled={!hasSelected}  >Drop选中服务器</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"切换确认","需要把选中服务器设为主服务器吗?",this.changeMasterServer)} icon="tag" disabled={!hasSelected}  >切换主服务器</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
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
        />
      </div>
    );
  }
}

export default ListClusterServer;
