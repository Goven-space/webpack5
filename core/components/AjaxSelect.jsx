import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message } from 'antd';
import * as AjaxUtils from '../utils/AjaxUtils';

const Option = Select.Option;

//针对固定的url地址，只向服务器请求一次并加载全部数据到select中去

class AjaxSelect extends React.Component {
  constructor(props){
    super(props);
    // console.log(props);
    this.state = {
      url:this.props.url,
      data:this.props.data||[],
      defaultData:this.props.defaultData,
    }
  }

  componentDidMount=()=>{
    this.loadData();
  }

  loadData=()=>{
        //发送ajax请求
        let url=this.state.url;
        if(url==='' || url===undefined){return;}
        AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            message.error(data.msg);
          }else{
            if(this.state.defaultData!==undefined){
              if(this.state.defaultData instanceof Array && data!==undefined){
                this.state.defaultData.map(item=>{data.push(item)});
              }else{
                data.push(this.state.defaultData)
              }
            } //追加默认选项
            if(data.length>0){
              this.setState({data:data});
            }
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
    const size=this.props.size||'default';
    const option=this.props.options||{};
    const valueId=this.props.valueId||"value";
    const textId=this.props.textId||"text";
    const styleOption=this.props.styleOption||{};
    const optionsItem = this.props.selectOpt?this.props.selectOpt:data.map(item => <Option key={"key_"+item[valueId]} value={item[valueId]||''}>{item[textId]}</Option>);
    return (
          <Select size={size}  value={value} onChange={this.handleChange} style={styleOption} {...option} >
           {optionsItem}
          </Select>
        );
  }
}

export default AjaxSelect;
