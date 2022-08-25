import React from 'react';
import reqwest from 'reqwest';
import { Form, InputNumber, Input, Button, message,Spin} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const loadDataUrl=URI.CORE_ORG_COMPANY.getById;
const saveDataUrl=URI.CORE_ORG_COMPANY.save;
const validateUrl=URI.CORE_ORG_COMPANY.validate;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{}
    };
  }

  componentDidMount(){
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateUrl,callback);
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Form  >
        <FormItem
          label="机构名称"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('companyName', {
              rules: [{ required: true, message: '请输入机构名称!' }]
            })
            (<Input placeholder="组织机构名称" />)
          }
        </FormItem>
        <FormItem
          label="机构编码"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('companyCode',{
              rules: [{required: true}],
              validateTrigger:['onBlur'], //这里是数组
            })
            (<Input placeholder="机构唯一编码注册后不可修改" disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="排序号"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sort', {
              rules: [{ required: true}],
              initialValue:'1',
            })
            (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
    );
  }
}

const NewCompany = Form.create()(form);

export default NewCompany;
