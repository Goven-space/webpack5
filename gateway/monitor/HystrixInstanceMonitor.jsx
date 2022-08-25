import React from 'react';
import {Button, Spin,Tag,Icon,Modal,Card,Input,Tabs,Progress } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const url=URI.CORE_GATEWAY_HYXSTRIX.hyxInstanceById; // 显示服务的详细信息
const TabPane = Tabs.TabPane;

class HystrixInstanceMonitor extends React.Component{
  constructor(props){
    super(props);
    this.intervalId;
    this.id=this.props.id;
    this.url=url+"?id="+this.id;
    this.state={
      mask:false,
      visible:false,
      data:[],
    };
  }

  componentDidMount(){
    this.loadData();
    const self = this;
    this.intervalId=setInterval(function(){
      let data=self.loadData();
    }, 1000);
  }

  componentWillUnmount(){
    // console.log("组件被删除="+this.intervalId);
    window.clearInterval(this.intervalId);
  }

  loadData=()=>{
      // this.setState({mask:true});
      AjaxUtils.get(this.url,(data)=>{
          // this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data});
          }
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  render() {
    let monitorInfoTr=[];
    if(this.state.data.length>0){
      let data=this.state.data[0];
      Object.keys(data).forEach((item,index)=>{
        let text=item;
        let value=data[item];
        // console.log(text+"=>"+value);
        if(value instanceof Object ){
          value=JSON.stringify(value);
        }
        if(value===true){value="true";}
        if(value===false){value="false";}
        monitorInfoTr.push(<tr key={index}><td>{text}</td><td>{value}</td></tr>);
      });
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{paddingBottom:'20px'}} className='apidoc'  >
                <h2>Hystrix监控数据</h2>
                <table style={{width:'100%'}}><tbody  >
                  <tr key='in1'>
                  <th style={{width:'30%'}}>监控指标</th>
                  <th>当前数值</th>
                  </tr>
                  {monitorInfoTr}
                </tbody></table>
        </div>
      </Spin>
    );
  }
}

export default HystrixInstanceMonitor;
