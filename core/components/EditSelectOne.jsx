import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message,AutoComplete} from 'antd';
import * as AjaxUtils from '../utils/AjaxUtils';

const Option = Select.Option;

class EditSelectOne extends React.Component {
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

  componentWillReceiveProps(nextProps) {
    if(nextProps.value !== this.props.value) {
      this.setState({
        value:nextProps.value
      })
    }
  }

  handleChange=(value)=>{
    this.setState({ value });
    this.props.onChange(value);
  }
  render() {
    const { value,data} = this.state;
    const option=this.props.options||{};
    const size=this.props.size||'default';
    const optionsItem = data.map((d,index) => <Option key={index} value={d.value}>{d.text}</Option>);
    return (
      <Select size={size} defaultValue={value} style={{ width: '100%' }} {...option} onChange={this.handleChange}>
       {optionsItem}
      </Select>
        );
  }
}



export default EditSelectOne;
