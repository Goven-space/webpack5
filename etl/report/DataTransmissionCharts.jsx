import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Button} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.ETL.REPORT.datatransmissionUrl;

//数据传输趋势

class DataTransmissionCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.height=this.props.height||'300px';
    this.state={
      mask:false,
      minute:60,
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }


//运行中流程统计
  loadData=()=>{
   this.setState({mask:false});
   let url=dataUrl+"?minute="+this.state.minute;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data.data,data.date,data.total);
         }
     });
 }

 initChart=(data,date,total)=>{
     let option  = {
       grid: {
           left: '5%',
           right: '5%',
           bottom: '12%',
           containLabel: false
       },
       color:['#8884d8','#82ca9d'],
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
            name:'数据量',
            data: data,
            type: 'bar',
            barWidth :40,
            label: {normal: {position:'top',show: true}},
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

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <center>
          <Radio.Group value={this.state.minute} onChange={this.handleSizeChange} >
            <Radio.Button value={60}>1小时</Radio.Button>
            <Radio.Button value={6*60}>6小时</Radio.Button>
            <Radio.Button value={12*60}>12小时</Radio.Button>
            <Radio.Button value={24*60}>24小时</Radio.Button>
            <Radio.Button value={48*60}>48小时</Radio.Button>
          </Radio.Group>
          {' '}<Button  onClick={this.loadData} icon="reload"   >刷新</Button>{' '}
        </center>
        <div style={{height:0,fontSize:'14px',fontFamily:'微软雅黑',color:'#000'}}>数据传输趋势</div>
        <ReactEcharts  option={this.state.option} style={{height:'460px'}}   className='react_for_echarts' />
      </Spin>
    );
  }
}

export default DataTransmissionCharts;
