import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,Row,Col,DatePicker} from 'antd';
import  {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const hour_avgresponse_time=URI.LIST_REGSERVER_REPORT.hour_avgresponse_time;

const cols = {
    'value': { min: 0 },
    'text': {range: [ 0 , 1] }
};

//服务器今日平均性能统计

class ServerAvgResponseTime extends React.Component{
  constructor(props){
    super(props);
    this.ip=this.props.ip;
    this.port=this.props.port;
    this.state={
      mask:true,
      dayNum:'',
      data:[{ "text" : "15:42", "value" : "0.039" },{ "text" : "16:00", "value" : "0.038" },{ "text" : "16:30", "value" : 0.031 },{ "text" : "17:00", "value" : 0.040 },{ "text" : "17:30", "value" : "0.093" },{ "text" : "21:20", "value" : "0.049" },{ "text" : "21:30", "value" : "0.046" },{ "text" : "22:00", "value" : "0.036" },{ "text" : "22:30", "value" : "0.034" },{ "text" : "23:00", "value" : "0.032" },{ "text" : "23:30", "value" : "0.029" },{ "text" : "23:46", "value" : "0.030" }]
    };
  }

  componentDidMount(){
    this.loadData("");
  }

  loadData=(dayNum)=>{
   this.setState({mask:false});
   let url=hour_avgresponse_time+"?daynum="+dayNum+"&ip="+this.ip+"&port="+this.port;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });
 }

 onChange=(date, dateString)=>{
   // console.log("dateString="+dateString);
   // this.setState({dayNum:dateString});
   this.loadData(dateString);
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        统计日期:<DatePicker onChange={this.onChange} /> (单位秒)
      <LineChart width={900} height={500} data={this.state.data}  margin={{top: 10, right: 2, left: 2, bottom: 5}}>
               <XAxis dataKey="text"/>
               <YAxis/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{r: 8}}/>
        </LineChart>
      </Spin>
    );
  }
}

export default ServerAvgResponseTime;
