import React from 'react';
import { Card,Row,Col,Icon,Spin} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ApiCallsChart from './ApiCallsChart';
import ApiCallsByWeekChart from './ApiCallsByWeekChart';
import ApiPerformanceChart from './ApiPerformanceChart';

const statisUrl=URI.CORE_STATIS.serviceManagerStatis;
const getServiceLastWeekStatis=URI.CORE_STATIS.getServiceLastWeekStatis;
const getServiceCoutByAppClass=URI.CORE_STATIS.getServiceCoutByAppClass;
const getServiceCoutByState=URI.CORE_STATIS.getServiceCoutByState;
const textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};

class ServerManagerHome extends React.Component{

  constructor(props){
    super(props);
    this.state={
      mask:false,
      statis:{},
      lastWeekData:[],
      serviceAppData:[],
      serviceStateData:[],
    }
  }

  componentDidMount(){
    this.loadStatis();
  }

  loadStatis=()=>{
    //载入统计数据
    this.setState({mask:true});
    AjaxUtils.get(statisUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          this.setState({statis:data,mask:false});
        }
    });

    //载入按应用数对服务进行统计
    this.setState({mask:true});
    AjaxUtils.get(getServiceCoutByAppClass,(data)=>{
        if(data.state===false){
          AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          this.setState({serviceAppData:data,mask:false});
        }
    });

    //载入按服务状态对服务数量进行统计
    this.setState({mask:true});
    AjaxUtils.get(getServiceCoutByState,(data)=>{
        if(data.state===false){
          AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          this.setState({serviceStateData:data,mask:false});
        }
    });

  }

	render(){
    let warningImg=URI.baseImageUrl+"/error.png";
    let chartsImg=URI.baseImageUrl+"/chart_f.png";
    let countImg=URI.baseImageUrl+"/total_2.png";
    let timeImg=URI.baseImageUrl+"/time_f.png";
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
                        <span style={{fontSize:'22px'}}><b>{this.state.statis.accessCount}</b></span>
                        <div>今日调用(次)</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
              <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#648AE0',height:'100%',textAlign:'center'}}>
                        <Icon type="clock-circle" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.statis.averageResTime}</b></span>
                        <div>平均响应时间(秒)</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
            <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#6483BE',height:'100%',textAlign:'center'}}>
                        <Icon type="appstore" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.statis.serviceCount}</b></span>
                        <div>总服务数(个)</div>
                  </div>
              </div>
          </Col>
        </Row>
      <br/><br/>
      <Card title="每日API调用量统计" style={{minHeight:'500px',borderRadius: '0px'}} bodyStyle={{ padding: 10 }} >
          <ApiCallsByWeekChart />
      </Card>
      <br/>
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

export default ServerManagerHome;
