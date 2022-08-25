import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Icon, Button, Layout, Menu, Card,Modal } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const confirm = Modal.confirm;
const getProcessUrl=URI.ESB.CORE_ESB_MONITOR.instanceinfo;
const historyinfo=URI.ESB.CORE_ESB_MONITOR.historyinfo;

export default class ProcessMonitorFrame extends React.Component {
  constructor(props) {
    super(props);
    this.src=this.props.src;
    this.editNodeProps=this.props.editNodeProps;
    this.editRouterProps=this.props.editRouterProps;
    this.editProcessProps=this.props.editProcessProps;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.unMask=this.props.unMask;
    this.url=getProcessUrl+"?processId="+this.processId+"&transactionId="+this.transactionId;
    this.intervalId;
    this.status=this.props.status; //current表示是正在运行中的流程监控
    this.compensateFlag=this.props.compensateFlag; //1表示补偿状态中
    this.state = {
        iFrameHeight: '0px',
        play:0,
        insNodeList:[],
    }
}

componentDidMount(){
  //传事件到iframe中去
  let mframe =this.refs.iframe;
  mframe.contentWindow.editNodeProps=this.editNodeProps;
  mframe.contentWindow.editRouterProps=this.editRouterProps;
  mframe.contentWindow.editProcessProps=this.editProcessProps;
  if(this.status==='current' && this.compensateFlag!=1){
    //只有活动的流程才启用定时更新
    const self = this;
    this.intervalId=setInterval(function(){
      if(self.state.insNodeList.length>0){
        self.timeLoadProcessInsNodeList();
      }
    }, 1000);
  }
}

//清除定时器
componentWillUnmount(){
  window.clearInterval(this.intervalId);
}

//载入流程图
loadProcessModel=()=>{
  return this.processModel;
}

//获得流程图对象
getProcessObj=()=>{
  return this.refs.iframe.contentWindow;
}

getProcessAllNodes=()=>{
  let winobj =this.refs.iframe.contentWindow;
  return winobj.getCurrentFlowDoc();
}

initProcessMoel=(processModel,insNodeList)=>{
  let processModelObj;
  let winobj =this.refs.iframe.contentWindow;
  if(typeof processModel ==='string' && processModel!==''){
    processModelObj=JSON.parse(processModel);
  }else{
    processModelObj={nodeDataArray:[],linkDataArray:[]}
  }
  winobj.showFlow(processModelObj,insNodeList);
}

//定时更新节点信息
timeLoadProcessInsNodeList=()=>{
  this.setState({mask:true});
  AjaxUtils.get(this.url,(data)=>{
      if(data.state===false){
        this.setState({mask:false});
        AjaxUtils.showError(data.msg);
      }else{
        this.updateProcessNodeInfo(data.insNodeList);
        this.setState({mask:false});
      }
  });
}

//更新节点信息
updateProcessNodeInfo=(insNodeList)=>{
    let winobj =this.refs.iframe.contentWindow;
    winobj.initNodeMonitorInfo(insNodeList);
}

playProcess=()=>{
  this.setState({mask:true,play:1});
  let winobj =this.refs.iframe.contentWindow;
  let url=historyinfo+"?transactionId="+this.transactionId;
  AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        winobj.playProcess(data);
      }
  });
}

loadProcess=()=>{
  this.setState({mask:true});
  AjaxUtils.get(this.url,(data)=>{
      if(data.state===false){
        this.setState({mask:false});
        AjaxUtils.showError(data.msg);
      }else{
          if(data.graph!==undefined && data.graph!==''){
            this.initProcessMoel(data.graph,data.insNodeList);
          }
          this.setState({mask:false,insNodeList:data.insNodeList});
          this.unMask(); //父级组件中的mask取消
      }
  });
}

  render() {
    return (
      <iframe
                style={{width:'100%', height:'2300px', overflow:'scroll'}}
                onLoad={() => {
                    this.loadProcess();
                }}
                ref="iframe"
                src={this.src}
                scrolling="yes"
                frameBorder="0"
            />
    );
  }
}
