import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Icon, Button, Layout, Menu, Card,Modal } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const confirm = Modal.confirm;
const getProcessUrl=URI.BPM.CORE_BPM_CONFIG.getById;

export default class ProcessFrame extends React.Component {
  constructor(props) {
    super(props);
    this.src=this.props.src;
    this.editNodeProps=this.props.editNodeProps;
    this.editRouterProps=this.props.editRouterProps;
    this.editProcessProps=this.props.editProcessProps;
    this.saveProcess=this.props.saveProcess;
    this.deleteProcessNode=this.props.deleteProcessNode;
    this.copyProcessNode=this.props.copyProcessNode;
    this.processId=this.props.processId;
    this.runProcess=this.props.runProcess;
    this.unMask=this.props.unMask;
    this.changeState=this.props.changeState;
    this.state = {
        iFrameHeight: '0px',
    }
}

componentDidMount(){
  //传事件到iframe中去
  let mframe =this.refs.iframe;
  mframe.contentWindow.editNodeProps=this.editNodeProps;
  mframe.contentWindow.editRouterProps=this.editRouterProps;
  mframe.contentWindow.editProcessProps=this.editProcessProps;
  mframe.contentWindow.saveProcess=this.saveProcess;
  mframe.contentWindow.deleteProcessNode=this.deleteProcessNode;
  mframe.contentWindow.copyProcessNode=this.copyProcessNode;
  mframe.contentWindow.runProcess=this.runProcess;
  mframe.contentWindow.changeState=this.changeState;
  mframe.contentWindow.showInfo=AjaxUtils.showInfo;
  mframe.contentWindow.unMask=this.unMask;
}

//载入流程图
loadProcessModel=()=>{
  return this.processModel;
}

//获得流程图对像
getProcessObj=()=>{
  return this.refs.iframe.contentWindow;
}

getProcessAllNodes=()=>{
  let winobj =this.refs.iframe.contentWindow;
  return winobj.getCurrentFlowDoc();
}

initProcessMoel=(processModel)=>{
  let processModelObj;
  let winobj =this.refs.iframe.contentWindow;
  if(typeof processModel ==='string' && processModel!==''){
    processModelObj=JSON.parse(processModel);
  }else{
    processModelObj={nodeDataArray:[],linkDataArray:[]}
  }
  winobj.initFlowCharts(processModelObj);
}

loadProcess=()=>{
  let url=getProcessUrl.replace("{id}",this.processId);
  AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        this.setState({mask:false});
        AjaxUtils.showError(data.msg);
      }else{
          if(data.processModel!==undefined && data.processModel!==''){
            this.initProcessMoel(data.processModel);
          }
          this.unMask(); //父级组件中的mask取消
      }
  });
}



  render() {
    return (
      <iframe
                style={{width:'100%', height:'2300px', overflow:'scroll'}}
                onLoad={() => {this.loadProcess();}}
                ref="iframe"
                src={this.src}
                scrolling="no"
                frameBorder="none"
            />
    );
  }
}
