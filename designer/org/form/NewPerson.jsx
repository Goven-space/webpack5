import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,DatePicker,Select,Switch,Upload,Icon,Row,Col,AutoComplete,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import moment from 'moment';

const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_USER_PERSON.getById;
const saveDataUrl=URI.CORE_USER_PERSON.save;
const validateUrl=URI.CORE_USER_PERSON.validate;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=person";
const listModules=URI.CORE_USER_PERSON.listModules; //列出可选模块
const listJobTitle=URI.CORE_APPPROPERTIES.getJsonValue+"?configId=core.PersonJobTitle";//获取职位信息

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      editFlag:this.props.id===''?false:true,
      editDisplay:this.props.id===''?'':'none',
      newDisplay:this.props.id===''?'none':'',
      fileList:[],
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.pwdChangeTime){
              data.pwdChangeTime=moment(data.pwdChangeTime, dateFormat);
            }
            if(data.modules!==undefined && data.modules!==''  && data.modules!==null ){
              data.modules=data.modules.split(",");
            }else{
              data.modules=['apidoc'];
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = () => {
    let password
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  postData[key]=value;
                }
              }
            }
          );
          if(postData.pwdChangeTime){
            postData.pwdChangeTime=postData.pwdChangeTime.format(dateFormat); //日期转换
          }
          postData=Object.assign({},this.state.formData,postData);
          postData.fileList=this.state.fileList.map((file) => {if(file.parentDocId==='0'){return file.uid;}}).join(",");//附件id要上传
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
             this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //检测字段值是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateUrl,callback);
  }

  onSwitchChange=(checked)=>{
    if(checked){
      this.props.form.setFieldsValue({password:''});
      this.state.editDisplay='';
    }else{
      this.props.form.setFieldsValue({password:'-'});
      this.state.editDisplay='none';
    }
  }

  onFileChange=(info)=>{
          this.setState({mask:true});
          let fileList = info.fileList;
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            return;
          }
          fileList = fileList.map((file) => {
            if (file.response) {
              file.uid=file.response[0].id;
              file.url = URI.baseResUrl+file.response[0].filePath;
              file.parentDocId='0';
              this.state.formData.imgUrl=file.response[0].filePath;
            }
            return file;
          });
          this.setState({ fileList });
          this.setState({mask:false});
  }

  validatePassword = (rule, password, callback) => {
	    if(this.state.editDisplay=='none'){
		callback();
		return;
	    }
            var regex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,30}');
            var r=regex.test(password);
            if (!r) {
              callback('密码复杂度不够!');
	      return;
            }

            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
            callback()
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let docImgUrl=this.state.formData.imgUrl;
    let imageUrl='';
    if(docImgUrl!=='' && docImgUrl!==undefined && docImgUrl!==null){
      imageUrl=URI.baseResUrl+docImgUrl;
    }
    const uploadProps={
        name: 'file',
        showUploadList:false,
        className:"avatar-uploader",
        action: uploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };
    return (
      <Form  >
        <Tabs size="large">
          <TabPane  tab="用户属性" key="props"  >
              <FormItem
                label="所属部门"
                {...formItemLayout4_16}
                hasFeedback
              >
                {
                  getFieldDecorator('departmentCode',
                    {
                      rules: [{ required: true, message: '请选择所属部门!' }],
                      initialValue:this.props.departmentCode,
                    }
                  )
                  (<DeptTreeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
                }
              </FormItem>
              <FormItem
                label="用户名"
                help='用户中文名称'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('userName', {
                    rules: [{ required: true}],
                  })
                  (<Input placeholder="用户中文名称" />)
                }
              </FormItem>
              <FormItem
                label='用户登录Id'
                help='必须唯一且注册后不可修改(所有用户建议使用固定长度的字符串作为Id如6位工号等)'
                {...formItemLayout4_16}
                hasFeedback
              >
                {
                  getFieldDecorator('userId',{
                    rules: [{ required: true}],
                  })
                  (<Input placeholder="注册后不可修改" disabled={this.props.id!==''} />)
                }
              </FormItem>
              <FormItem
                label="帐号类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='普通用户表示进入本系统进行开发运维的帐号,应用系统帐号表示仅供外部应用查询和调用API使用的帐号'
              >
                {
                  getFieldDecorator('userType',{initialValue:1})
                  (<Select>
                    <Option value={1}>普通用户帐号</Option>
                    <Option value={2}>应用系统帐号</Option>
                    <Option value={3}>外网公众帐号</Option>
                  </Select>)
                }
              </FormItem>
              <FormItem
                label="职位"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('jobDesc', {
                    rules: [{ required: false}],
                    initialValue:'普通员工',
                  })
                  (<AjaxSelect url={listJobTitle} style={{ width: '30%' }}  />)
                }
              </FormItem>
              <FormItem
                label="修改密码"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 8 }}
                style={{display:this.state.newDisplay}}
              >{
                getFieldDecorator('editPassword')
                (<Switch defaultChecked={false} onChange={this.onSwitchChange} />)
              }
              </FormItem>
              <FormItem
                style={{display:this.state.editDisplay}}
                label="登录密码"
                help='密码建议由大写字母，小写字母、数字、特殊字符组成，最多30个字符(具体验证规则可在平台参数中配置)'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('password', {
                    rules: [{ required: true}]
                  })
                  (<Input type='password'   />)
                }
              </FormItem>
              <FormItem
                label="密码有效日期"
                help='空表示永久有效'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('pwdChangeTime')
                  (<DatePicker format={dateFormat}  />)
                }
              </FormItem>
            </TabPane>
            <TabPane  tab="权限设置" key="acl"  >
              <FormItem
                label="模块权限"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='只有分配appdesigner角色后才能生效,当前用户具有的模块权限'
              >{
                getFieldDecorator('modules')
                (<AjaxSelect url={listModules} style={{ width: '30%' }}  options={{showSearch:true,mode:'multiple'}} />)
              }
              </FormItem>
              <FormItem
                label="appKey"
                help="API使用appKey认证时用户传入的appKey"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('appKey')
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="token有效期"
                help="指定用户的token的过期时间默认为小时数，分钟请使用minute#30,如果为空表示使用系统默认的有效期设置"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('tokenExpiresTime')
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="数据加解密密码"
                help="当API网关进行数据加解密时每个用户使用的加密密码"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('secretkey')
                  (<Input type='password' />)
                }
              </FormItem>
              <FormItem
                label="绑定IP"
                help="绑定IP后表示此用户只能使用绑定的IP调用本系统的API多个用逗号分隔如：192.168.1.*"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('ip')
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="请求速率QPS"
                help='针对本用户的调用速率进行限制,0表示不限制'
              {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('qps', {
                    rules: [{ required: false}],
                    initialValue:'0',
                  })
                  (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="请求次数"
                help='针对本用户的每日最大调用API次数进行限制,0表示不限制'
                 {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('maxreq', {
                    rules: [{ required: false}],
                    initialValue:'0',
                  })
                  (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="有效服务实例"
                help="指定绑定IP以及速率控制时有效的服务实例名(*号表示控制所有服务实例)如仅在网关服务器生效则填写:gateway即可"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('aclServiceNames',{initialValue:'*'})
                  (<Input />)
                }
              </FormItem>
            </TabPane>
            <TabPane  tab="更多设置" key="api"  >
              <FormItem
                label="状态"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('state',{initialValue:'1'})
                  (<Select placeholder="当前状态">
                    <Option value="1">在职</Option>
                    <Option value="2">离职</Option>
                    <Option value="3">退休</Option>
                    <Option value="4">失效</Option>
                  </Select>)
                }
              </FormItem>
              <FormItem
                label="语言"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('language',{initialValue:'CN'})
                  (<Select >
                    <Option value="CN">中文</Option>
                    <Option value="EN">英文</Option>
                  </Select>)
                }
              </FormItem>
              <FormItem
                label="邮件地址"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('mail', {
                  rules: [{
                    type: 'email', message: 'The input is not valid E-mail!',
                  }],
                })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="手机号"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('mobilePhone')
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="积分"
                help='可用积分，API计费时可用'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('points', {
                    rules: [{ required: true}],
                    initialValue:10000,
                  })
                  (<InputNumber min={1} />)
                }
              </FormItem>
              {
                this.state.formData.createTime===undefined?'':
                <FormItem
                  label="注册时间"
                  {...formItemLayout4_16}
                >
                  {this.state.formData.createTime}
                </FormItem>
              }
              {
                this.state.formData.editTime===undefined?'':
                <FormItem
                  label="修改时间"
                  {...formItemLayout4_16}
                >
                  {this.state.formData.editTime}
                </FormItem>
              }
          </TabPane>
          <TabPane  tab="头像" key="photo"  >
            <div style={{minHeight:'300px'}}>
            <Upload {...uploadProps}  >
                {
                  imageUrl ?
                    <img src={imageUrl} alt="" className="avatar" /> :
                    <Icon type="plus" className="avatar-uploader-trigger" />
                }
                <div >点击上传头像</div>
            </Upload>
            </div>
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

const NewPerson = Form.create()(form);

export default NewPerson;
