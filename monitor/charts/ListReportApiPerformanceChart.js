import React from 'react';
import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card,DatePicker,Spin} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AppSelect from '../../core/components/AppSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import moment from 'moment';

//API平均性能分布图

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.allApiPerformanceChart;
const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;

class ListReportApiPerformanceChart extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      option:{},
      appId:this.appId,
      mask: false,
      logDbName:'',
    }
  }

  componentDidMount(){

  }


   getNowFormatDate=(prvNum)=>{
           let date = new Date();
           var seperator1 = "-";
           var year = date.getFullYear();
           var month = date.getMonth() + 1;
           var strDate = date.getDate()+1;
           if (month >= 1 && month <= 9) {
               month = "0" + month;
           }
           if (strDate >= 0 && strDate <= 9) {
               strDate = "0" + strDate;
           }
           let currentdate = year + seperator1 + month + seperator1 + strDate;
           return currentdate;
    }

    getLastSevenDays=(date)=>{
            var date = date || new Date(),
            timestamp,
            newDate;
             if(!(date instanceof Date)){
                 date = new Date(date.replace(/-/g, '/'));
             }
             timestamp = date.getTime();
             newDate = new Date(timestamp - 1 * 24 * 3600 * 1000);
             var month = newDate.getMonth() + 1;
             month = month.toString().length == 1 ? '0' + month : month;
             var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
             return [newDate.getFullYear(), month, day].join('-');
    }

  loadData=()=>{
    this.setState({mask:true});
    let url=LIST_URL+"?logDbName="+this.state.logDbName+"&appId="+this.state.appId+"&startTime="+this.startDate+"&endTime="+this.endDate;
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
        title: {
            text: 'API平均响应性能分布图',
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
              let url=obj.data[3];
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                  + 'API名称:'+name
                  + '</div>'
                  + 'API URI：' + url + '<br>'
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
              if(size<10){size=10;}
              if(size>60){size=60;}
              return size;
            },
            itemStyle: {
                normal: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(120, 36, 50, 0.5)',
                    shadowOffsetY: 5,
                    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                        offset: 0,
                        color: 'rgb(251, 118, 123)'
                    }, {
                        offset: 1,
                        color: 'rgb(204, 46, 72)'
                    }])
                }
            }
        }]
    };
    this.setState({option:option});
  }

 handleChange=(e)=>{
   this.setState({appId:e.target.value});
 }

 onStartDateChange=(date, dateString)=>{
   this.startDate=dateString;
 }

 onEndDateChange=(date, dateString)=>{
   this.endDate=dateString;
 }

 logDbChange=(dbName)=>{
   this.setState({logDbName:dbName});
 }

  render(){

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
             日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
             应用Id:<Input onChange={this.handleChange} placeholder='请输入应用appId' style={{width:'200px'}} />
             {' '}
             开始时间:<DatePicker  onChange={this.onStartDateChange} defaultValue={moment(this.startDate, dateFormat)}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           结束时间:<DatePicker  onChange={this.onEndDateChange} defaultValue={moment(this.endDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始统计</Button>{' '}
       </Card>

       <ReactEcharts  option={this.state.option}  style={{height: '650px'}} className='react_for_echarts' />

      </Spin>
    );
  }

}

export default ListReportApiPerformanceChart;
