import * as echarts from 'echarts';
import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {Spin,Row,Col,Radio,DatePicker,Card,Button,Modal,Input,Icon} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
import moment from 'moment';
import ListUserCallStatisTopDetails from '../log/ListUserCallStatisTopDetails';
import AjaxSelect from '../../core/components/AjaxSelect';

const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;
const dataUrl=URI.LIST_MONITOR.allUserCallStatisTopUrl;
const dateFormat = 'YYYY-MM-DD';

class UserCallStatisTopChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.userId='';
    this.statisType=0; //1表示单个用户,0表示所有用户
    this.state={
      day:7,
      barWidth:40,
      mask:true,
      visible:false,
      option:{},
      logDbName:'',
    };
  }

  componentDidMount(){
    this.loadData();
  }


//运行中流程统计
  loadData=()=>{
   this.setState({mask:true});
   let userId='';
   if(this.statisType===1){
     userId=this.userId;
   }
   let url=dataUrl+"?logDbName="+this.state.logDbName+"&userId="+userId+"&topnum=100&startDate="+this.startDate+"&endDate="+this.endDate;
    AjaxUtils.get(url,(data)=>{
         this.setState({mask:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
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

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  logDbChange=(dbName)=>{
    this.setState({logDbName:dbName});
  }

 initChart=(data)=>{
       let appArray=[];
       let totalArray=[];
       let avgArray=[];
       for(let i=0;i<data.length;i++){
         if(data[i].accessDate!==undefined){
           //统计单个用户
           this.statisType=1;
           appArray[i]=data[i].accessDate;
         }else{
           //统计所有用户
           this.statisType=0;
           appArray[i]=data[i].userId;
         }
         totalArray[i]=data[i].total;
         avgArray[i]=data[i].avg;
       }
       let option = {
          tooltip : {
              trigger: 'axis',
              axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                  type : 'cross'        // 默认为直线，可选为：'line' | 'shadow'
              }
          },
          title: {
              left: 'center',
              text: '用户调用Top100统计(点击图形可以查看明细)',
          },
          color:['#8884d8','#82ca9d'],
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis : [
              {

                  type : 'value',
                  axisLabel: {textStyle: {color: '#000'}}
              }
          ],
          yAxis : [
              {
                data : appArray,
                  type : 'category',
                  axisLabel: {textStyle: {color: '#000'}}
              }
          ],
          series : [
              {
                  name:'总调用次数',
                  type:'bar',
                  label: {normal: {position:'right',show: true}},
                  data:totalArray
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

 clickEcharts=(e)=>{
   let userId=e.name;
   if(this.statisType===0){
     //统计所有用户的情况下，读取用户点击的用户id
    this.userId=userId;
  }
   this.setState({visible: true,});
 }

 userIdChange=(e)=>{
   this.userId=e.target.value;
   if(this.userId!==''){
     this.statisType=1;
   }else{
     this.statisType=0;
   }
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Modal key={Math.random()} title="用户调用API明细" maskClosable={false}
                  visible={this.state.visible}
                  width='1050px'
                  footer=''
                  style={{top:20}}
                  onOk={this.handleCancel}
                  onCancel={this.handleCancel} >
                  <ListUserCallStatisTopDetails userId={this.userId} startDate={this.startDate} endDate={this.endDate} close={this.closeModal}  />
        </Modal>
        <Card style={{marginBottom:5}} title='用户调用量Top统计' >
           日志库:<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />{' '}
           用户Id(空表示所有用户)：<Input onChange={this.userIdChange} placeholder='请输入用户id' style={{width:'150px'}} prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} />{' '}
           开始日期:<DatePicker  onChange={this.onStartDateChange} defaultValue={moment(this.startDate, dateFormat)}  format="YYYY-MM-DD" placeholder="请选择时间" />{' '}
           结束日期:<DatePicker  onChange={this.onEndDateChange}  defaultValue={moment(this.endDate, dateFormat)} format="YYYY-MM-DD" placeholder="请选择时间" />{' '}
           <Button  type="primary" onClick={this.loadData} icon="bar-chart" >开始统计</Button>{' '}
           <p></p>
           <ReactEcharts onEvents={{'click': this.clickEcharts}} option={this.state.option}  style={{minHeight: '650px'}} className='react_for_echarts' />
         </Card>
      </Spin>
    );
  }
}

export default UserCallStatisTopChart;
