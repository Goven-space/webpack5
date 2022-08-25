import React from 'react';
import ReactDOM from 'react-dom';
import {Select,message } from 'antd';
import * as AjaxUtils from '../utils/AjaxUtils';

const Option = Select.Option;

//本组件会根据属性中传入的url自动重新动态刷新下拉数据，而 AjaxSelect则不会刷新，因为组件只在创建时执行一次
//要想在属性改变时必须使用componentWillReceiveProps()方法来重载数据

class DyAjaxSelect extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      url:'',
      data:props.data||[],
    }
  }

  componentWillReceiveProps=(nextProps)=>{
        //发送ajax请求
        // console.log(nextProps);
        let url=nextProps.url;
        // console.log("nextProps.reLoadFlag="+nextProps.reLoadFlag);
        if(nextProps.reLoadFlag===false || url==='' || url===undefined || url===this.state.url){return;} //不需要更新
        // console.log("reload="+url);
        this.setState({url:url}); //加入到state中，避免重复加载同一个url
        AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            message.error("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({data:data});
            if(nextProps.onReLoad){
              nextProps.onReLoad(); //通知父窗口已经更新
            }
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
    const optionsItem = data.map(d => <Option key={d.value}>{d.text}</Option>);
    return (
          <Select  {...option} value={value}  onChange={this.handleChange}  >
           {optionsItem}
          </Select>
        );
  }

}

export default DyAjaxSelect;
