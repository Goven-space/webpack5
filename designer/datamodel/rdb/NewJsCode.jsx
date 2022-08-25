import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import DataModelSelect from '../form/DataModelSelect';
import PermissionSelect from '../../../core/components/PermissionSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_SQLCONFIG.GetById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_SQLCONFIG.Save; //存盘地址
const ValidateConfigId=URI.CORE_SQLCONFIG.ValidateConfigId;
const connectionsUrl=URI.CORE_DATASOURCE.listAll+"?configType=RDB,Driver";
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.categoryId=this.props.categoryId==='AllSql'?'':this.props.categoryId;
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".SqlCategory&rootName=SQL分类";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"CODE");
        return;
      }
      let url=GetById.replace("{id}",this.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = (closeFlag) => {
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
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功,可以点击代码编写脚本!");
                if(closeFlag){
                  this.props.close(true);
                }
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
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定SQL所属分类,可以在应用配置的分类管理中进行分类管理'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId,
              }
            )
            (<TreeNodeSelect  url={this.menuUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="脚本名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本脚本的说明"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help='指定一个全局的唯一Id'
        >
          {
            getFieldDecorator('configId', {
              rules: [{required: true}]
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="脚本语法"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择脚本使用的语法'
        >
          {
            getFieldDecorator('codeType', {rules: [{ required: true}],initialValue:"java"})
            (<Select >
              <Option value="js">JavaScript</Option>
              <Option value="java">Java</Option>
              <Option value="python">Python</Option>
              <Option value="shell">Shell</Option>
            </Select>)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存
          </Button>
            {' '}
            <Button onClick={this.props.close.bind(this,false)}  >
              关闭
            </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewJsCode = Form.create()(form);

export default NewJsCode;
