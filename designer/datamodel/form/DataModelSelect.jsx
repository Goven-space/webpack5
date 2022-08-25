import React from 'react';
import ReactDOM from 'react-dom';
import {Select,Input,Switch} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const selectDataModels=URI.CORE_DATAMODELS.selectDataModels;
const Option = Select.Option;
const InputGroup = Input.Group;

//数据模型选择控件

class DataModelSelect extends React.Component {
  constructor(props){
    super(props);
    this.modelType=this.props.modelType||"all";
    this.options=this.props.options;
    this.defaultData=this.props.defaultData;
    this.dbType=this.props.dbType||"";
    this.appId=this.props.appId;
    this.state = {
      data:props.data||[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        this.loadData();
  }

  loadData=()=>{
        let url=selectDataModels+"?appId="+this.appId+"&modelType="+this.modelType+"&dbType="+this.dbType;
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
    //console.log("ajaxselect render");
    const {data} = this.state;
    const value=this.props.value;
    const option=this.options||{};
    if(this.defaultData!==undefined){
      data.push(this.defaultData);
    }
    const optionsItem = data.map(item => <Option key={item.value} value={item.value}>{item.text}</Option>);

    return (
      <span>
          <Select value={value}  style={{minWidth:'200px'}} onChange={this.handleChange} {...option} >
           {optionsItem}
          </Select>
      </span>
        );
  }
}

export default DataModelSelect;
