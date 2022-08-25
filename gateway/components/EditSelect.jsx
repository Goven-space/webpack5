import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message } from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const Option = Select.Option;

class EditSelect extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: props.value,
      data:props.data||[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        let url=this.props.url;
        if(url===undefined){return;}
		AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            message.error(data.msg);
          }else{
            this.setState({data:data});
          }
	    });
  }

  handleChange=(value)=>{
    this.setState({ value });
    this.props.onChange(value);
  }
  render() {
    const { value,data} = this.state;
    const option=this.props.options||{};
    const optionsItem = data.map((d,index) => <Option key={index} value={d.value}>{d.text}</Option>);
    return (
          <Select defaultValue={value} style={{ width: '100%' }} {...option} onChange={this.handleChange}>
           {optionsItem}
          </Select>
        );
  }
}

export default EditSelect;
