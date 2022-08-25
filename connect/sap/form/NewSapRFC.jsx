import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//sap RFC

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CONNECT.SAPRFC.getById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CONNECT.SAPRFC.save; //存盘地址
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=SAP";
const ruleSelectUrl=URI.CONNECT.SAP_RULE.select;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.userId=AjaxUtils.getUserId();
    this.categoryId=this.props.categoryId==='all'?'':this.props.categoryId;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.appId+".sapRfcCategory&rootName=SAP函数分类";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){return;}
      let url=GetById+"?id="+this.id;
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

  onSubmit = (closeFlag,testConn='') => {
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
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
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
          help='指定本函数所属的分类'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.categoryUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="函数描述"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本函数的说明"
        >
          {
            getFieldDecorator('functionName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="指定函数所在数据源"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="请选择一个SAP数据源"
        >
          {
            getFieldDecorator('dataSourceId',{rules: [{ required: true}],initialValue:'default'})
            (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="函数名"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定SAP中的RFC函数名"
        >
          {
            getFieldDecorator('functionId', {
              rules: [{ required: true}],initialValue:''
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据转换事件"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定在RFC输入和输出时执行的数据转换规则"
        >
          {
            getFieldDecorator('ruleId', {
              rules: [{ required: false}],initialValue:''
            })
            (<TreeNodeSelect defaultData={[{label:'-无-',value:''}]} url={ruleSelectUrl} options={{style:{width:'100%'},showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}}   />)
          }
        </FormItem>
        <FormItem
          label="创建者"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='只有创建者和超级管理员可管理本函数'
        >{
            getFieldDecorator('creator',{rules: [{ required: false}],initialValue:this.userId})
            (<UserAsynTreeSelect options={{showSearch:true,multiple:false}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
