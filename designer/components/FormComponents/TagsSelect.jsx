import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const Option = Select.Option;
const ListTagsUrl=URI.CORE_ApiTagsConfig.listAll; //列出所有服务已经存在的标签

//标签选择用

class TagsSelect extends React.Component {
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state = {
      data:[],
    }
  }

  componentDidMount=()=>{
    let url=ListTagsUrl+"?appId=*";
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        message.error(data.msg);
      }else{
          this.setState({data:data});
      }
    });
  }

  handleChange=(value)=>{
    this.props.onChange(value);
  }

  render() {
    let value=this.props.value;
    const optionsItem = this.state.data.map(
      (item) => {
          return <Option key={"key_"+item.value} value={item.value}>{item.text}</Option>;
        }
    );
    return (
          <Select value={value} onChange={this.handleChange} mode="multiple"  tokenSeparators={[',']} >
           {optionsItem}
          </Select>
        );
  }

}

export default TagsSelect;
