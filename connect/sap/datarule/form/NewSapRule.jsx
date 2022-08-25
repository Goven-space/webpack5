import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../../core/components/UserAsynTreeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CONNECT.SAP_RULE.getById;
const SubmitUrl=URI.CONNECT.SAP_RULE.save;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.userId=AjaxUtils.getUserId();
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.appId+".ruleCategory&rootName=规则分类";
    this.categoryId=this.props.categoryId==='all'?'':this.props.categoryId;
    this.state={
      mask:false,
      RdbDisplay:'',
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        FormUtils.getSerialNumber(this.props.form,"ruleId",this.appId,"RULE");
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
            if(data.categoryId!==undefined && data.categoryId!==null && data.categoryId!==''){
              data.categoryId=data.categoryId.split(",");
            }
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
          help='指定本规则所属的分类'
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
          label="规则唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定一个唯一Id,如果id已被引用修改id会引起错误"
        >
          {
            getFieldDecorator('ruleId', {
              rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="规则名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本规则的说明"
        >
          {
            getFieldDecorator('ruleName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="Class Path"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="空表示由系统自动生成,也可直接指定一个继承了IETLBaseEvent接口的Class类"
        >
          {
            getFieldDecorator('classPath', {
              rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem label="公开方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} style={{display:'none'}}>
          {getFieldDecorator('publicType',{initialValue:1})
          (
            <RadioGroup>
              <Radio value={0}>仅自已可见</Radio>
              <Radio value={1}>公开</Radio>
            </RadioGroup>
          )}
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
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存退出
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

export default Form.create()(form);
