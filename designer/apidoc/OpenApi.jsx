import React from 'react';
import { Form, Input, Button, Spin,Card,Switch} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const exportUrl=URI.CORE_OPENAPI.ExportUrl;
const ButtonGroup = Button.Group;

//显示OpenAPI国际文档

class form extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.serviceId;
    this.beanId=this.props.beanId;
    this.appId=this.props.appId;
    this.state={
      mask:false,
      format:'json',
      formData:{data:''},
      showApiType:"Service",
    };
  }

  componentDidMount(){
    this.loadData(this.state.format);
  }

  showApiTypeChange=(type)=>{
    this.state.showApiType=type;
    this.loadData(this.state.format);
  }

  loadData=(format)=>{
    this.setState({format:format,mask:true});
    //载入表单数据
    let url="";
    if(this.state.showApiType==='Service'){
      url=exportUrl+"?serviceId="+this.serviceId+"&format="+format;
    }else if(this.state.showApiType==='BeanId'){
      url=exportUrl+"?beanId="+this.beanId+"&format="+format;
    }else if(this.state.showApiType==='AppId'){
      url=exportUrl+"?appId="+this.appId+"&format="+format;
    }
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({formData:data});
        }
    });
  }

  render() {
    let content=this.state.formData.data;
    let format=this.state.format;
    let showApiType=this.state.showApiType;
    if(this.state.format==='json'){
        content=AjaxUtils.formatJson(content);
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{marginBottom:'10px'}}>
        <ButtonGroup >
          <Button type={format==='json'?"primary":""} onClick={this.loadData.bind(this,"json")}  >JSON格式</Button>
          <Button type={format==='yaml'?"primary":""} onClick={this.loadData.bind(this,"yaml")}   >YAML格式</Button>
        </ButtonGroup >
        {' '}
        <ButtonGroup style={{display:'none'}}>
          <Button type={showApiType==='Service'?"primary":""} onClick={this.showApiTypeChange.bind(this,"Service")}   >当前服务</Button>
          <Button type={showApiType==='AppId'?"primary":""} onClick={this.showApiTypeChange.bind(this,"AppId")}   >按应用</Button>
        </ButtonGroup >
        </div>
        <Input.TextArea value={content} autosize={{ minRows: 10,maxRows:1500}} />

      </Spin>
    );
  }
}

//<Button type={showApiType==='BeanId'?"primary":""} style={{display:this.beanId===''?'none':''}} onClick={this.showApiTypeChange.bind(this,"BeanId")}   >按BeanId</Button>

export default Form.create()(form);
