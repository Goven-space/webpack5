import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';
import AppSelect from '../../../core/components/AppSelect';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const loadDataUrl=URI.CORE_USER_ROLE.getById;
const saveDataUrl=URI.CORE_USER_ROLE.save;
const validateUrl=URI.CORE_USER_ROLE.validate;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=props.appId||'core';
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"roleCode",this.appId,"ROLE");
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

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateUrl,callback);
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="角色属性" key="props"  >
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
            label="所属部门"
            {...formItemLayout4_16}
            hasFeedback
          >
            {
              getFieldDecorator('departmentCode',
                {
                  rules: [{ required: true, message: '请选择角色所属部门!' }],
                  initialValue:this.props.parentDepartmentCode,
                }
              )
              (<DeptTreeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
            }
          </FormItem>
          <FormItem
            label="角色名称"
            {...formItemLayout4_16}
          >
            {
              getFieldDecorator('roleName', {
                rules: [{ required: true, message: '请输入角色名称!' }]
              })
              (<Input placeholder="角色名称" />)
            }
          </FormItem>
          <FormItem
            label="角色编码"
            help='保存后如需要修改需要确认没有被引用，如果已经有引用的情况下修改将造成引用对象出错'
            {...formItemLayout4_16}
            hasFeedback
          >
            {
              getFieldDecorator('roleCode',{
                rules: [{ required: true}]
              })
              (<Input placeholder="角色唯一编码" />)
            }
          </FormItem>
          <FormItem
            label="角色级别"
            help='用来扩展区分角色的不同级别或分类'
            {...formItemLayout4_16}
          >
            {
              getFieldDecorator('roleLevel', {
                rules: [{ required: true}],
                initialValue:'1',
              })
              (<InputNumber min={1} />)
            }
          </FormItem>
          <FormItem
            label="排序"
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
          <FormItem
            label="备注"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
            getFieldDecorator('remark')
            (<Input.TextArea autosize />)
            }
          </FormItem>
        </TabPane>
        <TabPane  tab="API控制属性" key="api"  >
          <FormItem
            label="每秒最大请求速率QPS"
            help='针对本角色的每一个用户的调用速率进行限制,0表示不限制'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {
              getFieldDecorator('qps', {
                rules: [{ required: true}],
                initialValue:'0',
              })
              (<InputNumber min={0} />)
            }
          </FormItem>
          <FormItem
            label="每日最大请求次数"
            help='针对本角色的每一个用户的最大调用次数进行限制,0表示不限制'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {
              getFieldDecorator('maxreq', {
                rules: [{ required: true}],
                initialValue:'0',
              })
              (<InputNumber min={0} />)
            }
          </FormItem>
        </TabPane>
      </Tabs>
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

const NewRole = Form.create()(form);

export default NewRole;
