import React from 'react';
import { Card, Icon,Spin,Button } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const LogUrl=URI.ESB.CORE_ESB_DEBUGLOG.showProcessLog;
const clearUrl=URI.ESB.CORE_ESB_DEBUGLOG.clearProcessLog;

class ShowProcessLog extends React.Component{

  constructor(props){
    super(props);
    this.processId=this.props.processId;
    this.state={
      mask:false,
      data:{LogStr:""},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
      this.setState({mask:true});
      let url=LogUrl+"?processId="+this.processId;
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data});
          }
      });
  }

  clearLog=()=>{
      this.setState({mask:true});
      AjaxUtils.post(clearUrl,{processId:this.processId},(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            data.LogStr="The contents have been cleared";
            this.setState({data:data});
          }
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  render() {
    let logStr=this.state.data.LogStr;
    if(logStr!==undefined && logStr!==null){
      logStr=logStr.replace(/\n/gi,"<br>");
      // logStr=logStr.replaceAll("&","&amp;");
      logStr=logStr.split("&").join("&amp;")
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div style={{marginBottom:'10px'}}>
            <Button type="primary" onClick={this.refresh}  >
              刷新日志
            </Button>
            {' '}
            <Button onClick={this.clearLog}  >
              清空日志
            </Button>
            </div>
            <div style={{maxHeight:'600px',overflow:'auto'}} >
            <div dangerouslySetInnerHTML={{__html:logStr}}  />
            </div>
      </Spin>
    );
  }

}

export default ShowProcessLog;
