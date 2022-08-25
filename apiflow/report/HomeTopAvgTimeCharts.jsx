import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.ESB.CORE_ESB_REPORT.avgTimeCharts;

class HomeTopAvgTimeCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.height=this.props.height||'300px';
    this.applicationId=this.props.applicationId;
    this.state={
      day:7,
      mask:false,
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }


//运行中流程统计
  loadData=()=>{
   this.setState({mask:false});
   let url=dataUrl+"?applicationId="+this.applicationId;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({dataSource:data,mask:false});
           this.initChart(data.date,data.avgtime);
         }
     });
 }

 initChart=(date,avgtime)=>{
       let option = {
          tooltip : {
              trigger: 'axis',
              axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                  type : 'cross'        // 默认为直线，可选为：'line' | 'shadow'
              }
          },
          color:['#3398DB','#3398DB'],
          grid: {
            left: '1%',
            right: '1%',
            containLabel: false
          },
          xAxis : [
              {
                  type : 'category',
                  data : date,
                  show:false,
              }
          ],
          yAxis : [
              {
                  type : 'value',
                  show:false,
              }
          ],
          series : [
              {
                  name:'平均响应时间(毫秒)',
                  type: 'line',
                  data:avgtime,
                  smooth:true,
                  areaStyle: {}
              }
          ]
      };
    this.setState({option:option});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <ReactEcharts  option={this.state.option} style={{height:'60px'}}   className='react_for_echarts' />
      </Spin>
    );
  }
}

export default HomeTopAvgTimeCharts;
