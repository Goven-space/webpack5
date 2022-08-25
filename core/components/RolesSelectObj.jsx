import React from 'react';
import ReactDOM from 'react-dom';
import {Select } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
const listAllRoles=URI.CORE_USER_ROLE.listAllRoles;

const Option = Select.Option;

//角色选择控件，返回value和text

class RolesSelectObj extends React.Component {
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
          if(data.state==='false'){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({data:data});
          }
        });
  }

  handleChange=(value)=>{
    this.props.onChange(value.key,value.label);
  }
  render() {
    //console.log("ajaxselect render");
    const {data} = this.state;
    const value=this.props.value;
    const option=this.props.options||{};
    const optionsItem = data.map(d => <Option key={d.value}>{d.text+"|"+d.value}</Option>);
    return (
          <Select value={value} labelInValue  onChange={this.handleChange} {...option} >
           {optionsItem}
          </Select>
        );
  }
}

export default RolesSelectObj;
