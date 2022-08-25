import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APPPROPERTIES.save;
const loadDataUrl=URI.CORE_APPPROPERTIES.getById;
const listAllUrl=URI.CORE_ENVIRONMENTS.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
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

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
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
          label="本设置唯一ID"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='必须保持在所有应用中唯一(相同应用下不同环境可重复),建议以appId.开头避免多应用下重复'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true, message: '请输入唯一id' }],initialValue:this.appId+"."})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="配置值"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定该配置的值'
        >{
          getFieldDecorator('configValue', {
              rules: [{ required: true, message: '请输入配置值' }]})
          (<Input.TextArea autosize style={{maxHeight:'450px'}} />)
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
          (<Input.TextArea autosize style={{maxHeight:'450px'}} />)
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

const NewAppProperties = Form.create()(form);

export default NewAppProperties;
