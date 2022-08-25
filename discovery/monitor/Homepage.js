import React from 'react';
import { Row ,Col,Card,Icon} from 'antd';
import ListTopMessage from '../message/ListTopMessage';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ListHomepageServer from './grid/ListHomepageServer';

const loadDataUrl=URI.LIST_REGSERVER_REPORT.server_count;

//Index页面
class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      mask:true,
      data:{exceptionNum:0,totalAccessNum:0,totalApiNum:0,totalAvgTime:0}
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:false});
    AjaxUtils.get(loadDataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });
 }

  render(){
    let textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};
    return (
      <span>
      <Row gutter={24} >
        <Col span={6}>
            <div style={{background:'#f4f4f4',height:'80px'}}  >
              <div style={{width:'40%',float:'left',background:'#ED7E54',height:'100%',textAlign:'center'}}>
                      <Icon type="exclamation-circle-o" style={{fontSize:'30px',color:'#ffffff',paddingTop:'20px'}}/>
              </div>
              <div style={textDivStyle}>
                    <span style={{fontSize:'22px'}}><b>{this.state.data.exceptionNum}</b></span>
                    <div>今日服务异常(次)</div>
                </div>
            </div>
        </Col>
        <Col span={6} >
          <div style={{background:'#f4f4f4',height:'80px'}}  >
            <div style={{width:'40%',float:'left',background:'#6FBFE7',height:'100%',textAlign:'center'}}>
                    <Icon type="line-chart" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                </div>
              <div style={textDivStyle}>
                      <span style={{fontSize:'22px'}}><b>{this.state.data.totalAccessNum}</b></span>
                      <div>今日总调用(次)</div>
                </div>
            </div>
        </Col>
        <Col span={6}>
            <div style={{background:'#f4f4f4',height:'80px'}}  >
            <div style={{width:'40%',float:'left',background:'#648AE0',height:'100%',textAlign:'center'}}>
                    <Icon type="clock-circle-o" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                </div>
              <div style={textDivStyle}>
                      <span style={{fontSize:'22px'}}><b>{this.state.data.totalAvgTime}</b></span>
                      <div>平均响应时间(秒)</div>
                </div>
            </div>
        </Col>
        <Col span={6}>
          <div style={{background:'#f4f4f4',height:'80px'}}  >
            <div style={{width:'40%',float:'left',background:'#6483BE',height:'100%',textAlign:'center'}}>
                      <Icon type="api" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                </div>
              <div style={textDivStyle}>
                      <span style={{fontSize:'22px'}}><b>{this.state.data.totalApiNum}</b></span>
                      <div>总API数(个)</div>
                </div>
            </div>
        </Col>
      </Row>
      <br></br>
        <ListHomepageServer />
      </span>
      );
  }
}

export default Homepage;
