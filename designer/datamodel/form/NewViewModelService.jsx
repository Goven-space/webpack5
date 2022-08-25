import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//业务视图直接生成服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_DATAMODELS.generateViewService; //生成view配置的服务

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.modelName=this.props.modelName; //配置的名称
    this.modelType=this.props.modelType;
    this.state={
      mask:false,
      formData:[],
    };
  }

  onSubmit = (closeFlag=true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: 'API生成失败',content:data.msg,width:600});
              }else{
                Modal.info({title: 'API生成结果',content:data.msg,width:600});
                this.props.close();
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const QueryMethodType = (
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    let tmpModelId=this.modelId;
    let spos=this.modelId.indexOf(".");
    if(spos!==-1){
      tmpModelId=this.modelId.substring(spos+1,this.modelId.length).toLowerCase();
    }
    const serviceUrl="/rest/"+this.appId+"/"+tmpModelId+"/show";

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="业务视图id"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('modelId',{initialValue:this.modelId})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="服务名"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('serviceName',{rules: [{ required: true}],initialValue:this.modelName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="本服务将直接计算业务视图并输出视图的计算结果JSON"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('serviceUrl',{rules: [{required: true}],initialValue:serviceUrl})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
