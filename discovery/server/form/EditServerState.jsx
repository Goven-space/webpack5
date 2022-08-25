import React from 'react';
import { Form, Select, Input, Button, message,Card,Icon,Spin,Col,Radio,InputNumber} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_INSSERVER.save;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:this.props.data,
    };
  }

  componentDidMount(){
    if(this.state.formData!=undefined){
      FormUtils.setFormFieldValues(this.props.form,this.state.formData);
    }
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!=undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功,请刷新页面!");
                if(this.props.close!=undefined){this.props.close(true);}
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
      <Form  >
        <FormItem  label="服务实例名称"   {...formItemLayout4_16} help='ServiceName字母或数字组成(同一集群服务名称必须相同)' >
          {
            getFieldDecorator('serviceName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="服务器唯一Id"   {...formItemLayout4_16} help='ServerId服务器唯一标识ID(不可重复)' >
          {
            getFieldDecorator('serverId', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="服务访问URL"   {...formItemLayout4_16} help='服务提供的基础路径如:http://192.168.0.1/rest' >
          {
            getFieldDecorator('serviceBaseUrl', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="服务器IP"   {...formItemLayout4_16}  >
          {
            getFieldDecorator('serverIP',{rules: [{ required: true}]})
            (<Input placeholder="IP地址"  />)
          }
        </FormItem>
        <FormItem  label="端口"   {...formItemLayout4_16}  >
          {
            getFieldDecorator('serverPort',{rules: [{ required: true}]})
            (<Input placeholder="服务端口"  />)
          }
        </FormItem>
        <FormItem  label="权重" help='权重为1-10的数字'  {...formItemLayout4_16}  help='权重可决定此服务器获得请求流量的大小'  >
          {
            getFieldDecorator('weight',{rules: [{ required: true}],initialValue:10})
            (<InputNumber min={0} max={100} />)
          }
        </FormItem>
        <FormItem  label="集群标识"  {...formItemLayout4_16}  help='如果是集群服务器,同一集群下标识必须相同' >
          {
            getFieldDecorator('serverClusterFlag',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="侦听URL"  {...formItemLayout4_16} help='如果是手动注册的服务器可以填写一个侦听的URL如果没有响应就会被应为是失效,只支持GET请求' >
          {
            getFieldDecorator('listenerUrl',{rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="侦听结果"  {...formItemLayout4_16} help='填写侦听URL返回的结果如果为空表示只要有返回就是正常，如果填写了结果则只有返回相等字符串才算有效' >
          {
            getFieldDecorator('listenerResult',{rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="上线时间"  {...formItemLayout4_16} help='自动更新时使用，手动注册时无需填写' >
          {
            getFieldDecorator('startTime',{rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="最后更新"  {...formItemLayout4_16} help='自动更新时使用，手动注册时无需填写' >
          {
            getFieldDecorator('lastUpdateTime',{rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="更新模式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='服务器状态信息更新模式,如果是手动注册的请选择为手动更新'
        >{getFieldDecorator('manualMode',{initialValue:'1'})
          (
            <RadioGroup>
              <Radio value='0'>自动更新</Radio>
              <Radio value='1'>手动更新</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="服务器状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='活沃表示可提供服务的实例,失效表示已超时没有更新自动失效的服务，强制下线表示手动强制下线的服务实例'
        >
          {
            getFieldDecorator('state',{initialValue:'1'})
            (<RadioGroup>
              <Radio value='1'>活沃</Radio>
              <Radio value='0'>失效(可自动恢复)</Radio>
              <Radio value='2'>强制下线</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="事件接收API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='在服务下线时发送消息给指定API，只支持POST请求，可填写微信或钉钉的API URL'
        >{
          getFieldDecorator('waringUrl')
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input  />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
        </FormItem>
      </Form>
      </Spin>
    );
  }
}

const EditServerState = Form.create()(form);

export default EditServerState;
