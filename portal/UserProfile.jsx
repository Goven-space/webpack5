import React from 'react';
import { Form, Input, Button,Spin,Card,Select,Switch,Icon,AutoComplete } from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import * as FormUtils from '../core/utils/FormUtils';
import AjaxSelect from '../core/components/AjaxSelect';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_USER_PERSON.getUserInfo;
const saveDataUrl=URI.CORE_USER_PERSON.updateUserInfo;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{}
    };
  }

  componentDidMount(){
      this.setState({mask:true});
      AjaxUtils.get(loadDataUrl,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = () => {
    let password
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
             this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
              }
          });
      }
    });
  }

  onSwitchChange=(checked)=>{
      this.state.formData.changePassword=checked;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Form  >
              <FormItem
                label='帐号Id'
                help="帐号Id不允许修改"
                {...formItemLayout4_16}
                hasFeedback
              >
                {this.state.formData.userId}
              </FormItem>
              <FormItem
                label="密钥(appkey)"
                help="使用appkey用API时的key,请保管好密钥,如果发现丢失请及时更新密钥"
                {...formItemLayout4_16}
              >
                {this.state.formData.appKey}
              </FormItem>
              <FormItem
                label="帐号名"
                help='用户中文名称'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('userName', {
                    rules: [{ required: true}],
                  })
                  (<Input placeholder="用户中文名称" />)
                }
              </FormItem>
              <FormItem
                label="邮件地址"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('mail', {
                  rules: [{
                    type: 'email', message: 'The input is not valid E-mail!',required: false
                  }],
                })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="手机号"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('mobilePhone',{rules: [{ required: true}]})
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="可用积分"
                {...formItemLayout4_16}
              >
                {this.state.formData.points}
              </FormItem>
              <FormItem
                label="最大QPS"
                help='0表示不限制'
                {...formItemLayout4_16}
              >
                {this.state.formData.qps}
              </FormItem>
              <FormItem
                label="每日最大调用次数"
                help='0表示不限制'
                {...formItemLayout4_16}
              >
                {this.state.formData.maxreq}
              </FormItem>
              <FormItem
                label="修改密码"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 8 }}
              >{
                getFieldDecorator('editPassword')
                (<Switch defaultChecked={false} onChange={this.onSwitchChange} />)
              }
              </FormItem>
              <FormItem
                style={{display:this.state.formData.changePassword?"":"none"}}
                label="旧密码"
                help='请填写旧的密码'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('oldPassword', {
                    rules: [{ required: false}]
                  })
                  (<Input type='password'   />)
                }
              </FormItem>
              <FormItem
                style={{display:this.state.formData.changePassword?"":"none"}}
                label="新密码"
                help='请填写新的密码,密码由数字和字母组成!'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('newPassword', {
                    rules: [{ required: false}]
                  })
                  (<Input type='password'   />)
                }
              </FormItem>
              <FormItem
                style={{display:this.state.formData.changePassword?"":"none"}}
                label="确认新密码"
                help='再次确认新的密码'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('newPassword2', {
                    rules: [{ required: false}]
                  })
                  (<Input type='password'   />)
                }
              </FormItem>
              <FormItem
                label="更换密钥"
                help="选择是则会重新生成一个新的密钥appkey"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 8 }}
              >{
                getFieldDecorator('changeAppKey')
                (<Switch defaultChecked={false} />)
              }
              </FormItem>
              <FormItem wrapperCol={{ span: 8, offset: 4 }}>
                <Button type="primary" onClick={this.onSubmit}  >
                  保存修改
                </Button>
              </FormItem>
            </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
