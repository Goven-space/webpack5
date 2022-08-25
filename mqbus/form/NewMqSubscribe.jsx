import React,{Fragment} from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,InputNumber,Divider,AutoComplete,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.MQBUS.CORE_DATASOURCE_MONITOR.getById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.MQBUS.CORE_DATASOURCE_MONITOR.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=Kafka,mqtt,jms,RabbitMQ,rocketmq,RocketMQ_Local";
const ListBeansByInterfaceUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;
const SelectTopicUrl=URI.MQBUS.MQ_TOPIC_MGR.select; //选择topic
const mqSendSdkTypeUrl=URI.MQBUS.MQ_Producer_MESSAGE.listMqSendSdkType; //获取MQ发送sdk类型
// RocketMq数据源类型
const rocketMqConfigType = "rocketmq";
// RabbitMq数据源类型
const rabbitMqConfigType = "RabbitMQ";

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.beanUrl=ListBeansByInterfaceUrl+"?interface=cn.restcloud.framework.core.base.IMessageReceived";
    this.state={
      mask:false,
      mqSendSdkTypeList:[],
      rocketMqSourceFlag:false,
      rabbitMqSourceFlag: false,
      formData:{},
    };
  }

  componentDidMount(){
      this.getMqSendSdkType();
      if(this.props.id===''){return;}
      let url=GetById+"?id="+this.id;
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.rocketmq_messageType){
              this.setState({rocketMqSourceFlag:true})
            }
            this.getDataSourceList(data);
            this.setState({formData:data});
          }
      });
  }

  getDataSourceList = (formData)=>{
    AjaxUtils.get(dataSourceSelect,(data)=>{
      let configType = this.getConfigTypeByConfig(data, formData.dataSourceId);
      if(configType === rabbitMqConfigType){
        this.setState({rabbitMqSourceFlag:true})
      }
      FormUtils.setFormFieldValues(this.props.form,formData);
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
        postData = Object.assign({}, this.state.formData,postData);
        postData.appId = this.appId;
          let dataSourceId = postData.dataSourceId;
          let configType = this.getConfigTypeByConfig(this.childrenRef.state.treeData, dataSourceId);
          if(configType !== rocketMqConfigType){
            postData.rocketmq_messageType="";
            postData.rocketMqTag = "";
            postData.rocketmq_threadNums = "20";
          }
          if(configType !== rabbitMqConfigType){
            postData.rabbitmq_exchangeName="";
            postData.rabbitmq_routingKey = "";
            postData.rabbitmq_currentLimiting = "1";
          }
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

  inserDemo=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//responseBody为发送结果,resdoc为结果转为Document对像
//返回1表示断言成立,0表示断言失败
function assert(responseBody,resdoc){
  var errorCode=resdoc.get("errorCode");
  if(errorCode=="0"){
    return 1; //断言成立
  }else{
    return 0;
  }
}`;
      codeMirror.setValue(code);
      this.state.formData.assertCode=code;
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.assertCode=newCode; //断言代码
  }

  getMqSendSdkType = () => { 
    AjaxUtils.get(mqSendSdkTypeUrl + "?mqType=rocketmq",(data)=>{
      if(data){
        this.setState({mqSendSdkTypeList:data})
      }
    });
  }

  handleSelectChange = value => {
    let configType = this.getConfigTypeByConfig(this.childrenRef.state.treeData, value);
    if(configType === rocketMqConfigType){
      let rocketmq_messageType = this.props.form.getFieldValue("rocketmq_messageType");
      if(!rocketmq_messageType){
        this.props.form.setFieldsValue({"rocketmq_messageType":"HTTP"})
      }
      this.setState({rocketMqSourceFlag:true})
    }else{
      this.setState({rocketMqSourceFlag:false});
    }
    if(configType === rabbitMqConfigType){
      this.setState({ rabbitMqSourceFlag: true })
    }else{
      this.setState({rabbitMqSourceFlag:false})
    }
  };

  getConfigTypeByConfig = (treeData, value) => {
    let configType = "";
    const loop = (data) => {
      for (let item of data) {
        if (item.configId === value) return item.configType;
        if (item.children && item.children.length) {
          let config = loop(item.children)
          if (config) return config
        }
      }
    }
    configType = loop(treeData) || ''
    return configType;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const {rocketMqSourceFlag, mask,mqSendSdkTypeList, rabbitMqSourceFlag} = this.state
    const selectMethod = (
        getFieldDecorator('apiMethod',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
      </Select>)
      );

    return (
    <Spin spinning={mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large">
        <TabPane  tab="订阅配置" key="props"  >
          <FormItem
            label="指定数据源"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="选择一个数据源"
          >
            {
              getFieldDecorator('dataSourceId',{rules: [{ required: true}],initialValue:''})
              (<TreeNodeSelect ref={(e) => { this.childrenRef = e }} onChange={this.handleSelectChange} url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
            }
          </FormItem>
          {rocketMqSourceFlag ? 
          <Fragment>
            <FormItem
              label="消息接入方式"
              help='指定RocketMQ消费者订阅消息接入方式'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
                getFieldDecorator('rocketmq_messageType',{initialValue:'HTTP'})
                (
                  (mqSendSdkTypeList !== 0 ?
                  <RadioGroup>
                    {mqSendSdkTypeList.map((item) => { 
                      return <Radio value={item.mqConfigId}>{item.mqConfigName}</Radio>
                    })}
                      
                  </RadioGroup>
                  :null) 
                )
              }
            </FormItem>
            <FormItem
              label="RocketMQ tag"
              help='只针对rocketmq有效，基他mq无效'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
                getFieldDecorator('rocketMqTag')
                (<Input />)
              }
            </FormItem>
          </Fragment>
           : null}
           {rabbitMqSourceFlag ? (
            <Fragment>
              <FormItem
                label="交换机名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rabbitmq_exchangeName")(<Input />)}
              </FormItem>
              <FormItem
                label="Routing Key"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rabbitmq_routingKey")(<Input />)}
              </FormItem>
            </Fragment>
          ): null}
          <FormItem
            label="订阅说明"
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
            label="类型"
            help='指定监听队列的类型'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
              getFieldDecorator('topicType',{initialValue:'topic'})
              (<RadioGroup >
                <Radio value='topic'>topic</Radio>
                <Radio value='queue'>queue</Radio>
              </RadioGroup>)
            }
          </FormItem>
          <FormItem
            label="消息topic/queue"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            hasFeedback
            help="选择消息的topic或queue"
          >
            {
              getFieldDecorator('topic', {rules: [{ required: true}],initialValue:''})
              (<AjaxSelect url={SelectTopicUrl}  />)
            }
              </FormItem>
              {rabbitMqSourceFlag && 
                <FormItem
                  label="消峰限流"
                  help="配置消息监听器一次从MQ拉取指定数量消息进行转发，默认一条"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  {
                    getFieldDecorator('rabbitmq_currentLimiting', { initialValue: 1 })
                      (<InputNumber />)
                  }
                </FormItem>
              }
              {rocketMqSourceFlag && 
                <Form.Item
                  label="消费线程数量"
                  help="配置消费者同时开启多少个线程从MQ拉取消息进行转发，默认20个线程"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  {
                  getFieldDecorator('rocketmq_threadNums', { initialValue: 20 })
                      (<InputNumber />)
                  }
                </Form.Item>
              }
          <FormItem
            label="自动启动"
            help='应用服务器启动时自动启动订阅任务'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
              getFieldDecorator('autoStartFlag',{initialValue:0})
              (<RadioGroup >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>)
            }
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
            label="备注"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
            getFieldDecorator('remark')
            (<Input.TextArea autosize />)
            }
          </FormItem>
        </TabPane>
        <TabPane  tab="数据接收者" key="recive"  >
          <FormItem
            label="数据持久化"
            help='监听到的数据持久化到MongoDB中(单条消息不超过16M)'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
              getFieldDecorator('logType',{initialValue:0})
              (<RadioGroup >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>)
            }
          </FormItem>
          <FormItem
            label="重试次数"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='失败时最大可重试次数,0表示不重试'
          >{
            getFieldDecorator('maxResendCount',{rules: [{ required: true}],initialValue:"5"})
            (<InputNumber min={0} />)
            }
          </FormItem>
          <FormItem
            label="数据发送方式"
            help='有可能一次消费到多条数据，是否逐条拆分后发送'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
              getFieldDecorator('splitDataFlag',{initialValue:false})
              (<RadioGroup >
                <Radio value={false}>否</Radio>
                <Radio value={true}>逐条发送</Radio>
              </RadioGroup>)
            }
          </FormItem>
          <FormItem
            label="数据发送到"
            help='指定监听到的数据发送给目标API或JavaBean'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
              getFieldDecorator('receiveType',{initialValue:'API'})
              (<RadioGroup >
                <Radio value='API'>调用API</Radio>
                <Radio value='BEAN'>启动任务或业务逻辑</Radio>
                <Radio value='NO'>不发送</Radio>
              </RadioGroup>)
            }
          </FormItem>
          <FormItem
            label="接收数据的API"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            style={{display:this.props.form.getFieldValue("receiveType")==='API'?'':'none'}}
            help="指定一个本系统的API(API可以是开发的、网关中注册的、API编排的、ETL数据接收API等)用于接收数据"
          >
            {
              getFieldDecorator('apiUrl', {
                rules: [{ required: true}],initialValue:'http://localhost/rest/api'
              })
              (<Input addonBefore={selectMethod} />)
            }
          </FormItem>
          <FormItem
            label="请求超时时间"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            style={{display:this.props.form.getFieldValue("receiveType")==='API'?'':'none'}}
            help='执行超时时间(默认3秒)单位毫秒'
          >{
            getFieldDecorator('connectTimeout',{rules: [{ required: true}],initialValue:"30000"})
            (<InputNumber min={0} />)
            }
          </FormItem>
          <FormItem
            label="业务处理逻辑"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            style={{display:this.props.form.getFieldValue("receiveType")==='BEAN'?'':'none'}}
            help="指定一个业务逻辑来接收数据，业务逻辑的JavaBean必须继承IMessageReceived接口"
          >{
            getFieldDecorator('beanId')
            (<AjaxSelect url={this.beanUrl} valueId='beanId' textId="beanName" defaultData={{"beanName":'无',"beanId":''}} />)
            }
          </FormItem>
          <FormItem
            label="流程Id或逻辑参数"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            style={{display:this.props.form.getFieldValue("receiveType")==='BEAN'?'':'none'}}
            help="指定JavaBean方法的缺省参数，不指定则传空字符串"
          >
            {
              getFieldDecorator('defaultParams', {
                rules: [{ required: false}],initialValue:''
              })
              (<Input  />)
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
        </TabPane>
        <TabPane  tab="结果断言" key="assert"  >
          <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
            <CodeMirror ref='codeMirror'
            value={this.state.formData.assertCode}
            onChange={this.updateCode}
            options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
            />
          </div>
          <a style={{cursor:'pointer'}} onClick={this.inserDemo}>JS断言示例</a> <Divider type="vertical" />{' '} 注意:修改断言后要重新启动监听才能生效
        </TabPane>
        {/* <TabPane  tab="其他参数" key="other"  >
          <FormItem
            label="RocketMQ tag"
            help='只针对rocketmq有效，基他mq无效'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
            getFieldDecorator('rocketMqTag')
            (<Input  />)
            }
          </FormItem>
          <FormItem
            label="RabbitMQ交换机"
            help='只针对RabbitMQ有效，基他mq无效'
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >{
            getFieldDecorator('rabbitmq_exchangeName')
            (<Input  />)
            }
          </FormItem>
        </TabPane> */}
        </Tabs>
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
