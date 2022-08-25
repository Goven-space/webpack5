import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ApiQpsAndLogMonitor from '../../monitor/charts/ApiQpsAndLogMonitor';

const Search = Input.Search;
const confirm = Modal.confirm;
const requestinfoUrl=URI.CORE_GATEWAY_HEALTH.realtimelinks;

class ListRealTimeLinks extends React.Component {
  constructor(props) {
    super(props);
    this.url=requestinfoUrl+"?identitytoken="+AjaxUtils.getCookie("identitytoken");
    this.appId="gateway";
    this.eventSource=new EventSource(this.url);
    this.state={
      pagination:{pageSize:250,current:1,showSizeChanger:false,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: false,
      visible:false,
    }
  }

  componentDidMount(){
    this.eventSource.onmessage=(event)=>{
      let json=event.data;
      let rows=JSON.parse(json);
      this.setState({rowsData:rows});
    }
  }

  componentWillUnmount(){
    this.eventSource.close();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width: '8%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }else {
                return <Tag color="blue" style={{width:50}} >{text}</Tag>;
            }
          },
      },{
        title: 'API URL',
        dataIndex: 'mapUrl',
        width: '25%',
      },{
        title: 'API名称',
        dataIndex: 'configName',
        width:'20%'
      },{
          title: '所属应用',
          dataIndex: 'appId',
          width: '10%',
      },{
        title: '当前链接数',
        dataIndex: 'currentLinkingNum',
        width:'10%',
        render: (text,record) =>{
          if(text==0){return '0';}else{
            return <Tag color='volcano'>{text}</Tag>;
          }
        }
      },{
        title: '平均响应时间',
        dataIndex: 'averageResTime',
        width:'10%',
        render: (text,record) =>{return text+"毫秒";}
      },{
        title: '总调用次数',
        dataIndex: 'totalAccessNum',
        width:'10%',
      }];

      const expandedRow=function(record){
        return (
            <ApiQpsAndLogMonitor id={record.id} />
          );
      }

    return (
      <Card style={{minHeight:'600px'}} title='API实时链接数Top200排行' >
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </Card>
    );
  }
}

export default ListRealTimeLinks;
