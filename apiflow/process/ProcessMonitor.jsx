import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Icon,Drawer} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ProcessFrame from './ProcessMonitorFrame';
import InsNodeMonitor from '../monitor/form/InsNodeMonitor';
import ShowProcessLog from '../monitor/form/ShowProcessLog';
import ListRealtimeData from '../monitor/grid/ListRealtimeData';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const saveProcessUrl=URI.ESB.CORE_ESB_CONFIG.saveProcessModel;
const getProcessUrl=URI.ESB.CORE_ESB_CONFIG.getById;
const deleteProcessNodeUrl=URI.ESB.CORE_ESB_PROCESSNODE.delete;
const RUN_URL=URI.ESB.CORE_ESB_MONITOR.reRunNode;
const goToNextStepUrl=URI.ESB.CORE_ESB_MONITOR.goToNextStep;

class ProcessMonitor extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.compensateFlag=this.props.compensateFlag;
    this.transactionId=this.props.transactionId;
    this.status=this.props.status; //是否运行中流程current表示是,end表示已结束
    this.state={
      mask:true,
      visible:false,
      processUrl:webappsProjectName+"/res/esb/designer/ShowFlow.html",
      currentNodeObj:{},
      currentEleId:'',
      currentNodeType:'',
      action:'',
    };
  }

  componentDidMount(){

  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //过程属性
  editProcessProps=()=>{
    this.setState({visible: true,currentEleId:'process',currentNodeType:'process'});
  }

  //任务节点，自动活动
  editNodeProps=(eleId,action)=>{
    let processFrame =this.refs.ProcessFrame;
    let winobj=processFrame.getProcessObj();
    let nodeObj=winobj.getGraph().node(winobj.getRemovePrefixId(eleId));
    if(action==='reRunNode'){
      this.setState({currentNodeObj:nodeObj});
      this.showConfirm();
    }else{
      this.setState({visible: true,currentNodeObj:nodeObj,currentEleId:eleId,currentNodeType:nodeObj.nodeType,action:action});
    }
  }

  showConfirm=()=>{
      let self=this;
      confirm({
      title: '确定要重新执行本节点吗?',
      content: '注意:重新请求API有可能会产生重复的数!',
      onOk(){
        return self.reRunNode(self.state.currentNodeObj.key);
      },
      onCancel() {},
      });
  }

  //路由属性
  editRouterProps=(routerObj,action)=>{
    this.setState({visible: true,currentNodeObj:routerObj,currentEleId:routerObj.eleId,currentNodeType:routerObj.nodeType});
  }
  closeModal=(reLoadFlag,text,nodeType)=>{
      this.setState({visible: false,});
  }
  //回放流程执行过程
  playProcess=()=>{
    this.refs.ProcessFrame.playProcess();
  }
  //查看日志
  showProcessLog=()=>{
    this.setState({visible: true,action:'2'});
  }
  //查看实时数据
  showProcessData=()=>{
    this.setState({visible: true,action:'3'});
  }

  //单步执行到下一节点
  goToNextStep=(action)=>{
    let url=goToNextStepUrl+"?transactionId="+this.transactionId+"&action="+action;
    AjaxUtils.get(url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          if(data.msg=='1'){
            AjaxUtils.showInfo("已发送运行指令");
          }else{
            AjaxUtils.showError("指令发送失败");
          }
        }
    });
  }

  refresh=()=>{
    this.refs.ProcessFrame.timeLoadProcessInsNodeList();
  }

  unMask=()=>{
    this.setState({mask:false});
  }

  reRunNode=(nodeId)=>{
   let url=RUN_URL+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+nodeId;
   this.setState({mask:true});
   AjaxUtils.get(url,(data)=>{
       this.setState({mask:false});
       if(data.state===false){
         AjaxUtils.showError(data.msg);
       }else{
         // AjaxUtils.showInfo(data.msg);
         confirm({
           title: '重跑结果',
           content: data.msg,
           onOk(){},
           onCancel() {},
           });
       }
   });
  }

  render() {
    let nodeType=this.state.currentNodeType;
    let nodeId=this.state.currentNodeObj.key;
    if(nodeId===undefined){nodeId=this.state.currentNodeObj.nodeId;}
    let nodePropsForm;
    if(this.state.action=='2'){
      nodePropsForm=<ShowProcessLog  processId={this.processId}  close={this.closeModal}  applicationId={this.applicationId} />
    }else if(this.state.action=='3'){
      nodePropsForm=<ListRealtimeData   close={this.closeModal} transactionId={this.transactionId}  />
    }else{
      nodePropsForm=<InsNodeMonitor appId={this.appId} transactionId={this.transactionId} nodeId={nodeId}  processId={this.processId}  close={this.closeModal} />
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Drawer   key={Math.random()}
                  title=""
                  placement="right"
                  width='1000px'
                  closable={false}
                  onClose={this.handleCancel}
                  visible={this.state.visible}
                >
                  {nodePropsForm}
        </Drawer>
        <div style={{ padding: '10px 8px 10px 8px', background: '#f4f4f4' }}>
        {
          (this.status!=='current' || this.compensateFlag==1)?
          <span><Button  type="primary"  icon="reload" onClick={this.playProcess} >回放任务执行轨迹</Button>{' '}</span>
          :""
        }
        {
          (this.status=='current' && this.compensateFlag!=1)?
          <span>
          <Button  type="primary"   icon="play-circle" onClick={this.goToNextStep.bind(this,1)} >运行下一步</Button>{' '}
          <Button    icon="play-circle" onClick={this.goToNextStep.bind(this,0)} >继续</Button>{' '}
          <Button    icon="file-text" onClick={this.showProcessData} >查看实时数据</Button>{' '}
          </span>
          :""
        }

          <Button    icon="file" onClick={this.showProcessLog} >查看日志</Button>{' '}
          <Button    icon="reload" onClick={this.refresh} >刷新状态</Button>{' '}
        </div>

        <div style={{border:'2px #cccccc solid',margin:'0px',borderRadius:'2px',}}>
          <ProcessFrame
              ref='ProcessFrame'
              src={this.state.processUrl}
              processId={this.processId}
              editNodeProps={this.editNodeProps}
              editRouterProps={this.editRouterProps}
              editProcessProps={this.editProcessProps}
              unMask={this.unMask}
              transactionId={this.transactionId}
              status={this.status}
              compensateFlag={this.compensateFlag}
              />
        </div>
      </Spin>
    );
  }
}

export default ProcessMonitor;
