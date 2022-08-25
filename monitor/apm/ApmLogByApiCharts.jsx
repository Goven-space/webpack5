import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const dataUrl=URI.LIST_MONITOR.apmTreeLogByApiId;
const Option = Select.Option;

//根据API的唯一id,显示一个API的依赖关系图

class ApmLogByApiCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId='';
    this.id=this.props.id;
    this.state={
      mask:false,
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?id="+this.id;
    AjaxUtils.get(url,(data)=>{
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
             text: '',
             left: 'center'
         },
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           formatter: function (obj) {
               let total = obj.data.total||'0';
               let avg=obj.data.avg||'0';
               let name=obj.data.actionName;
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '服务名称:'+name
                   + '</div>'
                   + 'URL：' + obj.data.actionMapUrl + '<br>'
                   + '总调用次数：' + total + '<br>'
                   + '平均响应时间：' + avg + '(毫秒)<br>';
           }
        },
         series: [
                   {
                       type: 'tree',
                       data: [data],
                       top: '1%',
                       left: '15%',
                       bottom: '1%',
                       right: '25%',
                       symbolSize: 10,
                       label: {
                           normal: {
                             formatter: [
                                '{b}{c}'
                            ].join('\n'),
                               position: 'left',
                               verticalAlign: 'middle',
                               align: 'right',
                               fontSize: 12
                           }
                       },
                       leaves: {
                           label: {
                               normal: {
                                   position: 'right',
                                   verticalAlign: 'middle',
                                   align: 'left'
                               }
                           }
                       },
                       expandAndCollapse: true,
                       animationDuration: 550,
                       animationDurationUpdate: 750,
                       initialTreeDepth:6,
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

 handleChange=(e)=>{
   this.userName=e.target.value;
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <ReactEcharts  option={this.state.option}  style={{height: '750px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default ApmLogByApiCharts;
