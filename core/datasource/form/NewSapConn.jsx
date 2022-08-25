import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//sap链接器

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_DATASOURCE.getById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_DATASOURCE.save; //存盘地址
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.categoryId=this.props.categoryId;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.appId+".dataSourceCategory&rootName=数据源分类";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        this.state.formData.id=AjaxUtils.getId(22); //给一个默认值
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
          postData.testConn=testConn;
          postData.configType='SAP';
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
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
          help='指定本数据源所属的分类'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId=='all'?'':this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.categoryUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="数据源名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本数据源的说明"
        >
          {
            getFieldDecorator('configName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据源唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定一个唯一Id在获取数据库链接时使用(默认id为sap)"
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}],initialValue:'sap'
            })
            (<Input />)
          }
        </FormItem>
        <FormItem label="SAP服务器IP" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的服务的IP'
        >
          {getFieldDecorator('host', {rules: [{ required: true}],initialValue:'192.168.1.1'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="SAP Client" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的Client'
        >
          {getFieldDecorator('client', {rules: [{ required: true}],initialValue:'999'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="SAP 系统号" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的系统号'
        >
          {getFieldDecorator('sysnr', {rules: [{ required: true}],initialValue:'01'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="用户名" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的用户名'
        >
          {getFieldDecorator('userId', {rules: [{ required: true}],initialValue:''})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的密码'
        >
          {getFieldDecorator('password', {rules: [{ required: true}],initialValue:''})
          (
            (<Input type='password' />)
          )}
        </FormItem>
        <FormItem label="加密密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='选择是表示保存时对密码进行一次加密'
        >
          {getFieldDecorator('changePassword',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="语言" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的语言'
        >
          {getFieldDecorator('lang', {rules: [{ required: true}],initialValue:'ZH'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="SAProuter" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAProuter Stirng'
        >
          {getFieldDecorator('sapRouter', {rules: [{ required: false}],initialValue:''})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="最大链接数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的最大链接数'
        >
          {getFieldDecorator('maxConnectNum', {rules: [{ required: true}],initialValue:'0'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="最大链接线程数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定SAP的最大链接线程数'
        >
          {getFieldDecorator('maxThreadNum', {rules: [{ required: true}],initialValue:'0'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="组/服务器" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='组链接的:服务器id'
        >
          {getFieldDecorator('sapGroup', {rules: [{ required: false}],initialValue:''})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="R3Name" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='组链接的:R3NAME'
        >
          {getFieldDecorator('sapR3NAME', {rules: [{ required: false}],initialValue:''})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem label="端口号" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='组链接的:组链接时的端口号'
        >
          {getFieldDecorator('sapMSSERV', {rules: [{ required: false}],initialValue:'3601'})
          (
            (<Input  />)
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存退出</Button>{' '}
          <Button type="ghost" onClick={this.onSubmit.bind(this,false,'testConn')}  >保存并测试链接</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
