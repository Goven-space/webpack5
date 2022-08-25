import React from 'react';
import { Card,Row,Col,Icon,Spin} from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import ApiCallsChart from './charts/ApiCallsChart';
import ApiPerformanceChart from './charts/ApiPerformanceChart';

const statisUrl=URI.CORE_STATIS.serviceManagerStatis;
const textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};
const QPSURL=URI.CORE_GATEWAY_HEALTH.qps;

class RightHomePage extends React.Component{

  constructor(props){
    super(props);
    this.url=QPSURL+"?identitytoken="+AjaxUtils.getCookie("identitytoken");
    this.eventSource=new EventSource(this.url);
    this.state={
      mask:false,
      statis:{},
      realData:{qps:0,responseTime:0.0},
    }
  }

  componentDidMount(){
    this.loadStatis();
  }

  componentWillUnmount(){
    this.eventSource.close();
  }

  loadQps=()=>{
     //读取实时数据
     this.eventSource.onmessage=(event)=>{
       let json=event.data;
       // console.log(json);
       this.setState({realData:JSON.parse(json)});
     }

 }

  loadStatis=()=>{
    //载入统计数据
    this.setState({mask:true});
    AjaxUtils.get(statisUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({statis:data,mask:false});
          this.loadQps();
        }
    });
  }

	render(){
	  return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Row gutter={24} >
          <Col span={6}>
              <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#ED7E54',height:'100%',textAlign:'center'}}>
                      <Icon type="bell" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                      <span style={{fontSize:'22px'}}><b>{this.state.statis.exceptionCount}</b></span>
                      <div>今日服务异常(次)</div>
                  </div>
              </div>
          </Col>
          <Col span={6} >
            <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#6FBFE7',height:'100%',textAlign:'center'}}>
                        <Icon type="area-chart" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.realData.qps}</b></span>
                        <div>实时请求速率(TPS)</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
              <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#648AE0',height:'100%',textAlign:'center'}}>
                        <Icon type="clock-circle" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.realData.responseTime}</b></span>
                        <div>实时响应时间(ms)</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
            <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#6483BE',height:'100%',textAlign:'center'}}>
                        <Icon type="appstore" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.realData.totalAccessNum}</b></span>
                        <div>累计调用(次)</div>
                  </div>
              </div>
          </Col>
        </Row>
      <br/><br/>

        <Card title='API实时调用量监控'>
          <ApiCallsChart />
        </Card>
        <br/>
        <Card title='API平均响应时间监控'>
          <ApiPerformanceChart />
        </Card>

      <br/>
      </Spin>
		);
	 }
}

export default RightHomePage;
