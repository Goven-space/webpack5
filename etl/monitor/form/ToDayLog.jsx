import React from 'react';
import { Card, Icon,Spin,Button } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const url=URI.CORE_SYSTEMLOG.GetToDayLog;
const clearUrl=URI.CORE_SYSTEMLOG.ClearToDayLog;
const logfiles=URI.ETL.DEBUGLOG.logfiles;
const download=URI.ETL.DEBUGLOG.download;

class ToDayLog extends React.Component{

  constructor(props){
    super(props);
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
      AjaxUtils.get(clearUrl,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            data.LogStr="The contents have been cleared";
            this.setState({data:data});
          }
      });
  }

  showAllLogFiles=()=>{
      this.setState({mask:true});
      AjaxUtils.get(logfiles,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            let htmlBody="";
            data.files.forEach((item, i) => {
              let url=download+"?fileName="+item.fileName;
              htmlBody+="<br><a href='"+url+"'>"+(i+1)+"."+item.filePath+"("+item.size+"k)</a>";
            });
            data.LogStr=htmlBody;
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
      logStr=logStr.split("&").join("&amp;");
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
            {' '}
            <Button onClick={this.showAllLogFiles}  >
              显示所有日志文件
            </Button>
            </div>
            <div style={{maxHeight:'550px',overflow:'auto'}}>
            <div dangerouslySetInnerHTML={{__html:logStr}}  />
            </div>
      </Spin>
    );
  }

}

export default ToDayLog;
