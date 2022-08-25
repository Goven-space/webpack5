import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import RolesSelect from '../../core/components/RolesSelect';
import UserAsynTreeSelect from '../../core/components/UserAsynTreeSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import ListClusterServers from '../../core/components/ListClusterServers';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.LIST_APIPORTAL_APPLICATION.save;
const loadDataUrl=URI.LIST_APIPORTAL_APPLICATION.getById;
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId='apiportal';
    this.userId=AjaxUtils.getCookie("userId");
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
            if(data.environment!=='' && data.environment!==undefined){
              data.environment=data.environment.split(",");
            }
            if(data.visibleUserIds!==undefined && data.visibleUserIds!=null && data.visibleUserIds!==''){
              data.visibleUserIds=data.visibleUserIds.split(",");
            }
            if(data.appSuperAdmin!==undefined && data.appSuperAdmin!=null){
              data.appSuperAdmin=data.appSuperAdmin.split(",");
            }
            if(data.defaultVisibleUserIds!==undefined && data.defaultVisibleUserIds!=null && data.defaultVisibleUserIds!==''){
              data.defaultVisibleUserIds=data.defaultVisibleUserIds.split(",");
            }
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
          postData.appId=this.appId;
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
        <Form>
          <Tabs size="large">
            <TabPane  tab="应用属性" key="props"  >
            <FormItem
              label="应用名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="建议与API开发平台中的应用名称保持一致"
            >
              {
                getFieldDecorator('portalAppName', {
                  rules: [{ required: true, message: 'Please input the configName!' }]
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="应用唯一Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='ID由字母数字组成请按业务系统命名如:OA/ERP/HR/CRM等,如果与API开发平台的API进行同步则必须与API开发平台中的应用Id保持一致'
            >
              {
                getFieldDecorator('portalAppId', {
                  rules: [{ required: true, message: '请输入唯一id' }]})
                (<Input  disabled={this.props.id!==''} />)
              }
            </FormItem>
            <FormItem
              label="后端测试服务器IP"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定在API门户中用户对API进行测试时API所在的后端服务IP如:http://192.168.1.1:8080/restcloud,支持变量配置${config.变量}'
            >
              {
                getFieldDecorator('backendBaseUrl', {rules: [{ required: false}],initialValue:''})
                (<AjaxSelect url={listAllServiceNames}  valueId='serviceName' textId='serviceName' options={{showSearch:true,mode:'combobox'}} />)
              }
            </FormItem>
            <FormItem
              label="运行服务器Id"
              help="指定可以运行本应用的服务器Id多个用逗号分隔，*号表示所有服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:'none'}}
            >{
              getFieldDecorator('runServerId',{initialValue:'*'})
              (<ListClusterServers options={{showSearch:true}} />)
            }
            </FormItem>
            <FormItem
              label="应用类型"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定应用的类型默认选择普通应用即可'
            >
              {
                getFieldDecorator('portalAppType',{initialValue:'2'})
                (<Select >
                  <Option value="1">普通应用</Option>
                  <Option value="2">第三方(业务系统)注册的应用</Option>
                  <Option value="3">开发平台应用</Option>
                </Select>)
              }
            </FormItem>
            <FormItem
              label="发布到外网门户"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='是否本应用下的API可以展示到OpenAPI外网门户中'
            >{
                getFieldDecorator('marketFlag',{initialValue:'0'})
                (<RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  />)
              }
            </FormItem>
        </TabPane>
        <TabPane  tab="应用权限" key="acl"  >
            <FormItem
              label="应用管理员"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本应用的管理者,管理者可以修改应用属性可以注册API'
            >{
              getFieldDecorator('appSuperAdmin',{rules: [{ required: true}],initialValue:this.userId})
              (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
            }
            </FormItem>
            <FormItem
              label="应用可见范围"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本应用的可见范围的用户,空表示所有用户均可浏览本应中的API'
            >{
              getFieldDecorator('visibleUserIds')
              (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
            }
            </FormItem>
            <FormItem
              label="API调用审批"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定API调用申请的审批者(注意:如果选择多个表示依次串行审批),如果不指定则由API的发布者进行审批'
            >{
              getFieldDecorator('approverUserId')
              (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
            }
            </FormItem>
            <FormItem
              label="API默认可见范围"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本应用下发布的API的默认可见用户'
            >{
              getFieldDecorator('defaultVisibleUserIds')
              (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
            }
            </FormItem>
          </TabPane>
        </Tabs>
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

export default Form.create()(form);
