import React from 'react';
import ReactDOM from 'react-dom';
import {TreeSelect} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

class TreeNodeSelect extends React.Component {
  constructor(props){
    super(props);
    this.url=this.props.url;
    this.labelId=this.props.labelId;
    this.valueId=this.props.valueId;
    this.option=this.props.options||{};
    this.defaultData=this.props.defaultData,
    this.state = {
      treeData:[],
    }
  }

  componentDidMount=()=>{
    //发送ajax请求
    AjaxUtils.get(this.url,(data)=>{
      if(this.defaultData!==undefined){
        if(this.defaultData instanceof Array && data!==undefined){
          this.defaultData.map(item=>{data.unshift(item)});
        }else{
          data.unshift(this.defaultData)
        }
      }
      data=this.loop(data);
      this.setState({treeData:[{title:'root',key:'root',value:'root',children:data}]});
    });
  }

  loop = (data=[]) =>{
    data.map((item) => {
      if (item.children!==undefined) {
        item.title=item[this.labelId];
        if(this.props.isParentDisable) {
          item.disabled = true
        }
        if(this.option.multiple!=undefined && this.option.multiple===true && this.valueId){
          item.value=item[this.valueId].split(",");
        }else{
          item.value=item[this.valueId];
        }
        this.loop(item.children);
      }else{
        item.key=item[this.valueId];
        if(this.labelId!=undefined){
          data.map((item)=>{
            item.title=item[this.labelId];
          });
        }
        if(this.valueId!=undefined){
          data.map((item)=>{
            if(this.option.multiple!=undefined && this.option.multiple===true){
              item.value=item[this.valueId].split(",");
            }else{
              item.value=item[this.valueId];
            }
          });
        }
      }
  });
  return data;
 }


  handleChange=(value, label, extra)=>{
    this.props.onChange(value, label, extra);
  }

  render() {
    let option=this.props.options||{};
    let value=this.props.value||'';
    if(option.multiple!=undefined && option.multiple===true){
        if(value instanceof Array){
            //已经是数据不用处理
        }else{
          //是字符串要分成数据
          if(value===undefined || value===null || value===''){
            value=[];
          }else{
            value=value.split(",");
          }
        }
    }
    return (
          <TreeSelect
              {...option}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择"
              treeData={this.state.treeData}
              value={value}
              onChange={this.handleChange}
              treeDefaultExpandedKeys={['root']}
          />
        );
  }

}

export default TreeNodeSelect;
