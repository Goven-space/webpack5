import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.LIST_CONFIG_CENTER.save;
const loadDataUrl=URI.LIST_CONFIG_CENTER.getById;
const listAllEnvUrl=URI.CORE_ENVIRONMENTS.listAll;
const listAllAppUrl=URI.LIST_CONFIG_APPLICATION.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||'core';
    this.env=this.props.env||'ALL';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        let data={configAppId:this.appId,environment:this.env};
        FormUtils.setFormFieldValues(this.props.form,data);
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <FormItem
          label="配置Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="配置Id必须在所有应用中保持唯一(在同一应用下只有灰度发布时才允许相同)"
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="配置值"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='任意值'
        >
          {
            getFieldDecorator('configValue')
            (<Input.TextArea  />)
          }
        </FormItem>
        <FormItem
          label="发布环境"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择本配置要发布的环境ALL表示所有环境'
        >{
          getFieldDecorator('environment', {rules: [{ required: true}],initialValue:"ALL"})
          (<AjaxSelect url={listAllEnvUrl}  options={{showSearch:true}} valueId="configId" textId="configId" />)
          }
        </FormItem>
        <FormItem
          label="发布应用"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择本配置要发布的应用,ALL表示属于所有应用的公共配置'
        >{
          getFieldDecorator('configAppId',{rules: [{ required: true}],initialValue:"ALL"})
          (<AjaxSelect url={listAllAppUrl}  options={{showSearch:true}} defaultData={{configAppId:'ALL'}}  valueId="configAppId" textId="configAppId" />)
          }
        </FormItem>
        <FormItem
          label="IP"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='灰度发布时指定要发布的IP地址(如果服务允许动态漂移时不建议指定IP)'
        >{
          getFieldDecorator('ip')
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="加密"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择加密时系统会自动进行加密'
        >{
          getFieldDecorator('passwordValue',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea  style={{maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewConfig = Form.create()(form);

export default NewConfig;
