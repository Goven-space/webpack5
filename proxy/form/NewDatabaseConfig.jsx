import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete,InputNumber} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import AppSelect from '../../core/components/AppSelect';

//新增数据库配置

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.LIST_TCPIP_NETWORK.getById;
const SubmitUrl=URI.LIST_TCPIP_NETWORK.save;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
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
                AjaxUtils.showInfo(data.msg);
                if(closeFlag){
                  this.props.close(true);
                }
              }
          });
      }
    });
  }

  formatRequestBodyJsonStr=()=>{
    let value=this.props.form.getFieldValue("requestBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"requestBody":value.trim()});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="配置名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本配置的说明"
        >
          {
            getFieldDecorator('configName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="最大连接数"
          help='指定最大可用连接数'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('maxConnect',{rules: [{ required:true}],initialValue:1000})
          (<InputNumber min={0}  />)
          }
        </FormItem>
        <FormItem
          label="本地服务器IP"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定本API网关服务器的可用IP地址，*表示系统从属性配置文件中读取"
        >
          {
            getFieldDecorator('localIP', {rules: [{ required: false}],initialValue:'*'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="本地端口"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定本API网关服务器需要侦听的端口"
        >
          {
            getFieldDecorator('localPort', {rules: [{ required: false}],initialValue:'8080'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="远程服务器IP"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定远程服务器的IP地址"
        >
          {
            getFieldDecorator('remoteIP', {rules: [{ required: false}],initialValue:'172.168.1.X'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="远程数据库服务器端口"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定远程数据库服务器要所在端口"
        >
          {
            getFieldDecorator('remotePort', {rules: [{ required: false}],initialValue:'8080'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="连接超时时间"
          help='指定链接数据读取的超时时间(毫秒)'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('timeout',{rules: [{ required:true}],initialValue:3000})
          (<InputNumber min={0}  />)
          }
        </FormItem>
        <FormItem
          label="记录日志"
          help='记录网络链接的日志数据'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('saveSocketTime',{initialValue:0})
            (<RadioGroup >
              <Radio value={0}>否</Radio>
              <Radio value={1}>是</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="自动识别SQL语句"
          help='系统自动分析并识别系统的SQL语句'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('analyseDataType',{initialValue:1})
            (<RadioGroup >
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="数据库类型"
          help='选择数据库类型'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('dataType',{initialValue:'oracle'})
            ( <Select>
                <Option value='oracle'>ORACLE数据库</Option>
                <Option value='mysql'>MYSQL数据库</Option>
                <Option value='mssql'>MSSQL数据库</Option>
              </Select>)
          }
        </FormItem>
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='识别的SQL发布为API时所属的应用appId'
        >
          {
            getFieldDecorator('targetAppId', {
              rules: [{ required: true, message: '请选择一个应用!' }],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autoSize />)
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
