import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ApmChartByTraceId from './ApmChartByTraceId';

//根据输入的traceId和spanId统计

class ApmLogByTraceIdReport extends React.Component{
  constructor(props){
    super(props);
    this.traceId='';
    this.state={
      spanId:'0',
      mask:false,
    };
  }

  componentDidMount(){

  }

loadData=()=>{
  this.refs.ApmChart.loadData(this.traceId,this.state.spanId);
}

 spanIdChange=(e)=>{
   this.setState({spanId:e.target.value});
 }

 traceIdChange=(e)=>{
   this.traceId=e.target.value;
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
             traceId：<Input onChange={this.traceIdChange} placeholder='请输入traceId' style={{width:'250px'}}   />{' '}
             spanId:<Input value={this.state.spanId} onChange={this.spanIdChange} style={{width:'150px'}}  />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始跟踪</Button>{' '}
       </Card>
        <ApmChartByTraceId  ref="ApmChart" />
      </Spin>
    );
  }
}

export default ApmLogByTraceIdReport;
