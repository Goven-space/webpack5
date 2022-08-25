import * as echarts from 'echarts';
import React from 'react';
import {Spin,Row,Col} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
const dataUrl=URI.LIST_MONITOR.ramInfo;

//内存使用统计

class TotalRamChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:false,
      data:{}
    };
  }

  componentDidMount(){
    this.loadData();
    const self = this;
    this.intervalId=setInterval(function(){
        self.loadData();
    }, 60000);
  }

  //清除定时器
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }

  loadData=()=>{
   this.setState({mask:false});
    AjaxUtils.get(dataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
           this.initChart(data.date,data.data);
         }
     });
 }

 initChart=(date,data)=>{
       var chart = echarts.init(document.getElementById('ramtotal'));
       let option = option = {
         grid: {
             left: '5%',
             right: '5%',
             bottom: '12%',
             containLabel: false
         },
         tooltip: {
            trigger: 'axis'
         },
         color:'#000066',
          xAxis: {
              type: 'category',
              data: date,
          },
          yAxis: {
              type: 'value',
          },
          series: [{
              data: data,
              type: 'line',
              lineStyle:{normal:{color:'#009966'}},
              areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: '#fff'
                        }, {
                            offset: 1, color: '#00FF66'
                        }])
              }
          }]
      };
      chart.setOption(option);
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{height:0,fontSize:'12px',fontFamily:'微软雅黑',color:'#000',position:'relative',top:'20px',left:'20px',textAlign:'left'}}>内存使用量</div>
        <div style={{height:0,fontSize:'12px',fontFamily:'微软雅黑',color:'#000',position:'relative',top:'20px',right:'120px',textAlign:'right'}}>当前可用内存:{this.state.data.freePhysicalMemory}M</div>
        <div style={{height:0,fontSize:'12px',fontFamily:'微软雅黑',color:'#000',position:'relative',top:'20px',right:'20px',textAlign:'right'}}>总内存:{this.state.data.totalRam}M</div>
        <div id='ramtotal'  style={{ width: '100%', height: 230}} ></div>
      </Spin>
    );
  }
}

export default TotalRamChart;
