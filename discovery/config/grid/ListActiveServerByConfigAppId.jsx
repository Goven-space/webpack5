import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=host+"/rest/discovery/config/admin/servicename/list";
const PUSH_URL=URI.LIST_CONFIG_CENTER.realtimePublish;

class ListActiveServerByConfigAppId extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.configIds=this.props.ids;
    this.configAppId=this.props.configAppId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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
    if(this.configAppId!==undefined){
      filters.configAppId=[this.configAppId];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['1']};
    if(this.configAppId!==undefined){
      filters.configAppId=[this.configAppId];
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"serverName":value};
    sorter={"order":'ascend',"field":'serverId'};//使用serverId升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  push=()=>{
    let serverIds=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(PUSH_URL,{"configIds":this.configIds,"serverIds":serverIds},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功推送("+data.msg+")个配置给服务实例!");
        this.loadData();
      }
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length >0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '服务实例名',
      dataIndex: 'serviceName',
      width: '30%'
    },{
        title: '集群Id',
        dataIndex: 'serverClusterFlag',
        width: '15%'
      },{
        title: 'IP',
        dataIndex: 'serverIP',
        width:'25%',
        render:(text,record)=>{return text+":"+record.serverPort;}
      },{
        title: '最后更新',
        dataIndex: 'lastUpdateTime',
        width:'20%'
      }];

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"实时推送","如果服务实例较多将花费较长时间?",this.push)} icon="sync"  >全部服务实例</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"实时推送","将立即更新选中服务实例的配置数据?",this.push)} icon="sync" disabled={!hasSelected} >选中服务实例</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
            <span style={{float:'right'}} >
              搜索:{' '}<Search
               placeholder="服务实例名"
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

export default ListActiveServerByConfigAppId;
