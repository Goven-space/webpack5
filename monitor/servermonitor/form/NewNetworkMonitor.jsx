import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//网络连通性测试

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.LIST_MONITOR_NETWORK.getById;
const SubmitUrl=URI.LIST_MONITOR_NETWORK.save;

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
    const selectMethod = (
        getFieldDecorator('apiMethod',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
      </Select>)
      );

      const testSelectMethod = (
          getFieldDecorator('testApiMethod',{ initialValue:'GET'})
          (<Select style={{width:80}} >
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
        </Select>)
        );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="监听器名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本监听器的说明"
        >
          {
            getFieldDecorator('configName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="监听类型"
          help='指定监听类型'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('monitorType',{initialValue:1})
            (<RadioGroup >
              <Radio value={1}>网络连通性侦测</Radio>
              <Radio value={0}>API可用性侦测</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="监听间隔"
          help='指定每次监听的间隔时间单位毫秒'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('sleep',{rules: [{ required:true}],initialValue:2000})
          (<InputNumber min={0}  />)
          }
        </FormItem>
        <FormItem
          label="超时时间"
          help='指定连接的超时时间单位毫秒'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('timeout',{rules: [{ required:true}],initialValue:3000})
          (<InputNumber min={0}  />)
          }
        </FormItem>
        <FormItem
          label="本地服务器IP"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("monitorType")===1?'':'none'}}
          help="指定本服务器的IP地址"
        >
          {
            getFieldDecorator('localIP', {rules: [{ required: false}],initialValue:'192.168.1.X'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="远程服务器IP"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("monitorType")===1?'':'none'}}
          help="指定远程服务器的IP地址"
        >
          {
            getFieldDecorator('remoteIP', {rules: [{ required: false}],initialValue:'172.168.1.X'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="远程服务器端口"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("monitorType")===1?'':'none'}}
          help="指定远程服务器要侦测的端口"
        >
          {
            getFieldDecorator('remotePort', {rules: [{ required: false}],initialValue:'8080'})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="要测试的API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("monitorType")===1?'none':''}}
          help="指定要定时测试的API地址"
        >
          {
            getFieldDecorator('testApiUrl', {
              rules: [{ required: false}],initialValue:'http://192.168.1.X/rest/api'
            })
            (<Input addonBefore={testSelectMethod} />)
          }
        </FormItem>
        <FormItem
          label="失败时接收预警的API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="当连通性测试失败时指定用来接收失败消息的API,只能是post和body参数"
        >
          {
            getFieldDecorator('apiUrl', {
              rules: [{ required: true}],initialValue:'http://localhost/rest/api'
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="预警消息内容"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='填失测试失败时要post给api的json内容'
        >{
          getFieldDecorator('body',{rules: [{ required: true}],initialValue:'网络连通性测试失败'})
          (
            <Input.TextArea autoSize style={{minHeight:'100px'}}   />
          )}
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
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
