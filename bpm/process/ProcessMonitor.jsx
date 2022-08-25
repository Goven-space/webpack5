import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Icon,Drawer} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ProcessFrame from './ProcessMonitorFrame';
import ListRemarks from '../todo/grid/ListRemarks';
import ShowProcessLog from '../monitor/form/ShowProcessLog';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;

class ProcessMonitor extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.applicationId=this.props.applicationId||'';
    this.status=this.props.status; //是否运行中流程current表示是,end表示已结束
    this.state={
      mask:true,
      visible:false,
      processUrl:webappsProjectName+"/res/bpm/designer/ShowFlow.html",
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
    this.setState({visible: true,currentNodeObj:nodeObj,currentEleId:eleId,currentNodeType:nodeObj.nodeType,action:action});
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

  refresh=()=>{
    this.refs.ProcessFrame.timeLoadProcessInsNodeList();
  }

  unMask=()=>{
    this.setState({mask:false});
  }

  render() {
    let nodeType=this.state.currentNodeType;
    let nodeId=this.state.currentNodeObj.key;
    if(nodeId===undefined){nodeId=this.state.currentNodeObj.nodeId;}
    let nodePropsForm;
    if(this.state.action=='2'){
      nodePropsForm=<ShowProcessLog  processId={this.processId}  close={this.closeModal}  applicationId={this.applicationId} />
    }else{
      nodePropsForm=<ListRemarks transactionId={this.transactionId} nodeId={nodeId}  processId={this.processId} applicationId={this.applicationId} close={this.closeModal} />
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
          <span><Button  type="primary"  icon="reload" onClick={this.playProcess} >回放审批过程</Button>{' '}</span>
          <Button    icon="file" onClick={this.showProcessLog} >查看日志</Button>{' '}
          <Button    icon="reload" onClick={this.refresh} >刷新状态</Button>{' '}
        </div>

        <div style={{border:'2px #cccccc solid',margin:'0px',borderRadius:'2px',}}>
          <ProcessFrame
              ref='ProcessFrame'
              src={this.state.processUrl}
              processId={this.processId}
              applicationId={this.applicationId}
              editNodeProps={this.editNodeProps}
              editRouterProps={this.editRouterProps}
              editProcessProps={this.editProcessProps}
              unMask={this.unMask}
              transactionId={this.transactionId}
              status={this.status}
              />
        </div>
      </Spin>
    );
  }
}

export default ProcessMonitor;
