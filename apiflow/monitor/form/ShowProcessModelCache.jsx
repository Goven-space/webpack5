import React from 'react';
import { Card, Icon,Spin,Button,Input} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const ShowUrl=URI.ESB.CORE_ESB_MONITOR.ShowProcessModelCache;
const clearUrl=URI.ESB.CORE_ESB_MONITOR.deleteProcessModelCache;

class ShowProcessModelCache extends React.Component{

  constructor(props){
    super(props);
    this.processId=this.props.processId;
    this.url=ShowUrl+"?processId="+this.processId;
    this.state={
      mask:false,
      data:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
      this.setState({mask:true});
      AjaxUtils.get(this.url,(data)=>{
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
            AjaxUtils.showInfo(data.msg);
            this.loadData();
          }
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div style={{marginBottom:'10px'}}>
            <Button type="primary" onClick={this.clearLog}  >
              删除并重新载入缓存
            </Button>
            </div>
            <div >
              本流程在当前服务器缓存创建时间:{this.state.data.createTime}
              <Input.TextArea style={{minHeight:'450px'}} value={AjaxUtils.formatJson(JSON.stringify(this.state.data.cacheData))} />
            </div>
      </Spin>
    );
  }

}

export default ShowProcessModelCache;
