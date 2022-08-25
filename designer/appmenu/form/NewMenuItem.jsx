import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Select,Radio,Checkbox,Row,Col,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import RolesSelect from '../../../core/components/RolesSelect';
import PermissionSelect from '../../../core/components/PermissionSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const RadioGroup = Radio.Group;
const Option = Select.Option;

const loadDataUrl=URI.CORE_APPMENU_ITEM.getById;
const saveDataUrl=URI.CORE_APPMENU_ITEM.save;
const validateUrl=URI.CORE_APPMENU_ITEM.validate;
const treeUrl=URI.CORE_APPMENU_ITEM.tree;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.parentNodeId=this.props.parentNodeId;
    this.categoryId=this.props.categoryId;
    this.treeNodeSelctUrl=treeUrl+"?categoryId="+this.categoryId;
    this.state={
      mask:false,
      formData:{},
      FieldsConfig:[],
      isTreeData:'',
      checkedValue:{},
    };
  }

  componentDidMount(){
    this.loadFormData();
  }

  //载入表单数据
  loadFormData=()=>{
    let id=this.id;
    if(id===undefined || id===''){
        this.props.form.setFieldsValue({parentNodeId:this.parentNodeId||'root'});
        FormUtils.getSerialNumber(this.props.form,"nodeId",this.appId,"MENU");
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
          Object.keys(values).forEach((key)=>{
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  let value=this.props.form.getFieldValue(key);
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  //普通字符串
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.categoryId=this.categoryId;
          postData.appId=this.appId;
          // console.log(postData);
          // return;
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

  //检测是否有重复值
  checkExist=(rule, value, callback)=>{
    let url=validateUrl+"?categoryId="+this.categoryId+"&nodeId="+value+"&id="+this.id;
    AjaxUtils.get(url,(data)=>{
            if(data.state===false){
               callback([new Error('节点Id不能为空且不能重复,请更换其他值!')]);
            }else if(data.state===true){
              callback();//显示为验证成功
            }else{
              callback([new Error('验证服务异常')]);
            }
    });
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.eventCode=newCode; //sqlcode 存在业务模型的filters字段中
    this.setState({
      formData: formData,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="菜单属性" key="props"  >
            <FormItem key='parentNodeId'  label="上级菜单" {...formItemLayout4_16} hasFeedback>
            {
              getFieldDecorator('parentNodeId',{rules: [{ required: true}]})
              (<TreeNodeSelect url={this.treeNodeSelctUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
            }
            </FormItem>
            <FormItem
              label="菜单名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定任何有意义的名称"
            >
              {
                getFieldDecorator('menuName', {
                  rules: [{ required: true}]
                })
                (<Input placeholder="菜单名称" />)
              }
            </FormItem>
            <FormItem
              label="菜单唯一Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="唯一Id不允许重复"
            >
              {
                getFieldDecorator('nodeId', {
                  rules: [{ required: true}]
                })
                (<Input  placeholder="菜单Id" />)
              }
            </FormItem>
            <FormItem
              label="菜单URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定可能链接到的URL地址,可用变量{host}可表示当前主机url,{ip}当前服务器ip,{port}服务所在端口"
            >
              {
                getFieldDecorator('url')
                (<Input placeholder="菜单URL" />)
              }
            </FormItem>
            <FormItem
              label="菜单ICON"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定前端可能使用的ICON图标"
            >
              {
                getFieldDecorator('icon')
                (<Input placeholder="菜单icon" />)
              }
            </FormItem>
            <FormItem
              label="自定义属性"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定任何自定义的字符串属性"
            >
              {
                getFieldDecorator('props')
                (<Input  />)
              }
            </FormItem>
            <FormItem label="菜单打开方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
            >
              {getFieldDecorator('openType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>默认</Radio>
                  <Radio value='2'>新窗口中打开</Radio>
                  <Radio value='3'>覆盖当前窗口</Radio>
                  <Radio value='4'>右则iframe中打开</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label='绑定权限' labelCol={{ span: 4 }}  wrapperCol={{ span: 18 }} >
            {
              getFieldDecorator('permission')
              (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
            }
            </FormItem>
            <FormItem label='排除权限' labelCol={{ span: 4 }}  wrapperCol={{ span: 18 }} >
            {
              getFieldDecorator('excPermission')
              (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
            }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:"1001"})
              (<InputNumber min={1001} />)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
            >
              {
                getFieldDecorator('remark')
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
              <Button onClick={this.props.closeModal.bind(this,false)}  >
                取消
              </Button>
            </FormItem>

      </Form>

      </Spin>
    );
  }
}

export default Form.create()(form);
