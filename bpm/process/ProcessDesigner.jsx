import React from 'react';
import ReactDOM from 'react-dom';
import {Layout,Input, Button,Spin,Card,Modal,Icon,Drawer,Menu,Dropdown} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import OpenProcessForm from '../todo/form/OpenProcessForm';
import ProcessMonitor from './ProcessMonitor';
import LeftMenu from './ProcessDesignerLeftMenu';
import ProcessFrame from './ProcessFrame';
import StartNode from './form/StartNode';
import RouterNode from './form/RouterNode';
import ProcessNode from './form/ProcessNode';
import EndNode from './form/EndNode';
import GatewayNode from './form/GatewayNode';
import ApiNode from './form/ApiNode';
import MsgNode from './form/MsgNode';
import TextNode from './form/TextNode';
import WeiXinNode from './form/WeiXinNode';
import DingNode from './form/DingNode';
import ShowProcessLog from '../monitor/form/ShowProcessLog';
import AsyncCallbackNode from './form/AsyncCallbackNode';
import SubProcessNode from './form/SubProcessNode';
import JavaCodeNode from './form/JavaCodeNode';

import UserTaskNode from './form/UserTaskNode';
import CountersignTaskNode from './form/CountersignTaskNode';
import DraftTaskNode from './form/DraftTaskNode';
import JoinTaskNode from './form/JoinTaskNode';

const { Header, Footer, Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const saveProcessUrl=URI.BPM.CORE_BPM_CONFIG.saveProcessModel;
const getProcessUrl=URI.BPM.CORE_BPM_CONFIG.getById;
const deleteProcessNodeUrl=URI.BPM.CORE_BPM_PROCESSNODE.delete;
const copyProcessNodeUrl=URI.BPM.CORE_BPM_PROCESSNODE.copyUrl;
const RUN_URL=URI.BPM.CORE_BPM_CONFIG.run;

class ProcessDesigner extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.state={
      mask:true,
      visible:false,
      processUrl:webappsProjectName+"/res/bpm/designer/FlowDesigner.html",
      currentNodeObj:{},
      currentEleId:'',
      currentNodeType:'',
      selectedKeys:[],
    };
  }

  componentDidMount(){

  }

  //改变状态
  changeState=(stateObj)=>{
    this.setState(stateObj);
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //过程属性
  editProcessProps=()=>{
    this.setState({visible: true,currentEleId:'process',currentNodeType:'process'});
  }

  //任务节点，自动活动
  editNodeProps=(eleId)=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    let nodeObj=winobj.getGraph().node(winobj.getRemovePrefixId(eleId));
    this.setState({visible: true,currentNodeObj:nodeObj,currentEleId:eleId,currentNodeType:nodeObj.nodeType});
  }

  //路由属性
  editRouterProps=(routerObj)=>{
    this.setState({visible: true,currentNodeObj:routerObj,currentEleId:routerObj.eleId,currentNodeType:routerObj.nodeType});
  }

  saveProcess=(showtip)=>{
    let winobj=this.refs.ProcessFrame.getProcessObj();
    var allNodeObjs = winobj.getCurrentFlowDoc();
    // console.log(allNodeObjs);
    let postData={appId:this.appId,processId:this.processId,processModel:JSON.stringify(allNodeObjs)}
    // return;
    this.setState({mask:true});
    AjaxUtils.post(saveProcessUrl,postData,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({mask:false});
          if(showtip!=false){
            AjaxUtils.showInfo(data.msg);
          }
        }
    });
  }

  runProcess=(e)=>{
    this.setState({currentNodeType:"processRunOption",visible:true});
  }

  deleteProcessNode=(nodeIds)=>{
    this.setState({mask:true});
    AjaxUtils.post(deleteProcessNodeUrl,{processId:this.processId,nodeId:nodeIds.join(",")},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          // AjaxUtils.showInfo("节点删除成功!");
        }
    });
  }

  copyProcessNode=(sourceNodeId,targetNodeId)=>{
    this.setState({mask:true});
    AjaxUtils.post(copyProcessNodeUrl,{processId:this.processId,sourceNodeId:sourceNodeId,targetNodeId:targetNodeId},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
        }
    });
  }

  closeModal=(reLoadFlag,text,nodeType)=>{
      this.setState({visible: false,});
      // console.log(text+"===="+nodeType);
      if(text===undefined && nodeType===undefined){return;} //流程过程属性关闭时是undefined的
      if(reLoadFlag===true){
        let processFrame =this.refs.ProcessFrame;
        let winobj=processFrame.getProcessObj();
        var eleId=this.state.currentEleId;
        if(nodeType==='router'){
          //路由线
          winobj.setRouterLabel(winobj.$(eleId).attr('sourceId'), winobj.$(eleId).attr('targetId'), text);
        }else{
          //普通节点
          this.state.currentNodeObj.text=text;
          let nodeObj=winobj.$("#" + this.state.currentNodeObj.key);
          winobj.addTextToNode(nodeObj,text);
        }
      }
  }

  //新增节点
  newProcessNode=(nodeType,templateId='',nodeName='')=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    if(nodeType===undefined){return;}
    winobj.$('#Container').css('cursor', 'pointer');
    winobj.GoalNewNodeType=nodeType; //要新增节点的类型
    winobj.GoalNodeTemplateId=templateId;//设置全局性质的模板Id
    winobj.GoalNodeName=nodeName;//设置全局性的节点名称
  }
  processMouseTool=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.mouseTool();
  }
  processConnectionTool=(lineType)=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.connectionTool(lineType);
  }
  processGrid=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.showGrid();
  }
  processUnDo=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.undo();
  }
  processReDo=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.redo();
  }
  processSetting=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.setting();
  }
  saveProcessPhoto=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.save2Photo();
  }
  processSelectedAll=()=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.selectedAll();
  }

  changeTransform=(e)=>{
    let action=e.key;
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    winobj.ChangeTransform(action);
  }

  //显示日志内容
  showLog=()=>{
      this.setState({visible:true,currentNodeType:'log'});
  }

  unMask=()=>{
    this.setState({mask:false});
  }

  render() {
    const transformmenu = (
      <Menu onClick={this.changeTransform} >
        <Menu.Item key="1"  >缩小</Menu.Item>
        <Menu.Item key="2" >放大</Menu.Item>
      </Menu>
    );
    const undomenu = (
      <Menu  >
        <Menu.Item key="1" onClick={this.processUnDo} >撤销</Menu.Item>
        <Menu.Item key="2" onClick={this.processReDo} >重做</Menu.Item>
      </Menu>
    );
    let nodePropsForm;
    let nodeType=this.state.currentNodeType;
    // console.log(nodeType);
    if(nodeType==='start'){
      nodePropsForm=<StartNode appId={this.appId} nodeObj={this.state.currentNodeObj} eleId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='end'){
      nodePropsForm=<EndNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='router'){
      nodePropsForm=<RouterNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='process'){
      nodePropsForm=<ProcessNode appId={this.appId} id={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='gateWay'){
      nodePropsForm=<GatewayNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='apiNode'){
      nodePropsForm=<ApiNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='msgNode'){
      nodePropsForm=<MsgNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='weixinNode'){
      nodePropsForm=<WeiXinNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='dingNode'){
      nodePropsForm=<DingNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='textNode'){
      nodePropsForm=<TextNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='log'){
      nodePropsForm=<ShowProcessLog  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='asyncCallbackNode'){
      nodePropsForm=<AsyncCallbackNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='subProcessNode'){
      nodePropsForm=<SubProcessNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='ProcessMonitor'){
      nodePropsForm=<ProcessMonitor status='current' processId={this.processId} transactionId={this.state.transactionId} appId={this.appId}   />
    }else if(nodeType==='processRunOption'){
      nodePropsForm=<OpenProcessForm appId={this.appId} processId={this.processId}  close={this.closeModal} applicationId={this.applicationId}  />
    }else if(nodeType==='javaCodeNode'){
      nodePropsForm=<JavaCodeNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='userTaskNode'){
      nodePropsForm=<UserTaskNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='countersignTaskNode'){
      nodePropsForm=<CountersignTaskNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='draftTaskNode'){
      nodePropsForm=<DraftTaskNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }else if(nodeType==='joinTaskNode'){
      nodePropsForm=<JoinTaskNode appId={this.appId} nodeObj={this.state.currentNodeObj} eldId={this.state.currentEleId}  processId={this.processId}  close={this.closeModal} applicationId={this.applicationId} />
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{border:'1px #cccccc solid',margin:'0px'}}  >
            <Drawer   key={Math.random()}
                      title=""
                      placement="right"
                      width='960px'
                      closable={false}
                      onClose={this.handleCancel}
                      visible={this.state.visible}
                    >
                      {nodePropsForm}
            </Drawer>

            <div style={{ padding: '10px 20px 10px 20px',borderBottom:'1px #cccccc solid', background: '#fff'}}>
                <Button   onClick={this.saveProcess} type="primary"  icon="save"  >保存</Button>{' '}
                <Button   onClick={this.runProcess} icon="play-circle"  >运行</Button>{' '}
                <Button   onClick={this.processConnectionTool.bind(this,'Flowchart')} icon="rollback"  >流程线</Button>{' '}
                <Button   onClick={this.processConnectionTool.bind(this,'Straight')} icon="arrows-alt"  >直线</Button>{' '}
                <Button   onClick={this.processSelectedAll} icon="border-outer"   >全选</Button>{' '}
                <Dropdown overlay={undomenu} >
                       <Button icon="reload" >
                         撤销<Icon type="down" />
                       </Button>
                </Dropdown>{' '}
                <Dropdown overlay={transformmenu} >
                       <Button icon="fullscreen-exit" >
                         缩放<Icon type="down" />
                       </Button>
                </Dropdown>{' '}
                <Button   icon="profile" onClick={this.editProcessProps} >流程属性</Button>{' '}
                <Button   icon="file-text" onClick={this.showLog} >调试日志</Button>{' '}
            </div>

            <div style={{border:'0 #cccccc solid',margin:'0px',borderRadius:'0px'}}>
              <ProcessFrame
                  ref='ProcessFrame'
                  src={this.state.processUrl}
                  processId={this.processId}
                  editNodeProps={this.editNodeProps}
                  editRouterProps={this.editRouterProps}
                  editProcessProps={this.editProcessProps}
                  saveProcess={this.saveProcess}
                  deleteProcessNode={this.deleteProcessNode}
                  copyProcessNode={this.copyProcessNode}
                  runProcess={this.runProcess}
                  changeState={this.changeState}
                  unMask={this.unMask}
                  />
            </div>

        </div>
      </Spin>
    );
  }
}

export default ProcessDesigner;
