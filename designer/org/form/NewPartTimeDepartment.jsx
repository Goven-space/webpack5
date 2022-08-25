import React from 'react';
import { Form, Input, Button, Spin,TreeSelect,Select,Icon } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_USERMAP_PERSON.getById;
const saveDataUrl=URI.CORE_USERMAP_PERSON.save;
const loadTreeJsonUrl=URI.CORE_ORG_DEPT.treeJson;

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
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
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
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  onNodeChange=(value, label, extra)=>{
    this.state.formData.userName=label[0];
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Form >
        <FormItem
          label="用户ID"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('userId',{
             rules: [{ required: true,message:'请选择一个用户'}],
            })
            (<UserAsynTreeSelect onChange={this.onNodeChange}  />)
          }
        </FormItem>
        <FormItem
          label="兼职部门"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('departmentCode',
              {
                rules: [{ required: true, message: '请选择要兼职的部门!' }],
                initialValue:this.props.departmentCode,
              }
            )
            (<DeptTreeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="兼任职位"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('jobDesc', {
              rules: [{ required: true}],
              initialValue:'普通员工',
            })
            (<Select mode='combobox' placeholder="当前状态">
              <Option value="普通员工">普通员工</Option>
              <Option value="总经理">总经理</Option>
              <Option value="经理">经理</Option>
              <Option value="部长">部长</Option>
              <Option value="科长">科长</Option>
              <Option value="主任">主任</Option>
              <Option value="工程师">工程师</Option>
            </Select>)
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

const NewPartTimeDepartment = Form.create()(form);

export default NewPartTimeDepartment;
