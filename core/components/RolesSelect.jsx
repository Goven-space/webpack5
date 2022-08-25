import React from 'react';
import ReactDOM from 'react-dom';
import {Select } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
const listAllRoles=URI.CORE_USER_ROLE.listAllRoles;

const Option = Select.Option;

//角色选择控件

class RoelsSelect extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      data:props.data||[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        AjaxUtils.get(listAllRoles,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
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
    const optionsItem = data.map(d => <Option key={d.value}>{d.text+"|"+d.value}</Option>);

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

export default RoelsSelect;
