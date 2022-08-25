import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message,AutoComplete} from 'antd';
import * as AjaxUtils from '../utils/AjaxUtils';

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
    const options=this.props.options||{};
    const size=this.props.size||'default';
    const placeholder=this.props.placeholder||'';
    return (
          <AutoComplete size={size} filterOption={true} {...options} placeholder={placeholder} allowClear={true} dataSource={data} defaultValue={value} onChange={this.handleChange} />
        );
  }
}

// <Select size={size} defaultValue={value} style={{ width: '100%' }} {...option} onChange={this.handleChange}>
//  {optionsItem}
// </Select>

export default EditSelect;
