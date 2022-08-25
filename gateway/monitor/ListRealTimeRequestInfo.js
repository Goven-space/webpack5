import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const requestinfoUrl=URI.CORE_GATEWAY_HEALTH.requestinfo;

class ListRealTimeRequestInfo extends React.Component {
  constructor(props) {
    super(props);
    this.url=requestinfoUrl+"?identitytoken="+AjaxUtils.getCookie("identitytoken");
    this.appId="gateway";
    this.eventSource=new EventSource(this.url);
    this.state={
      pagination:{pageSize:150,current:1,showSizeChanger:false,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
      title: '用户',
      dataIndex: 'userId',
      width: '10%'
    },{
        title: '请求URL',
        dataIndex: 'requestUrl',
        width: '35%',
      },{
        title: 'IP地址',
        dataIndex: 'ip',
        width:'10%'
      },{
        title: '状态码',
        dataIndex: 'responseCode',
        width:'10%',
        render: (text,record) =>{
          if(text!==200){return <Tag color='red'>{text}</Tag>;}
          else{return <Tag color='green'>{text}</Tag>;}
        }
      },{
        title: '响应时间',
        dataIndex: 'responseTime',
        width:'10%',
        render: (text,record) =>{return text+"毫秒";}
      },{
        title: '请求时间',
        dataIndex: 'requestTime',
        width:'15%',
      },{
        title: '状态',
        dataIndex: 'new',
        width:'10%',
        render: (text,record) =>{
          if(text){return <Tag color='red'>实时</Tag>;}
          else{return <Tag>历史</Tag>;}
        }
      }];


    return (
      <Card style={{minHeight:'600px'}} title='API实时请求流量监控' >
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
        />
      </Card>
    );
  }
}

export default ListRealTimeRequestInfo;
