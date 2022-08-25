import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DubboNodeParamsConfig from './components/DubboNodeParamsConfig';
import SaveNodeTemplate from '../../components/SaveNodeTemplate';
import ApiExportParamsConfig from './components/ApiExportParamsConfig';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//Rest API 节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.templateId=this.nodeObj.templateId;
    this.state={
      mask:false,
      visible: false,
      formData:{inParams:'[]',inHeaders:'[]'},
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.key+"&templateId="+this.templateId;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              if(JSON.stringify(data)!=='{}'){
                this.setState({formData:data});
                FormUtils.setFormFieldValues(this.props.form,data);
              }
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
          postData.processId=this.processId;
          postData.pNodeType=this.nodeObj.nodeType;
          postData.inParams=JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
          postData.exportParams=JSON.stringify(this.getExportParamsConfig()); //输出参数转换为字符串
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName);
                }
              }
          });
      }else{
        AjaxUtils.showError("请填写完整后再提交!");
      }
    });
  }

  ///保存为模板时从此方法中获取节点的配置数据
  getNodeFormData=()=>{
    let postData=this.props.form.getFieldsValue();
    postData.appId=this.appId;
    postData.pNodeType=this.nodeObj.nodeType;
    postData.inParams=JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
    return postData;
  }

  //获得API的输入参数配置
  getNodeInParamsConfig=()=>{
    if(this.refs.nodeParamsConfig){
      return this.refs.nodeParamsConfig.getData();
    }else{
      return JSON.parse(this.state.formData.inParams);
    }
  }

  //获得API的Headwer参数配置
  getNodeHeaderParamsConfig=()=>{
    if(this.refs.nodeHeaderConfig){
      return this.refs.nodeHeaderConfig.getData();
    }else{
      return JSON.parse(this.state.formData.inHeaders);
    }
  }

    updateCode=(newCode)=>{
      let formData=this.state.formData;
      formData.assertCode=newCode; //断言代码
    }

    inserDemo2=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//执行sql条件作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var sql="select * from table where id=1";
  var rdoc=RdbUtil.getDoc(sql);
  if(rdoc!==null){
    result=1; //SQL记录存在时断言成立
  }
  return result;
}`;
      codeMirror.setValue(code);
      this.state.formData.assertCode=code;
    }

    inserDemo3=()=>{
        let codeMirror=this.refs.codeMirror.getCodeMirror();
        let code=`//indoc为API执行的结果数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(DocumentUtil.getString(indoc,"userId")==="admin"){
    result=1; //返回结果符合要求断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode=code;
    }

    showTemplateModal=(action)=>{
      this.setState({templateVisible: true});
    }
    closeModal=()=>{
        this.setState({visible: false,templateVisible:false});
    }
    handleCancel=(e)=>{
        this.setState({visible: false,templateVisible:false});
    }
    //获得规则的输出参数配置
    getExportParamsConfig=()=>{
      if(this.refs.exportParams){
        return this.refs.exportParams.getData();
      }else{
        return JSON.parse(this.state.formData.exportParams||'[]');
      }
    }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let inParamsJson=this.state.formData.inParams==undefined?[]:JSON.parse(this.state.formData.inParams);
    let exportParamsJson=this.state.formData.exportParams==undefined?[]:JSON.parse(this.state.formData.exportParams);

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title='保存为自定义节点' maskClosable={false}
          width='800px'
          style={{ top: 60 }}
          visible={this.state.templateVisible}
          onCancel={this.handleCancel}
          footer=''
          >
          <SaveNodeTemplate close={this.closeModal} getNodeFormData={this.getNodeFormData} appId={this.appId} ></SaveNodeTemplate>
      </Modal>
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large">
        <TabPane  tab="基本属性" key="props"  >
            <FormItem
              label="节点名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="指定任何有意义且能描述本节点的说明"
            >
              {
                getFieldDecorator('pNodeName', {
                  rules: [{ required: true}],
                  initialValue:this.nodeObj.text
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="节点Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="节点唯一id"
            >
              {
                getFieldDecorator('pNodeId', {
                  rules: [{ required: true}],
                  initialValue:this.nodeObj.key
                })
                (<Input  disabled={true} />)
              }
            </FormItem>
            <FormItem
              label="节点别名"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="别名可以在进行数据请求或者输出时作为JSON的数据标识使用,空值表示使用节点Id作为标识"
            >
              {
                getFieldDecorator('pNodeAlias', {
                  rules: [{ required: false}]
                })
                (<Input   />)
              }
            </FormItem>
            <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="Dubbo调用结果数据是否输出给本流程的调用端"
            >
              {getFieldDecorator('responseData',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
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
          </TabPane>
          <TabPane  tab="接口配置" key="serviceConfig"  >
            <FormItem
              label="Dubbo服务名"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请指定Dubbo的application.name的服务名,可以使用${#config.变量}获取配置值'
            >
              {
                getFieldDecorator('applicationName', {
                  rules: [{ required: true}],
                  initialValue:'${#config.esb.dubboprovider}',
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="zookeeper地址"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请指定zookeeper注册中心的地址,可以使用${#config.变量}获取配置值'
            >
              {
                getFieldDecorator('zookeeper', {
                  rules: [{ required: true}],
                  initialValue:'${#config.esb.zookeeper}',
                })
                (<Input  />)
              }
            </FormItem>
            <FormItem
              label="接口Class路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定Dubbo提供服务的接口类路径'
            >
              {
                getFieldDecorator('interface', {
                  rules: [{ required: true}]
                })
                (
                  <Input />
                )
              }
            </FormItem>
            <FormItem
              label="接口的方法"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要调用接口的方法名称'
            >
              {
                getFieldDecorator('methodName', {
                  rules: [{ required: true}]
                })
                (
                  <Input />
                )
              }
            </FormItem>
            <FormItem
              label="异步调用"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='注意:异步调用服务时调用结果不会传入到后续节点中，后继路由不支持使用断言作为路由条件'
            >
              {
                getFieldDecorator('asyncFlag', {
                  rules: [{ required: false}],
                  initialValue:'0'
                })
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
            <FormItem label="负载均衡策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="指定后端服务的负载均衡策略"
            >
              {getFieldDecorator('loadBalanceId',{initialValue:''})
              (
                <Select>
                  <Option value='Random' >随机</Option>
                  <Option value='RoundRobin' >按权重轮询</Option>
                  <Option value='LeastActive' >最少活跃调用数</Option>
                  <Option value='ConsistentHash' >一致性Hash</Option>
                  <Option value='' >无</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              label="请求超时时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='执行超时时间(默认30秒)单位毫秒'
            >{
              getFieldDecorator('connectTimeout',{rules: [{ required: true}],initialValue:"30000"})
              (<InputNumber min={0} />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="输入参数" key="params"  >
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}} >
              <DubboNodeParamsConfig ref='nodeParamsConfig' serviceId={this.state.formData.apiId} inParams={inParamsJson}  />
              请按接口方法的参数顺序依次添加参数
            </div>
          </TabPane>
          <TabPane  tab="输出参数" key="exportParamsTag"  >
            <ApiExportParamsConfig ref='exportParams' exportParams={exportParamsJson} />
            把本节点输出的数据进行设置，方便后继节点选择输入参数
          </TabPane>
          <TabPane  tab="断言" key="Assertion"   >
            <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当断言失败时是否跳过节点或者进行补偿运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>正向补偿(定时正向补偿)</Radio>
                  <Radio value='0'>跳过(无需补偿)</Radio>
                  <Radio value='2'>终止流程</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <Row>
              <Col span={4} style={{textAlign:'right'}}>断言逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.assertCode}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
              <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>SQL条件断言</a> <Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
              返回1断言成立，返回0断言失败，返回2继续运行直到断言成立
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存
          </Button>
          {' '}
          <Button type="ghost" onClick={this.showTemplateModal}  >保存为模板</Button>{' '}
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

const DubboNode = Form.create()(form);

export default DubboNode;
