import React from 'react';
import ReactDOM from 'react-dom';
import {TreeSelect} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

const loadTreeJsonUrl=URI.CORE_ORG_DEPT.allDeptTreeJson;

//部门树异步模式

class DeptTreeSelect extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      treeData:[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        AjaxUtils.get(loadTreeJsonUrl,(data)=>{this.setState({treeData:data});});
  }

  handleChange=(value, label, extra)=>{
    let nodeType=extra.triggerNode.props.nodeType;
    //if(nodeType==='company'){AjaxUtils.showError("不允许选择机构!");return;}
    this.props.onChange(value, label, extra);
  }

  render() {
    const value=this.props.value;
    const option=this.props.options||{};
    return (
          <TreeSelect
              {...option}
              placeholder="Please select"
              treeData={this.state.treeData}
              value={value}
              onChange={this.handleChange}
          />
        );
  }

}

export default DeptTreeSelect;
