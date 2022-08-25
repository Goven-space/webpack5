import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as FormUtils from '../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../core/components/UserAsynTreeSelect';

//发布API变更通知

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_APIPORTAL_CHANGE.publish; //发布API的服务

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.currentRecord=this.props.currentRecord;
    this.closeModal=this.props.closeModal;
    this.state={
      mask:false,
      formData:this.currentRecord,
    };
  }

  componentDidMount(){
    this.state.formData.apiId=this.currentRecord.id;
    this.state.formData.apiUrl=this.currentRecord.mapUrl;
    this.state.formData.apiName=this.currentRecord.configName;
    this.state.formData.followUser='1';
    this.state.formData.apiVersion=this.currentRecord.version;
    FormUtils.setFormFieldValues(this.props.form,this.state.formData);
  }

  onSubmit = (closeFlag=true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <FormItem
        label="API id"
        help='任意能描述本API id'
        style={{display:'none'}}
        {...formItemLayout4_16}
      >
        {
          getFieldDecorator('apiId',{rules: [{ required: true}]})
          (<Input />)
        }
      </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('apiName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="API的地址"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('apiUrl',{rules: [{required: true}]})
            (<Input  style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="版本"
          help="API的版本"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('apiVersion',{rules: [{required: true}]})
            (<Input  style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="通知用户"
          {...formItemLayout4_16}
          help='指定要接收通知的用户'
        >{
          getFieldDecorator('userId',{rules: [{ required: false}],initialValue:''})
          (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
        }
        </FormItem>
        <FormItem
          label="范围选项"
          help='是否通知所有关注本API的用户'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('followUser')
          (<RadioGroup>
            <Radio value='1'>通知所有关注用户</Radio>
            <Radio value='0'>否</Radio>
          </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="简要说明"
          help='一句话描述本次变更的主要功能改进或差异'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('title',{rules: [{ required: true}],initialValue:'API版本变更通知'})
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="变更内容"
          help='详细说明API变更的参数及返回数据等'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('body',{rules: [{ required: true}],initialValue:''})
          (<Input.TextArea  autoSize />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
