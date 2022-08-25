import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.LIST_MONITOR.apmTreeLogByTraceId;

//根据traceId显示调用链信息

class ApmChartByTraceId extends React.Component{
  constructor(props){
    super(props);
    this.traceId=this.props.traceId;
    this.spanId=this.props.spanId;
    this.state={
      barWidth:40,
      mask:false,
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  //运行中流程统计
  loadData=(traceId,spanId)=>{
   this.setState({mask:false});
   let tmpTraceId=traceId||this.traceId;
   let tmpSpanId=spanId||this.spanId;
   if(tmpTraceId===''||tmpTraceId==undefined){return;}
   let url=dataUrl+"?traceId="+tmpTraceId+"&spanId="+tmpSpanId;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({dataSource:data,mask:false});
           this.initChart(data);
         }
     });
 }

 initChart=(data)=>{
      let option = {
        tooltip: {
          padding: 10,
          backgroundColor: '#222',
          borderColor: '#777',
          borderWidth: 1,
          formatter: function (obj) {
             let success=obj.data.success==='1'?'成功':'失败';
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                  + '服务实例名:'+obj.data.serviceName
                  + '</div>'
                  + 'API名称：' + obj.data.actionName + '<br>'
                  + 'API URI：' + obj.data.value + '<br>'
                  + 'spanId：' + obj.data.spanId + '<br>'
                  + '请求用户：' + obj.data.userId + '<br>'
                  + '请求时间：' + obj.data.actionTime + '<br>'
                  + '状态：' + success + '<br>'
                  + '总耗时：' + obj.data.totalTime + '(毫秒)<br>';
          }
       },
        series: [
                  {
                      type: 'tree',
                      data: [data],
                      top: '1%',
                      left: '15%',
                      bottom: '1%',
                      right: '25%',
                      symbolSize: 25,
                      label: {
                          normal: {
                            formatter: [
                               '{b}\n{c}'
                           ].join('\n'),
                              position: 'left',
                              verticalAlign: 'middle',
                              align: 'right',
                              fontSize: 9
                          }
                      },
                      leaves: {
                          label: {
                              normal: {
                                  position: 'right',
                                  verticalAlign: 'middle',
                                  align: 'left'
                              }
                          }
                      },
                      expandAndCollapse: true,
                      animationDuration: 550,
                      animationDurationUpdate: 750,
                      initialTreeDepth:6,
                  }
              ]
    };
    this.setState({option:option});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card title='APM调用链流程图'>
        <ReactEcharts  option={this.state.option}  style={{height: '350px',width:'900px'}} className='react_for_echarts' />
        </Card>
      </Spin>
    );
  }
}

export default ApmChartByTraceId;
