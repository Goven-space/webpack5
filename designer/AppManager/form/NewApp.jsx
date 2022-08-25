import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import PermissionSelect from '../../../core/components/PermissionSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.NEW_APP.load;
const saveDataUrl=URI.NEW_APP.save;
const validateUrl=URI.NEW_APP.validate;
const deleteUrl=URI.CORE_FILE.deleteFile;
const getAppCategorys=URI.CORE_CATEGORYNODE.listAllNodes+"?categoryId=AppCategory"

class form extends React.Component{
  constructor(props){
    super(props);
    this.userId=AjaxUtils.getUserId();
    this.categoryId=this.props.categoryId;
    this.state={
      mask:false,
      formData:{},
      fileList:[],
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
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.readRole!==undefined && data.readRole!==''  && data.readRole!==null){
              data.readRole=data.readRole.split(",");
            }else{
              data.readRole=[];
            }
            if(data.designer!==undefined && data.designer!==''  && data.designer!==null){
              data.designer=data.designer.split(",");
            }else{
              data.designer=[];
            }
            if(data.appSuperAdmin!==undefined && data.appSuperAdmin!==''  && data.appSuperAdmin!==null){
              data.appSuperAdmin=data.appSuperAdmin.split(",");
            }else{
              data.appSuperAdmin=[];
            }
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
                AjaxUtils.showError(data.msg);
              }else{
                this.props.close(true);
                AjaxUtils.showInfo("应用成功保存!");
              }
          });
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let icon=this.state.formData.icon;

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
        <Tabs size="large">
          <TabPane  tab="应用属性" key="props"  >
                <FormItem  label="所属分类"   {...formItemLayout4_16} help="请选择应用的所属分类"  >
                  {
                    getFieldDecorator('categoryId',{
                      rules: [{ required: true, message: 'Please input the appId!' }],
                      initialValue:this.categoryId==='ListAllApps'?'':this.categoryId,
                    })
                    (<AjaxSelect valueId="nodeId" textId="nodeText" url={getAppCategorys} />)
                  }
                </FormItem>
                <FormItem  label="应用名称"   {...formItemLayout4_16} help="任意可描述本应用功能或模块的名称" >
                  {
                    getFieldDecorator('appName', {
                      rules: [{ required: true, message: 'Please input the AppName!' }]
                    })
                    (<Input />)
                  }
                </FormItem>
                <FormItem  label="应用Id"   {...formItemLayout4_16}  help='应用Id必须唯一,任意小写英文字母或数字组成，如果应用已经有设计元素修改应用Id会丢失设计元素' >
                  {
                    getFieldDecorator('appId',{rules: [{ required: true}]})
                    (<Input placeholder="应用唯一id"  />)
                  }
                </FormItem>
                <FormItem
                  label="状态"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='指定应用当前的开发进度或状态'
                >
                  {
                    getFieldDecorator('state',{initialValue:'开发中'})
                    (<Select placeholder="当前状态" mode='combobox'>
                      <Option value="DEV">开发中</Option>
                      <Option value="SIT">SIT</Option>
                      <Option value="UAT">UAT</Option>
                      <Option value="END">已完成</Option>
                    </Select>)
                  }
                </FormItem>
                <FormItem label="输出NULL字段" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='默认本应用下的API不输出JSON中为null值的字段,选择是表示本应用下的API需要输出'
                >
                  {getFieldDecorator('serializeNull',{initialValue:false})
                  (
                    <RadioGroup>
                      <Radio value={false}>否</Radio>
                      <Radio value={true}>是</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem
                  label="数据体所在字段Id"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='指定本应用输出JSON时数据体所在字段的Id默认为rows可以修改为data'
                >{
                  getFieldDecorator('dataKey',{initialValue:'rows'})
                  (<Input  />)
                  }
                </FormItem>
                <FormItem
                  label="应用类型"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='指定应用的类型默认选择普通应用即可'
                >
                  {
                    getFieldDecorator('appType',{initialValue:'1'})
                    (<Select >
                      <Option value="1">普通应用</Option>
                      <Option value="0">系统应用</Option>
                      <Option value="2">链接器应用</Option>
                    </Select>)
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
              <TabPane  tab="权限设置" key="acl"  >
                <FormItem
                  label="应用管理员"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='应用管理员可以调用此应用的所有API服务(不受调用权限的控制)'
                >{
                    getFieldDecorator('appSuperAdmin',{rules: [{ required: false}],initialValue:this.userId})
                    (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                  }
                </FormItem>
                <FormItem  label="开发权限"  labelCol={{ span: 4 }}   wrapperCol={{ span: 16 }} help='可以对应用的所有设计进行新增、修改、删除的用户，空表示所有登录用户' >
                  {
                    getFieldDecorator('designer',{initialValue:this.userId})
                    (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                  }
                </FormItem>
                <FormItem
                  label="API调用权限"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='空表示所有登录用户均可调用本应用的API'
                >{
                  getFieldDecorator('readRole')
                  (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
                }
                </FormItem>
                <FormItem
                  label="匿名调用"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='允许未登录的用户调用本应用的API服务(允许后API调用权限设置将失效)'
                >{getFieldDecorator('anonymousFlag',{initialValue:false})
                  (
                    <RadioGroup>
                      <Radio value={false}>否</Radio>
                      <Radio value={true}>是</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem
                  label="版本"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >{
                  getFieldDecorator('version',{initialValue:'1.0'})
                  (<Input  />)
                  }
                </FormItem>
          </TabPane>
        </Tabs>
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
