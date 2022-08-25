import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,DatePicker,Button} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import moment from 'moment';

const dataUrl=URI.LIST_MONITOR_APIQPS.apiAvgResponseTime;
const dateFormat = 'YYYY-MM-DD';

//api每5,15,30分钟平均响应时间

class ApiAvgResponseTime extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id; //api的唯一id
    this.startDate="";
    this.state={
      mask:false,
      minute:60,
      data:{},
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
    // const self = this;
    // this.intervalId=setInterval(function(){
    //     self.loadData();
    // }, 20000);
  }

  // //清除定时器
  // componentWillUnmount(){
  //   window.clearInterval(this.intervalId);
  // }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }


  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?id="+this.id+"&startDate="+this.startDate+"&minute="+this.state.minute;
    AjaxUtils.get(url,(data)=>{
         this.setState({mask:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data});
           this.initChart(data.date,data.data);
         }
     });
 }

 initChart=(date,data)=>{
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
              name:'平均响应时间',
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

 handleSizeChange = (e) => {
    this.state.minute=e.target.value;
    this.loadData();
  }

  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Radio.Group value={this.state.minute} onChange={this.handleSizeChange} >
            <Radio.Button value={60}>1小时</Radio.Button>
            <Radio.Button value={6*60}>6小时</Radio.Button>
            <Radio.Button value={12*60}>12小时</Radio.Button>
          </Radio.Group>
          {' '}<Button  type="primary" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
        <div style={{height:0,fontSize:'12px',fontFamily:'微软雅黑',color:'#000',position:'relative',top:'20px',left:'30px',textAlign:'left'}}>每分钟平均响应时间</div>
        <ReactEcharts  option={this.state.option}  style={{height: 400}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default ApiAvgResponseTime;
