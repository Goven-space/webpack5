import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Button} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
import * as CDCURI from '../CDCURI';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
const dataUrl=CDCURI.HOME_CHARTS.byTime;
const SelectTopicUrl=CDCURI.TOPIC.select;

//数据传输

class CDCHomeCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.height=this.props.height||'300px';
    this.intervalId;
    this.state={
      mask:false,
      topic: "",
      option:{}
    };
  }

  componentDidMount(){
    this.loadData();
    this.intervalId=setInterval(this.loadData, 3000);
  }
  //清除定时器
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }

  //运行中流程统计
  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?topic="+this.state.topic;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data.date, data["dataConsumer"], data["dataProducer"]);
         }
     });
  }

  initChart=(date, dataConsumer, dataProducer)=>{
    let option  = {
      title: {
          text: '实时数据融合',
          subtext: '数据每秒进行更新',
          left: 'center'
      },
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              animation: false
          }
      },
      legend: {
          data: ['消费', '采集'],
          left: 10
      },
      toolbox: {
          feature: {
              dataZoom: {
                  yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
          }
      },
      axisPointer: {
          link: {xAxisIndex: 'all'}
      },
      dataZoom: [
          {
              show: true,
              realtime: true,
              start: 0,
              end: 100,
              xAxisIndex: [0, 1]
          },
          {
              type: 'inside',
              realtime: true,
              start: 0,
              end: 100,
              xAxisIndex: [0, 1]
          }
      ],
      grid: [{
          left: 50,
          right: 50,
          height: '35%'
      }, {
          left: 50,
          right: 50,
          top: '55%',
          height: '35%'
      }],
      xAxis: [
          {
              type: 'category',
              boundaryGap: false,
              axisLine: {onZero: true},
              data: date
          },
          {
              gridIndex: 1,
              type: 'category',
              boundaryGap: false,
              axisLine: {onZero: true},
              data: date,
              position: 'top'
          }
      ],
      yAxis: [
          {
              name: '消费数量(条)',
              type: 'value'
          },
          {
              gridIndex: 1,
              name: '采集数量(条)',
              type: 'value',
              inverse: true
          }
      ],
      series: [
          {
              name: '消费数量',
              type: 'line',
              symbolSize: 8,
              hoverAnimation: false,
              data: dataConsumer
          },
          {
              name: '采集数量',
              type: 'line',
              xAxisIndex: 1,
              yAxisIndex: 1,
              symbolSize: 8,
              hoverAnimation: false,
              data: dataProducer
          }
      ]
    };
    this.setState({option:option});
  }

  handleSizeChange = (e) => {
    this.state.minute=e.target.value;
    this.loadData();
  }

  onTopicChange=(value)=>{
    this.state.topic=value;
    this.loadData();
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <center>
        主题: <AjaxSelect value={this.state.topic} url={SelectTopicUrl} onChange={this.onTopicChange} styleOption={{minWidth:'200px',marginRight:'15px',marginLeft:'5px'}} />
          {' '}<Button onClick={this.loadData} icon="reload" >刷新</Button>{' '}
        </center>
        
        <ReactEcharts option={this.state.option} style={{height:'520px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default CDCHomeCharts;
