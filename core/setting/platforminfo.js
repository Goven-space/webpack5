import React from 'react';
import {Icon,Spin,Card} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

const url=URI.CORE_APPSETTING.platforminfo;
class PlatformInfo extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      data:{},
      rdbsDisplay:'none',
    };
  }

  componentDidMount(){
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({data:data,mask:false});
    });
  }

  showRdbs=()=>{
  	if(this.state.rdbsDisplay==='none'){
  		this.setState({rdbsDisplay:''});
  	}else{
  		this.setState({rdbsDisplay:'none'});
  	}
  }

  render() {
  	let {data}=this.state;
    return (
     <Spin spinning={this.state.mask} tip="Loading..." >
     <Card title="平台相关信息" style={{minHeight:'750px'}}>
	     <div>
	     <h3>版权信息</h3><br/>
	     <b>本平台仅授权给:</b> {data.CopyRight}<br/>
       <b>本机唯一编号:</b> {data.UUID}<br/>
	     <b>客户唯一编号:</b> {data.NO}<br/>
	     <b>服务有效期至:</b> {data.ServiceTime}<br/>
       <b>版本号:</b> {data.version}<br/>
	     </div>
	     <br/><br/>

		 <h3>当前服务器相关信息</h3><br/>
     <b>当前服务器Id:</b> {data.ServerId}<br/>
		 <b>当前服务器IP:</b> {data.ServerIP}<br/>
     <b>HTTP服务端口:</b> {data.HttpPort}<br/>
     <b>当前服务器集群标识:</b> {data.CurrentServerClusterFlag}<br/>
     <b>数据存储模式:</b> {data.dataLocation}<br/>
     <b>缺省RDBS数据源:</b> {data.datasourceid}<br/>
		 <b>MongoDB数据库IP:</b> {data.MongoDS}<br/>
     <b>MongoDB数据库:</b> {data.MongoDbName}<br/>


     </Card>
     </Spin>
    );
  }
}
export default PlatformInfo;
