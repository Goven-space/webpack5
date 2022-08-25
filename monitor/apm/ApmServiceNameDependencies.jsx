import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const dataUrl=URI.LIST_MONITOR.apmServiceNameDependencies;
const Option = Select.Option;

//客户端调用类型分组统计

class ApmServiceNameDependencies extends React.Component{
  constructor(props){
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays(),
    this.endDate=this.getNowFormatDate(),
    this.state={
      mask:false,
      option:{},
      serverId:'',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?startDate="+this.startDate+"&endDate="+this.endDate+"&serviceName="+this.state.serverId;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data);
         }
     });
 }

 getNowFormatDate=(prvNum)=>{
         let date = new Date();
         var seperator1 = "-";
         var year = date.getFullYear();
         var month = date.getMonth() + 1;
         var strDate = date.getDate();
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
           newDate = new Date(timestamp - 2 * 24 * 3600 * 1000);
           var month = newDate.getMonth() + 1;
           month = month.toString().length == 1 ? '0' + month : month;
           var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
           return [newDate.getFullYear(), month, day].join('-');
  }

  initChart=(data)=>{
       let option = {
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           show:true,
           formatter: function (obj) {
               // console.log(obj.data);
               let total = obj.data.total||'0';
               let avg=obj.data.avg||'0';
               let name=obj.data.name||'';
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '服务实例名:'+name
                   + '</div>'
                   + '总调用次数：' + total + '<br>'
                   + '平均响应时间：' + avg + '(毫秒)<br>';
           }
        },
        legend: [{
            data: data.categories
        }],
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
            {
                name: '服务实例',
                type: 'graph',
                layout: 'circular',
                circular: {
                    rotateLabel: true
                },
                top: '20%',
                bottom: '20%',
                data: data.nodes,
                edges: data.links,
                edgeSymbol: ['circle', 'arrow'],
                categories: data.categories,
                roam: true,
                label: {
                    normal: {
                        position: 'right'
                    }
                },
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0.3
                    }
                }
            }
        ]
    };
     this.setState({option:option});
  }

 onStartDateChange=(date, dateString)=>{
   this.startDate=dateString;
 }

 onEndDateChange=(date, dateString)=>{
   this.endDate=dateString;
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
             开始日期:<DatePicker defaultValue={moment(this.startDate, dateFormat)} format={dateFormat}  onChange={this.onStartDateChange} />{' '}
             结束日期:<DatePicker defaultValue={moment(this.endDate, dateFormat)} format={dateFormat}  onChange={this.onEndDateChange} />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始统计</Button>{' '}
       </Card>
        <ReactEcharts  option={this.state.option}  style={{height: '850px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default ApmServiceNameDependencies;
