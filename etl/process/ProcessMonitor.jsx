import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Icon,Drawer} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ProcessFrame from './ProcessMonitorFrame';
import DataNodeMonitor from '../monitor/form/DataNodeMonitor';
import ShowProcessLog from '../monitor/form/ShowProcessLog';
import ListRealtimeData from '../monitor/grid/ListRealtimeData';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const saveProcessUrl=URI.ETL.CONFIG.saveProcessModel;
const getProcessUrl=URI.ETL.CONFIG.getById;
const deleteProcessNodeUrl=URI.ETL.PROCESSNODE.delete;
const RUN_URL=URI.ETL.CONFIG.run;
const Compensate_URL=URI.ETL.CONFIG.compensate;
const goToNextStepUrl=URI.ETL.MONITOR.goToNextStep;
const ProcessInstanceInfoUrl=URI.ETL.MONITOR.insnodeinfo;

class ProcessMonitor extends React.Component{
  constructor(props){
    super(props);
    this.logDbName=this.props.logDbName||'';
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.applicationId=this.props.applicationId;
    this.status=this.props.status; //是否运行中流程current表示是,end表示已结束
    this.state={
      mask:true,
      visible:false,
      processUrl:webappsProjectName+"/res/etl/designer/ShowFlow.html",
      currentNodeObj:{},
      currentEleId:'',
      currentNodeType:'',
      action:'1'
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    let url=ProcessInstanceInfoUrl+"?transactionId="+this.transactionId+"&nodeId=process";
    AjaxUtils.get(url,(data)=>{
      if(data.state==false){
        AjaxUtils.showError(data.msg);
      }else{
        if(data.singleStep!=undefined && data.pNodeId!=undefined){
          // console.log(data.currentStatus);
          this.status=data.currentStatus;
          this.setState({singleStep:data.singleStep});
        }else{
          setTimeout(this.loadData(),1000);
        }
      }
    });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //过程属性
  editProcessProps=()=>{
    this.setState({visible: true,currentEleId:'process',currentNodeType:'process',action:'1'});
  }

  //任务节点，自动活动
  editNodeProps=(eleId,action)=>{
    if(action==='compensateProcess'){
      //重跑节点
      AjaxUtils.showConfirm("重跑流程","您确定从本节点开始重跑流程吗?",this.compensateProcess.bind(this,eleId,"N"));
    }else if(action==='compensateProcessSingleNode'){
      //重跑节点
      AjaxUtils.showConfirm("重跑节点","您确定重跑本节点吗?",this.compensateProcess.bind(this,eleId,"Y"));
    }else{
      //查看过程属性
      let processFrame =this.refs.ProcessFrame;
      let winobj=processFrame.getProcessObj();
      let nodeObj=winobj.getGraph().node(winobj.getRemovePrefixId(eleId));
      this.setState({visible: true,currentNodeObj:nodeObj,currentEleId:eleId,currentNodeType:nodeObj.nodeType,action:'1'});
    }
  }

  //重跑节点
  compensateProcess=(nodeId,singleNode)=>{
    nodeId=nodeId.replace("#","");
    AjaxUtils.post(Compensate_URL,{processId:this.processId,transactionId:this.transactionId,compensateNodeId:nodeId,singleNodeFlag:singleNode},(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("流程运行结果:"+(data.msg===undefined?'-未知-':data.msg));
        }
    });
    AjaxUtils.showInfo("已成功提交流程重跑命令,可刷新流程状态!");
  }

  //路由属性
  editRouterProps=(routerObj,action)=>{
    this.setState({visible: true,currentNodeObj:routerObj,currentEleId:routerObj.eleId,currentNodeType:routerObj.nodeType,action:'1'});
  }
  closeModal=(reLoadFlag,text,nodeType)=>{
      this.setState({visible: false,});
  }
  //回放流程运行过程
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
            AjaxUtils.showInfo("已发送运行指令,请等待节点执行!");
          }else{
            AjaxUtils.showError("指令发送失败");
          }
        }
    });
  }

  refresh=()=>{
    this.setState({mask:true});
    this.refs.ProcessFrame.timeLoadProcessInsNodeList();
    this.setState({mask:false});
  }

  unMask=()=>{
    this.setState({mask:false});
  }

  render() {
    let nodePropsForm;
    let nodeType=this.state.currentNodeType;
    let nodeId=this.state.currentNodeObj.key;
    if(nodeId===undefined){nodeId=this.state.currentNodeObj.nodeId;}
    if(this.state.action=='1'){
      nodePropsForm=<DataNodeMonitor logDbName={this.logDbName} appId={this.appId} transactionId={this.transactionId} nodeId={nodeId}  processId={this.processId}  close={this.closeModal} />
    }else if(this.state.action=='2'){
      nodePropsForm=<ShowProcessLog  processId={this.processId}  close={this.closeModal}  applicationId={this.applicationId} />
    }else if(this.state.action=='3'){
      nodePropsForm=<ListRealtimeData   close={this.closeModal} transactionId={this.transactionId}  />
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
          this.status!=='current'?
          <span><Button  type="primary"  icon="reload" onClick={this.playProcess} >回放任务执行轨迹</Button>{' '}</span>
          :""
        }
        {' '}
        {
          this.status=='current' && this.state.singleStep==true ?
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
              logDbName={this.logDbName}
              />
        </div>
      </Spin>
    );
  }
}

export default ProcessMonitor;
