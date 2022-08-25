import React from 'react';
import ReactDOM from 'react-dom';
import {Select } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
const url=URI.CORE_PERMISSIONS.listAllPermissionsSelect;

const Option = Select.Option;

//角色选择控件，返回value和text

class PermissionSelect extends React.Component {
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
    const {data} = this.state;
    const value=this.props.value;
    const option=this.props.options||{};
    const optionsItem = data.map(
      (item) => {
        return <Option key={item.value} value={item.value}>{item.text}</Option>;
      }
    );
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
          <Select value={valueArray} mode='multiple' onChange={this.handleChange}  >
           {optionsItem}
          </Select>
        );
  }
}

export default PermissionSelect;
