import React from 'react';
import ReactDOM from 'react-dom';
import {Select} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

const url=URI.LIST_APP.list; //应用选择列表
const Option = Select.Option;

class AppSelect extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      value: props.value,
      url:url,
      data:props.data||[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        AjaxUtils.get(this.state.url,(data)=>{this.setState({data:data});});
  }

  handleChange=(value)=>{
    this.setState({ value });
    this.props.onChange(value);
  }

  render() {
    //console.log("ajaxselect render");
    const {data} = this.state;
    const value=this.props.value;
    const option=this.props.options||{};
    const optionsItem = data.map(d => <Option key={d.appId}>{d.appId+"|"+d.appName}</Option>);
    return (
          <Select value={value}  onChange={this.handleChange} showSearch={true} {...option} style={{minWidth:'150px'}} >
           {optionsItem}
          </Select>
        );
  }

}

export default AppSelect;
