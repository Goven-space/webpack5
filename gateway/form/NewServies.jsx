import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_GATEWAY_SERVICES.getById;
const saveDataUrl=URI.CORE_GATEWAY_SERVICES.save;

//新增后端服务

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData(); //载入表单数据
  }

  loadData(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      //载入表单数据
      this.setState({mask:true});
      let url=loadDataUrl+"?id="+id;
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

  onSubmit = () => {
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
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
            this.setState({mask:false});
              if(data.state===false){
                message.error(data.msg);
              }else{
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
      <Form  >
        <FormItem  label="服务名称" help='任意可描述本服务的名称'  {...formItemLayout4_16} >
          {
            getFieldDecorator('name', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="protocol"   {...formItemLayout4_16}  hasFeedback >
          {
            getFieldDecorator('protocol',{rules: [{ required: true}],initialValue:'http'})
            (<Select>
              <Option value='http'>http</Option>
              <Option value='https'>https</Option>
            </Select>)
          }
        </FormItem>
        <FormItem  label="Host" help='指定后端服务所在的域名或IP如:192.168.1.2,192.168.1.3多个地址用逗号分隔'   {...formItemLayout4_16} >
          {
            getFieldDecorator('host', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="port" help='如果host是多个时port必须也用逗号分隔成多个且一一对应如:80,81'    {...formItemLayout4_16} >
          {
            getFieldDecorator('port', {rules: [{ required: false}],initialValue:'80'})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="path" help='可以指定基础路径必须以/开始'  {...formItemLayout4_16} >
          {
            getFieldDecorator('path', {rules: [{ required: false}],initialValue:''})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('status',{initialValue:1})
          (            <RadioGroup>
                        <Radio value={1}>启用</Radio>
                        <Radio value={0}>停用</Radio>
                      </RadioGroup>)
          }
        </FormItem>
        <FormItem  label="提示信息" help='停用后API返回的提示信息'  {...formItemLayout4_16} >
          {
            getFieldDecorator('stopmsg', {rules: [{ required: false}],initialValue:'此服务正在维护中!'})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="服务维护者" help='指定本服务联系人员的姓名'  {...formItemLayout4_16} >
          {
            getFieldDecorator('serviceUserName', {rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="联系电话" help='指定本服务维护人员的电话'  {...formItemLayout4_16} >
          {
            getFieldDecorator('serviceUserTel', {rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="唯一Id" help='系统自动生成(无需手动修改)'  {...formItemLayout4_16} >
          {
            getFieldDecorator('id')
            (<Input />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
