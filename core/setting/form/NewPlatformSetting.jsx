import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';
import AppSelect from '../../components/AppSelect';
import AjaxSelect from '../../components/AjaxSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APPSETTING.save;
const loadDataUrl=URI.CORE_APPSETTING.getById;
const listAllUrl=URI.CORE_ENVIRONMENTS.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||'core';
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
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.environment!=='' && data.environment!==undefined){
              data.environment=data.environment.split(",");
            }
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
                AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="适用环境"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定本配置在什么环境下有效(core.properties中的ConfigEnvironment属性配置当前环境)"
        >
          {
            getFieldDecorator('environment', {initialValue:'ALL'})
            (<AjaxSelect url={listAllUrl}  options={{showSearch:true}} valueId="configId" textId="configId" />)
          }
        </FormItem>
        <FormItem
          label="设置说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本设置的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="设置说明" />)
          }
        </FormItem>

        <FormItem
          label="本设置唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='同一环境下唯一'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true, message: '请输入唯一id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="配置值"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定该配置的值'
        >{
          getFieldDecorator('configValue')
          (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
          }
        </FormItem>
        <FormItem
          label="加密"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择为加密时系统会自动进行加密'
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

const NewPlatformSetting = Form.create()(form);

export default NewPlatformSetting;
