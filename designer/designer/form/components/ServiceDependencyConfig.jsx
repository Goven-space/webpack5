import React from 'react';
import {Button,Icon,Checkbox,Card} from 'antd';
class ServiceDependencyConfig extends React.Component{
  constructor(props){
    super(props);
    this.closeTab=this.props.closeTab;
    this.joinServiceItem=this.props.joinServiceItem; //当前点击要配置的服务
    this.allService=this.props.allService; //所有可选的服务
    this.save=this.props.saveServiceDependency; //保存函数
    this.state={
      selectedServiceId:this.joinServiceItem.prevServiceId.split(","),
    };
  }

  componentDidMount(){
  }

  getSelectedItem=()=>{
    let selectedIds="";
    this.state.selectedServiceId.forEach((v)=>{
      if(v!==''){
        if(selectedIds===''){selectedIds=v;}else{selectedIds+=","+selectedIds;}
      }
    });
    // console.log(selectedIds);
    this.joinServiceItem.prevServiceId=selectedIds;
    return this.joinServiceItem;
  }

  onCheckboxChange=(e)=>{
    let id=e.target.value;
    if(e.target.checked){
      this.state.selectedServiceId.push(id);
    }else{
      var index = this.state.selectedServiceId.indexOf(id);
      this.state.selectedServiceId.splice(index, 1);
    }
  }

  render() {
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let currentSelectedId=this.joinServiceItem.prevServiceId;//当前已经配置依赖的服务id
    let currentId=this.joinServiceItem.serviceId;
    let prevServiceIdBox=this.allService.map(item=>{
      if(item.serviceId===currentId){
        return (<div key={item.serviceId}><Checkbox disabled value={item.serviceId}>{item.method+"->"+item.url}</Checkbox></div>);
      }else{
        let defaultChecked=false;
        if(currentSelectedId.indexOf(item.serviceId)!==-1){
          defaultChecked=true;
        }
        return (<div key={item.serviceId}><Checkbox onChange={this.onCheckboxChange} defaultChecked={defaultChecked} value={item.serviceId}>{item.method+"->"+item.url}</Checkbox></div>);
      }

    });

    return (
        <div>
        请选择可依赖的服务(注意:服务之间不要相互依赖否则将进入不可用状态,参数传递需要依赖服务的输出参数与当前服务的输入参数名一致)
        <br/>
        <br/>
        {prevServiceIdBox}
        </div>
    );
  }
}

export default ServiceDependencyConfig;
