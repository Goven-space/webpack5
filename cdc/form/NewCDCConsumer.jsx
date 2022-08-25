import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import AjaxSelect from '../../core/components/AjaxSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById   = host+"/rest/cdc/consumer/getById"; //获取数据接口地址
const SubmitUrl = host+"/rest/cdc/consumer/save";; //保存数据接口地址
// const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=Kafka,mqtt,jms,RabbitMQ,rocketmq";
const ListBeansByInterfaceUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;
const SelectTopicUrl = host+"/rest/cdc/topic/select"; //选择topic
const SelectProcessUrl = host+"/rest/cdc/consumer/process/select"; //选择ETL流程


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.code="";
    this.codeUrl=webappsProjectName+"/res/ace/eventcode.html?codeType=properties";
    this.beanUrl=ListBeansByInterfaceUrl+"?interface=cn.restcloud.framework.core.base.IMessageReceived";
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
            this.code = data.code;
            // this.setCode(data.code); // 等待iframe onload
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
          postData.code = this.getCode(); //获取编辑代码
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

  setCode=(code)=>{
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(code||this.code);
  }
  getCode=()=>{
    let mframe = this.refs.myframe;
    return mframe.contentWindow.editor.getValue();
  }

  insertProducer=()=>{
    let code=`# 
# 消费者（不配置时系统将自动生成），集群环境下不要配置
#client.id=consumer-1
# 消费组（不配置时系统将自动生成），相同groupId时，只有一个clientId能消费
#group.id=group-1
# 每个批次间隔毫秒，默认为为5分钟
max.poll.interval.ms=300000
# 每个批次返回的最大记录数，默认值为500
max.poll.records=500`;
  this.setCode(code);
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

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="消费者名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="唯一名称，如：mysql-subscribe"
        >
          {
            getFieldDecorator('docName', {
              rules: [{ required: true}],
              initialValue: "mysql-subscribe"
            })(<Input />)
          }
        </FormItem>
        <FormItem
          label="kafka.bootstrap.servers"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="kafka集群地址(写集群中某一个可用的broker的地址即可)，如127.0.0.1:9092"
        >
          {getFieldDecorator("bootstrapServers", {
            rules: [{ required: true }],
            initialValue: "127.0.0.1:9092"
          })(<Input />)}
        </FormItem>
        <FormItem
          label="主题"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="kafka topic"
        >
          {
            getFieldDecorator('topic', {rules: [{ required: true}],initialValue:'cdc-record'})
            (<AjaxSelect url={SelectTopicUrl}  />)
          }
        </FormItem>
        <FormItem
          label="监听类型"
          help='每次获取单条还是多条'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('docType',{initialValue:0})
            (<RadioGroup >
              <Radio value={1}>单条</Radio>
              <Radio value={0}>批量</Radio>
            </RadioGroup>)
          }
        </FormItem>

        <FormItem
          label="更多消费者参数配置"
          help={<span><a style={{cursor:'pointer'}} onClick={this.insertProducer}>示例</a> <Divider type="vertical" /> </span>}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator("code")(<Input.TextArea hidden />)}
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'300px',width:'100%',border:'none'}}/>
          </div>
        </FormItem>

        <FormItem
          label="自动启动"
          help='应用服务器启动时自动启动订阅任务'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('autoStart',{initialValue:0})
            (<RadioGroup >
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="指定ETL流程"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="请选择一个要执行的ETL流程"
        >
          {
            getFieldDecorator('processId',{rules: [{ required: true}],initialValue:''})
            (<TreeNodeSelect url={SelectProcessUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="数据格式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='${body}表示原始数据可以进行格式化如:{data:${body}}'
        >{
          getFieldDecorator('requestBody',{rules: [{ required: true}],initialValue:'${body}'})
          (
            <Input.TextArea autoSize style={{minHeight:'100px'}}   />
          )}
        </FormItem>
        <FormItem
          label="调试"
          help='调试输出API的用结果'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('debug',{initialValue:'true'})
            (<RadioGroup >
              <Radio value='true'>是</Radio>
              <Radio value='false'>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="结果断言"
          help='API或JavaBean返回的结果中包含关键字符串时表示接收成功,否则表示目标端接收失败'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('resultKeyWord')
          (<Input  />)
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
