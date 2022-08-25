import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';


const FormItem = Form.Item;
const Option = Select.Option;
const GetConfigUrl=URI.CORE_PERMISSIONS.GetConfigById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_PERMISSIONS.SubmitUrl; //存盘地址
const validatePermissionId=URI.CORE_PERMISSIONS.validatePermissionId;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        FormUtils.getSerialNumber(this.props.form,"permissionId",this.appId,"ACL");
        return;
      }
      let url=GetConfigUrl.replace("{id}",this.props.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data});
            if(data.permissionId==='' || data.permissionId===undefined || data.permissionId===null){
              data.permissionId=this.appId+".";
            }
            FormUtils.setFormFieldValues(this.props.form,data);
            if(data.authFlag===true){
              this.state.authDisplay='';
            }
          }
      });
  }

  showInfo=(msg)=>{
        notification.info({
            message: '操作提示',
            duration: 3,
            description: msg
        });
  }

  onSubmit = (closeFlag) => {
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
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state){
                this.setState({mask:false});
                this.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab(true);
                }
              }else{
                this.showInfo(data.msg);
              }
          });
      }
    });
  }

  //检测permissionId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    if(value.indexOf(this.props.appId+".")){
      callback([new Error('id必须以appId.开头!')]); //显示为验证错误
    }
    AjaxUtils.checkExist(rule,value,id,validatePermissionId,callback);
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
              rules: [{ required: true}],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="权限唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="注意:保存后如果要修改请确认权限没有被引用，否则引用的对象将会出错"
        >
          {
            getFieldDecorator('permissionId', {
              rules: [{required: true}],
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="权限名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本权限的名称"
        >
          {
            getFieldDecorator('permissionName', {
              rules: [{ required: true, message: 'Please input the title!' }]
            })
            (<Input />)
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

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewPermission = Form.create()(form);

export default NewPermission;
