import React from 'react';
import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card,DatePicker,Spin} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.allServicePerformanceChart;

class AllServicePerformanceChart extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.state={
      option:{},
      loading: false,
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({loading:true});
    AjaxUtils.get(LIST_URL,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data);
         }
     });
  }

  initChart=(data)=>{
      let option = {
        title: {
            text: '服务实例平均性能分布图',
            left: 'center'
        },
        tooltip: {
          padding: 10,
          backgroundColor: '#222',
          borderColor: '#777',
          borderWidth: 1,
          formatter: function (obj) {
              let total = obj.data[0];
              let avg=obj.data[1];
              let name=obj.data[2];
              let ip=obj.data[6];
              let weight=obj.data[3];
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                  + '服务实例名称:'+name
                  + '</div>'
                  + 'IP及端口：' + ip + '<br>'
                  + '权重：' + weight + '<br>'
                  + '上线时间：' + obj.data[4] + '<br>'
                  + '总调用次数：' + total + '<br>'
                  + '平均响应时间：' + avg + '(毫秒)<br>';
          }
       },
        xAxis: {
            name: '调用次数',
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            name: '平均耗时(毫秒)',
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
            scale: false
        },
        series: [{
            data: data,
            type: 'scatter',
            symbolSize:function (data) {
              let size=data[1]/10;
              if(size<30){size=30;}
              if(size>100){size=100;}
              return size;
            },
            itemStyle: {
                normal: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(25, 100, 150, 0.5)',
                    shadowOffsetY: 5,
                    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                        offset: 0,
                        color: 'rgb(129, 227, 238)'
                    }, {
                        offset: 1,
                        color: 'rgb(25, 183, 207)'
                    }])
                }
            }
        }]
    };
    this.setState({option:option});
  }

  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
       <ReactEcharts  option={this.state.option}  style={{height: '650px'}} className='react_for_echarts' />
      </Spin>
    );
  }

}

export default AllServicePerformanceChart;
