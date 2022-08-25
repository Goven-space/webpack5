import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,Select,Tabs,Spin,Modal} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
import ReactJson from 'react-json-view'
import ListServiceApmLog from './ListServiceApmLog';
import ApmChartByTraceId from '../apm/ApmChartByTraceId';

//显示API的详细log日志

const TabPane = Tabs.TabPane;
const detailsUrl=URI.LIST_MONITOR_APIQPS.getById;
const logRepeatUrl=URI.LIST_MONITOR_APIQPS.logRepeat;
const isHiddenRepeatUrl=URI.LIST_MONITOR_APIQPS.isHiddenRepeat;

const { confirm } = Modal;

class ShowLogDetails extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.logDbName=this.props.logDbName||'';
    this.state={
      data:this.record,
      mast:true,
      hidden:true,
    };
  }

  componentDidMount(){
    this.loadData();
    this.loadRepeatHiddenConfig();
  }

  //通过ajax远程载入数据
  loadData=(pagination)=>{
    this.setState({loading:true});
    let url=detailsUrl+"?id="+this.record.id+"&logDbName="+this.logDbName;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false,mask:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        this.setState({data:data});
      }
    });
  }

  //点击重发按钮展示model
  showRepeatModel=()=>{
    var self=this;
    confirm({
      title: '重发提示',
      content: '是否确认手动重发记录,此操作可能导致业务数据错误,请确认！',
      okText:"确认",
      cancelText:"取消",
      onOk() {
        self.handleRepeat();
      }
    });
  }

  //日志重发
  handleRepeat=()=>{
    let postData={};
    postData.actionMapUrl=this.state.data.actionMapUrl;//请求路径
    postData.methodType=this.state.data.methodType;//请求方法
    postData.inHeaderStr=this.state.data.inHeaderStr;//请求头
    postData.inParams=this.state.data.inParams;//请求参数
    if(this.state.data.inRequestBody !== undefined){
      postData.inRequestBody=this.state.data.inRequestBody;//请求体
    }
    AjaxUtils.post(logRepeatUrl,postData,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    });
  }

  //是否展示重发按钮(默认是隐藏|true)
  loadRepeatHiddenConfig=()=>{
    AjaxUtils.get(isHiddenRepeatUrl,(data)=>{
      if(data.state===true){
        this.setState({hidden:data.hidden});
      }
    });
  }

  render() {
    let record=this.state.data;
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card>
          <Tabs defaultActiveKey="RequestInfo" size='large' >
              <TabPane tab="全部数据" key="RequestInfo" animated={false}>
              <p><span style={{wordBreak:'break-all'}}><b>请求URL:</b>{record.requestUrl}</span> {record.inParams!==undefined  && !this.state.hidden ? <span style={{float:'right'}}> <Button onClick={this.showRepeatModel} icon="redo" size="small">重发</Button> </span> : ''}  </p>
              <ReactJson src={record}/>
              </TabPane>
              <TabPane tab="请求数据" key="RequestData" animated={false}>
                <Card title='请求API'><Tag>{record.methodType}</Tag> {record.backendUrl!==undefined?record.backendUrl:record.requestUrl}</Card>
                <Card title='请求Header'>{record.inHeaderStr}</Card>
                <Card title='传入参数'>{record.inParams}</Card>
                <Card title="请求Body">{record.inRequestBody}</Card>
              </TabPane>
              <TabPane tab="响应数据" key="ResponseData" animated={false}>
                <Card title='状码码'>{record.responseCode}</Card>
                <Card title='返回Header'>{record.responseHeaderStr}</Card>
                <Card title="返回Body">{record.responseBody}</Card>
              </TabPane>
          <TabPane tab="APM调用链" key="apm" animated={false}>
                <ListServiceApmLog traceId={record.traceId} spanId={record.spanId} />
          </TabPane>
          <TabPane tab="APM调用流程图" key="apmflow" animated={false}>
                <ApmChartByTraceId traceId={record.traceId} spanId={record.spanId} />
          </TabPane>
        </Tabs>
        </Card>
      </Spin>
    );
  }
}

export default ShowLogDetails;
