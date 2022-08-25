import * as echarts from 'echarts';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const dataUrl=URI.LIST_MONITOR.clientTypeGroupUrl;
const Option = Select.Option;

//客户端调用类型分组统计

class ClientTypeGroup extends React.Component{
  constructor(props){
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays(),
    this.endDate=this.getNowFormatDate(),
    this.state={
      mask:false,
      groupKey:'deviceName',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?startDate="+this.startDate+"&endDate="+this.endDate+"&groupKey="+this.state.groupKey;
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
       var chart = echarts.init(document.getElementById('ApiClientGroupCharts'),'light');
       let option = {
            title: {
                text: 'API调用统计',
                left: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            series : [
                {
                    type: 'pie',
                    center: ['50%', '50%'],
                    selectedMode: 'single',
                    data:data
                }
            ]
      };
      chart.setOption(option);
 }

 handleChange=(value)=>{
   this.setState({appId:value});
 }

 onStartDateChange=(date, dateString)=>{
   this.startDate=dateString;
 }

 onEndDateChange=(date, dateString)=>{
   this.endDate=dateString;
 }

 typeHandleChange=(value)=>{
   this.setState({groupKey:value});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
            统计指标:<Select value={this.state.groupKey} onChange={this.typeHandleChange} style={{width:150}}>
              <Option value='deviceName'>用户设备类型</Option>
              <Option value='osName'>用户操作系统类型</Option>
              <Option value='browserName'>用户浏览器类型</Option>
              <Option value='systemName'>调用的业务系统</Option>
              <Option value='deptCode'>调用的部门名称</Option>
              <Option value='appId'>被调用的应用Id</Option>
            </Select>
             应用(空表示所有):<AppSelect value={this.state.appId} onChange={this.handleChange} ></AppSelect>
             {' '}
             开始日期:<DatePicker defaultValue={moment(this.startDate, dateFormat)} format={dateFormat}  onChange={this.onStartDateChange} />{' '}
           结束日期:<DatePicker defaultValue={moment(this.endDate, dateFormat)} format={dateFormat}  onChange={this.onEndDateChange} />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始统计</Button>{' '}
       </Card>
        <div id='ApiClientGroupCharts'  style={{ width: '100%', height: 400}} ></div>
      </Spin>
    );
  }
}

export default ClientTypeGroup;
