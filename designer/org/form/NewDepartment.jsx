import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';

const FormItem = Form.Item;
const loadDataUrl=URI.CORE_ORG_DEPT.getById;
const saveDataUrl=URI.CORE_ORG_DEPT.save;
const validateUrl=URI.CORE_ORG_DEPT.validate;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
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
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.form.resetFields();
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
          label="上级部门"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('parentDepartmentCode',
              {
                rules: [{ required: true, message: '请选择上级部门!' }],
                initialValue:this.props.parentDepartmentCode,
              }
            )
            (<DeptTreeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="部门名称"
          help='指定部门的名称'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('departmentName', {
              rules: [{ required: true, message: '请输入部门名称!' }]
            })
            (<Input placeholder="部门或科室名称" />)
          }
        </FormItem>
        <FormItem
          label="部门编码"
          help='部门唯一编码由字母或数字组成'
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('departmentCode',{
              rules: [{required: true}]
            })
            (<Input   />)
          }
        </FormItem>
        <FormItem
          label="部门级别"
          help='参考级别可以使用默认值'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('departmentLevel', {
              rules: [{ required: true}],
              initialValue:'1',
            })
            (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem
          label="同级排序"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sort', {
              rules: [{ required: true}],
              initialValue:'1001',
            })
            (<InputNumber min={1001} />)
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

const NewDepartment = Form.create()(form);

export default NewDepartment;
