import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber,Row,Col,Tooltip,AutoComplete} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';

const LIST_VALIDATE_BEANS=URI.SERVICE_PARAMS_CONFIG.validateBeans;
const ListErrorCodeForSelect_URL=URI.SERVICE_ERRORCODE_CONFIG.listForSelect;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.configId=this.props.configId;
    this.listErrorCodeUrl=ListErrorCodeForSelect_URL+"?configId="+this.configId;
    this.state={
      mask:true,
      formData:this.props.currnetEditRow,
    };
  }

  componentDidMount(){
    FormUtils.setFormFieldValues(this.props.form,this.state.formData);
  }

  onSubmit = () => {
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
          this.props.close(postData);
          //AjaxUtils.showInfo("注意:修改后要点击保存配置才能生效!");
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="参数Id"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('fieldId', {rules: [{ required: true}]})
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="参数中文说明"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('fieldName', {rules: [{ required: true}]})
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="验证规则"
          {...formItemLayout4_16}
          help='验证规则由注册为ValidateBean的类执行验证,该规则类必须继承IBaseValidateBean接口'
        >
          {
            getFieldDecorator('validateBeanId')
            (<AjaxSelect url={LIST_VALIDATE_BEANS} options={{allowClear:true}} defaultData={{text:'-无-',value:''}} />)
          }
        </FormItem>
        <FormItem
          label="规则参数"
          {...formItemLayout4_16}
          help='当指定了验证规则后如果，指定规则的输入参数'
        >
          {
            getFieldDecorator('validateBeanArgs')
            (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem
          label="绑定状态码"
          {...formItemLayout4_16}
          help='状态码可在输出配置中进行管理,当验证不通过时输出本状态码及状态码中配置的提示信息'
        >
          {
            getFieldDecorator('errorCode')
            (<AjaxSelect url={this.listErrorCodeUrl} options={{allowClear:true}} defaultData={{text:'-无-',value:''}} />)
          }
        </FormItem>
        <FormItem
          label="验证提示"
          {...formItemLayout4_16}
          help='自定义验证不通过时的提示信息,优先于错误码中定义的消息'
        >
          {
            getFieldDecorator('tip')
            (<Input  />)
          }
        </FormItem>
        <FormItem label="隐藏" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='隐藏本参数，不显示在输入参数中'
        >
          {getFieldDecorator('hidden',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="验证中断" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='验证不通过时不再验证后继参数'
        >
          {getFieldDecorator('breakFlag',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <Row>
          <Col span={8} >
            <FormItem
              label="最小长度"
              labelCol={{ span: 12 }}  wrapperCol={{ span: 2 }}
            >
              {
                getFieldDecorator('minLength')
                (<InputNumber min={0} />)
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="最大长度"
              labelCol={{ span: 8 }}  wrapperCol={{ span: 6 }}
            >
              {
                getFieldDecorator('maxLength')
                (<InputNumber min={0} />)
              }
            </FormItem>
          </Col>
        </Row>
        <FormItem
          label="自动编码"
          {...formItemLayout4_16}
          help='对输入的参数值自动进行编码'
        >
          {getFieldDecorator('enCode',{initialValue:0})
          (<Select  >
              <Option value={0}>不编码</Option>
              <Option value={1}>对&lt;&gt;进行编码</Option>
              <Option value={2}>对单引号进行编码</Option>
              <Option value={3}>&lt;&gt;和单引号进行编码</Option>
              <Option value={4}>全部进行UTF-8编码</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="缺省值"
          {...formItemLayout4_16}
          help='当传入参数为空时,系统自动计算并给参数设定默认值填写:{$config.变量id}可以引用平台或应用中的配置变量'
        >
          {
            getFieldDecorator('defaultValue')
            (<AutoComplete  >
                <Option value="{$userId}">当前登录用户Id</Option>
                <Option value="{$userName}">当前登录用户名</Option>
                <Option value="{$id}">生成一个UUID</Option>
              </AutoComplete>)
          }
        </FormItem>
        <FormItem
          label="参数示例值"
          help='在API文档说明的输入参数中显示或在API测试时自动填写示例值'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sampleValue')
            (<Input.TextArea  autosize />)
          }
        </FormItem>
        <FormItem
          label="后端API参数映射"
          help='注册API时映射到后端API的参数名Id，空表示直接透传'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('mapFieldId')
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="参数顺序"
          help='通过JavaBean发布API时执行方法的第几个参数,第一个参数为1(0表示不指定)'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('order',{initialValue:0})
            (<InputNumber min={0} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存修改的配置
          </Button>
        </FormItem>

      </Form>
    );
  }
}

export default Form.create()(form);
