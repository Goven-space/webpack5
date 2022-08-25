import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Button} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.ETL.REPORT.datatransmissionByProcessId;

//数据传输趋势-按单个流程id

class DataTransmissionByProcessIdCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.height=this.props.height||'300px';
    this.state={
      mask:false,
      day:7,
      option:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }


//运行中流程统计
  loadData=()=>{
   this.setState({mask:false});
   let url=dataUrl+"?day="+this.state.day+"&processId="+this.processId;
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
       tooltip: {
          trigger: 'axis'
       },
       color:['#8884d8','#82ca9d'],
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
            label: {normal: {position:'top',show: true}},
            barWidth :40,
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
    this.state.day=e.target.value;
    this.loadData();
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <center>
          <Radio.Group value={this.state.day} onChange={this.handleSizeChange} >
            <Radio.Button value={7}>7天</Radio.Button>
            <Radio.Button value={10}>10天</Radio.Button>
            <Radio.Button value={15}>15天</Radio.Button>
            <Radio.Button value={20}>20天</Radio.Button>
            <Radio.Button value={30}>30天</Radio.Button>
          </Radio.Group>
          {' '}<Button  onClick={this.loadData} icon="reload"   >刷新</Button>{' '}
        </center>
        <div style={{height:0,fontSize:'14px',fontFamily:'微软雅黑',color:'#000'}}>数据传输趋势</div>
        <ReactEcharts  option={this.state.option} style={{height:'460px'}}   className='react_for_echarts' />
      </Spin>
    );
  }
}

export default DataTransmissionByProcessIdCharts;
