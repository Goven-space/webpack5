import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Button} from 'antd';

//内存使用率趋势

class grid extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.state={
      mask:false,
      minute:60,
      option:{},
    };
  }

  componentDidMount(){
    let memoryUsageArray=this.record.memoryUsage.split(",");
    let memoryUsageDateTime=this.record.memoryUsageDateTime.split(",");
    this.initChart(memoryUsageArray,memoryUsageDateTime);
  }

 initChart=(data,date,total)=>{
     let option  = {
       grid: {
           left: '5%',
           right: '5%',
           bottom: '12%',
           containLabel: false
       },
       tooltip: {
          trigger: 'axis'
       },
        xAxis: {
            type: 'category',
            data: date,
        },
        yAxis: {
            type: 'value',
        },
        series: [{
            name:'内存使用率',
            data: data,
            type: 'line',
            lineStyle:{normal:{color:'#FFCC33'}},
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                      offset: 0, color: '#FF0066'
                  }, {
                      offset: 0.5, color: '#FFCC33'
                  }, {
                      offset: 1, color: '#F4f4f4'
                  }])
            }
        }]
    };
    this.setState({option:option});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{height:0,fontSize:'14px',fontFamily:'微软雅黑',color:'#000'}}>内存使用趋势</div>
        <ReactEcharts  option={this.state.option} style={{height:'460px'}}   className='react_for_echarts' />
      </Spin>
    );
  }
}

export default grid;
