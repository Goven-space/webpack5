import React from 'react';
import { Form, Input, Button, Spin,TreeSelect,Select,Icon } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import RolesSelect from '../../../core/components/RolesSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_USER_ROLEMEMBER.getById;
const saveDataUrl=URI.CORE_USER_ROLEMEMBER.save;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      userDisplay:'',
      deptDisplay:'none',
      roleDisplay:'none',
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
            this.showDisplay();
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

  showDisplay=(v)=>{
    let loadType=v || this.props.form.getFieldValue("memberType");
    if(loadType==='USER'){
      this.setState({"userDisplay":'',"deptDisplay":'none',"roleDisplay":'none'});
    }else if(loadType==='DEPT'){
      this.setState({"userDisplay":'none',"deptDisplay":'',"roleDisplay":'none'});
    }else if(loadType==='ROLE'){
      this.setState({"userDisplay":'none',"deptDisplay":'none',"roleDisplay":''});
    }
  }

  onNodeChange=(value, label, extra)=>{
    this.state.formData.memberName=label[0];
    this.state.formData.memberCode=value;
  }
  onRoleChange=(value, label)=>{
    this.state.formData.memberName=label;
    this.state.formData.memberCode=value;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Form >
        <FormItem
          label="成员类型"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('memberType',{initialValue:'USER'})
            (<Select onChange={this.showDisplay}>
              <Option value="USER">用户</Option>
              <Option value="DEPT">部门</Option>
              <Option value="ROLE">角色</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="选择用户"
          {...formItemLayout4_16}
          hasFeedback
          style={{display:this.state.userDisplay}}
        >
          {
            getFieldDecorator('userId',{
             rules: [{ required: true,message:'请选择要添加的用户'}],
            })
            (<UserAsynTreeSelect onChange={this.onNodeChange} />)
          }
        </FormItem>
        <FormItem
          label="选择部门"
          {...formItemLayout4_16}
          hasFeedback
          style={{display:this.state.deptDisplay}}
        >
          {
            getFieldDecorator('departmentCode',
              {
                rules: [{ required: true, message: '请选择要添加的部门!' }]
              }
            )
            (<DeptTreeSelect onChange={this.onNodeChange} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="选择角色"
          {...formItemLayout4_16}
          style={{display:this.state.roleDisplay}}
        >
          {
            getFieldDecorator('roleCode', {
              rules: [{ required: true}]
            })
            (<RolesSelect onChange={this.onRoleChange} options={{showSearch:true}} />)
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

const NewRoleMember = Form.create()(form);

export default NewRoleMember;
