import React from 'react';
import ReactDOM from 'react-dom';
import {Select } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
const url=URI.CORE_CLUSTERSERVER.listAllServiceName;

const Option = Select.Option;

//集群服务器的ServiceName选择

class ListClusterServiceName extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      data:props.data||[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data});
          }
        });
  }

  handleChange=(value)=>{
    this.props.onChange(value);
  }
  render() {
    //console.log("ajaxselect render");
    const {data} = this.state;
    const value=this.props.value;
    const option=this.props.options||{};
    const optionsItem = data.map(d => <Option key={d.serviceName}>{d.serviceName}</Option>);

    let valueArray=[];
    // console.log(value instanceof Array);
    if(value!=='' && value!==undefined && value!==null){
      if(value instanceof Array){
          valueArray=value;
      }else{
        valueArray=value.split(",");
      }
    }

    return (
          <Select value={valueArray} mode='multiple' onChange={this.handleChange} {...option} >
           {optionsItem}
          </Select>
        );
  }
}

export default ListClusterServiceName;
