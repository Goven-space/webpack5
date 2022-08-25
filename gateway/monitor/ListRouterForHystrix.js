import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_HYXSTRIX.hyxListRouter;
const REST_URL=URI.CORE_GATEWAY_HYXSTRIX.hyxReset;


class ListRouterForHystrix extends React.Component {
  constructor(props) {
    super(props);
    this.url=host+"/hystrix.stream";
    this.appId="gateway";
    // this.eventurl=this.url+"?identitytoken="+AjaxUtils.getCookie("identitytoken");
    this.eventSource=new EventSource(this.url);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: false,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillUnmount(){
    this.eventSource.close();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  hyxReset=()=>{
     this.setState({loading: true,});
     AjaxUtils.get(REST_URL,(data)=>{
          this.setState({loading: false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("成功重启hystrix");
            this.loadData();
          }
	    });
  }


   loadData=()=>{
     let i=0;
     this.eventSource.onmessage=(event)=>{
       let json=event.data;
       this.addToGridData(JSON.parse(json));
     }
   }

   addToGridData=(data)=>{
     let exist=false;
     let gridData=this.state.rowsData;
     for(let i=0;i<gridData.length;i++){
       if(gridData[i].name===data.name){
         gridData[i]=data;
         exist=true;
         break;
       }
     }
     if(exist===false){
       gridData.push(data);
     }
     this.setState({rowsData:gridData});
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '是否熔断中',
      dataIndex: 'isCircuitBreakerOpen',
      width: '10%',
        render: (text,record)=>{if(text){return <Tag color='#f50'>是</Tag>;}else{return <Tag color='green'>否</Tag>};}
    },{
        title: '名称',
        dataIndex: 'name',
        width: '25%',
        sorter: true,
      },{
        title: '路由名或API',
        dataIndex: 'threadPool',
        width: '25%',
        sorter: true
      },{
        title: '错误百分比',
        dataIndex: 'errorPercentage',
        width:'10%'
      },{
        title: '错误数',
        dataIndex: 'errorCount',
        width:'10%'
      },{
        title: '请求数',
        dataIndex: 'requestCount',
        width:'10%'
      },{
        title: '当前时间',
        dataIndex: 'currentTime',
        width:'10%',
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} bodyStyle={{padding:8}}>
            <Input.TextArea autosize value={AjaxUtils.formatJson(JSON.stringify(record))} />
          </Card>
          );
      }

    return (
      <Card style={{minHeight:'600px'}} title='Hystrix监控' >
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"重启Hystrix","重新启动Hystrix会全部清空hystrix当前已统计到的数据并立即中断正在排队线程的执行",this.hyxReset)} icon="poweroff" >重启Hystrix</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          expandedRowRender={expandedRow}
          pagination={pagination}
        />
    </Card>
    );
  }
}

export default ListRouterForHystrix;
