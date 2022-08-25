import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ApiNodeHeaderConfig from './components/ApiNodeHeaderConfig';
import XmlExportParamsConfig from './components/XmlExportParamsConfig';
import SaveNodeTemplate from '../../components/SaveNodeTemplate';
import NewWebServiceTest from '../../api/NewWebServiceTest';

import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');
require('codemirror/mode/xml/xml');
//Rest API 节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const parseWsdl=URI.SERVICE_CORE_WSDL.parseWsdl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.templateId=this.nodeObj.templateId;
    this.requestBody=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cor="http://coreservice.login">
   <soapenv:Header/>
   <soapenv:Body>
   </soapenv:Body>
</soapenv:Envelope>`;
    this.state={
      mask:false,
      visible: false,
      formData:{requestBody:this.requestBody,inHeaders:'[{"id":0,"headerId":"Content-Type","headerValue":"text/xml"},{"id":1,"headerId":"SOAPAction","headerValue":""}]'},
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

  parseWsdl=()=>{
        this.setState({mask:true});
        let wsdlUrl=this.props.form.getFieldValue("apiUrl");
        AjaxUtils.post(parseWsdl,{wsdlUrl:wsdlUrl},(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError("WSDL载入异常或者路径错误,请查看后台管理日志!");
            }else{
              AjaxUtils.showInfo("成功载入WSDL文件,请在输入参数中进行参数配置!");
              let codeMirror=this.refs.codeMirrorXml.getCodeMirror();
              codeMirror.setValue(data.xmlcode);
              this.state.formData.requestBody=data.xmlcode;
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
          postData.inHeaders=JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
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
    postData.inHeaders=JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
    return postData;
  }

  //获得API的Headwer参数配置
  getNodeHeaderParamsConfig=()=>{
    if(this.refs.nodeHeaderConfig){
      return this.refs.nodeHeaderConfig.getData();
    }else{
      return JSON.parse(this.state.formData.inHeaders);
    }
  }

  //获得API的输出参数配置
  getExportParamsConfig=()=>{
    if(this.refs.exportParams){
      return this.refs.exportParams.getData();
    }else{
      return JSON.parse(this.state.formData.exportParams||'[]');
    }
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

  onTransferHeaderSwitchChange=(checked)=>{
      let r=checked===true?'true':'false';
      let formData=this.state.formData;
      formData.transferHeader=r;
      this.setState({formData:formData});
    }

    updateCode=(newCode)=>{
      this.state.formData.assertCode=newCode; //断言代码
    }

    updateRequestBody=(newCode)=>{
      this.state.formData.requestBody=newCode; //xml代码
    }

    inserDemo=()=>{
        let codeMirror=this.refs.codeMirror.getCodeMirror();
        let code=`//使用HTTP状态码作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var statusCode=engine.getStatusCode(nodeId); //获取当前节点的HTTP状态码
  if(statusCode=="200"){
    result=1; //断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode=code;
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

    //获取请求示例参数
    getRequestBody=()=>{
      return this.state.formData.requestBody;
    }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let inHeaderJson=JSON.parse(this.state.formData.inHeaders);
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
              help="指定任何有意义且能描述本WebService节点的说明"
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
              help="调用结果数据是否输出给本流程发布的API的调用端"
            >
              {getFieldDecorator('responseData',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>输出API结果到调用端</Option>
                  <Option value='0'>不输出API结果</Option>
                  <Option value='2'>多次循环调用时累加结果并输出</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="保存请求参数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="在节点实例中保存API的请求参数，如果数据量较大建议不要保存，注意不保存则不再支持补偿操作"
            >
              {getFieldDecorator('saveRequestBody',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="保存调用结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="在节点实例中保存WebService调用结果，如果数据量较大建议不要保存"
            >
              {getFieldDecorator('saveResponseBody',{initialValue:'1'})
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
          <TabPane  tab="WSDL配置" key="regApi"  >
            <FormItem
              label="WSDL URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定WSDL如:http://ip:8080/api.wsdl,支持服务实例名http://serviceName/api.wsdl,可用${$.http.变量}获取http变量,${变量}取上一节点变量,${$.T0001.变量}取指定节点输出变量作为URL的组成部分'
            >
              {
                getFieldDecorator('apiUrl',{initialValue:'${#config.esb.webservice}/test?wsdl',rules: [{ required: true}]})
                (<Input   />)
              }
            </FormItem>
            <FormItem
              label="异步调用"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='注意:异步调用WebService时调用结果不会传入到后续节点中，后继路由不支持使用断言作为路由条件'
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
              help="当后端WebService有多个时选择负载均衡策略"
            >
              {getFieldDecorator('loadBalanceId',{initialValue:'WeightRandomServer'})
              (
                <AjaxSelect url={listAllBlanceUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
              )}
            </FormItem>
            <FormItem
              label="网络链接超时"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='网络链接的超时时间(默认10秒)单位毫秒'
            >{
              getFieldDecorator('netConnectTimeout',{rules: [{ required: true}],initialValue:"10000"})
              (<InputNumber min={0} />)
              }
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
            <FormItem
              label="重试次数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='调用后端服务失败后是否进行重试(默认0表示不重试)'
            >{
              getFieldDecorator('retryNum',{rules: [{ required: true}],initialValue:"0"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="重试间隔"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='每次重试时的间隔时间0表示立即重试(单位:毫秒)'
            >{
              getFieldDecorator('retrySleep',{rules: [{ required: true}],initialValue:"0"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem label="结果转为JSON" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='后端返回的XML转为JSON传入后继节点，如果不转为JSON则XML作为整体字符串放入到ResponseBody字段中'
            >
              {getFieldDecorator('xmltojson',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="指定XML节点"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("xmltojson")==='1'?'':'none'}}
              help='根据xml的路径作为JSON返回的开始节点格式:节点1#节点2'
            >{
              getFieldDecorator('webServiceXmlSubNode',{initialValue:""})
              (<Input   />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="Header" key="header"  >
            <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} processId={this.processId} nodeId={this.nodeId} />
              <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 16 }}
                help='提示:取上一节点:$.变量,指定节点$.T00001.变量,Header参数$.header.变量,HTTP请求参数$.http.变量,全局变量$.global.变量'
                >
                {getFieldDecorator('transferHeader',{initialValue:'true'})
                (
                  <RadioGroup>
                    <Radio value='true'>透传Header</Radio>
                    <Radio value='false'>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
          </TabPane>
          <TabPane  tab="输入参数" key="params"  >
            <FormItem
              label="参数获取方式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='Http请求表示通过节点Id或别名获取HTTP请求中的数据请求格式为:{"节点Id":{jsondata}}'
            >
              {
                getFieldDecorator('requestBodyAuto', {
                  rules: [{ required: false}],
                  initialValue:'0'
                })
                (
                  <Select>
                    <Option value='1'>HTTP请求分发给本节点的数据</Option>
                    <Option value='4'>指定一个计算规则返回XML字符串作为输入参数</Option>
                    <Option value='0'>自定义一个XML字符串</Option>
                  </Select>
                )
              }
            </FormItem>
            <FormItem
              label="使用计算规则"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("requestBodyAuto")==='4'?'':'none'}}
              help='选择一个规则并返回一个字符串作为Body输入参数'
            >
              {
                getFieldDecorator('requestBodyRuleId', {
                  rules: [{ required: false}]
                })
                (<TreeNodeSelect url={ruleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} />)
              }
            </FormItem>
            <Row style={{display:this.props.form.getFieldValue("requestBodyAuto")==='0'?'':'none'}} >
              <Col span={4} style={{textAlign:'right'}}>指定SOAP XML：</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'320px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirrorXml'
                  value={this.state.formData.requestBody}
                  onChange={this.updateRequestBody}
                  options={{lineNumbers: true,mode: 'xml',autoMatchParens:true}}
                  />
              </div>
                {"组合XML字符串作为输入参数(建议使用SoapUI获取XML组合),取上一节点结果${$.变量},取指定节点结果${$.T00001.变量},获取HTTP请求值:${$.http|header.变量},${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值"}
              </Col>
            </Row>
          </TabPane>
          <TabPane  tab="输出参数" key="exportParamsTag"  >
            <XmlExportParamsConfig ref='exportParams' exportParams={exportParamsJson} />
            把本节点输出的数据进行设置，方便后继节点选择输入参数
          </TabPane>
          <TabPane  tab="断言" key="Assertion"   >
            <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当断言失败时是否跳过节点或者进行补偿运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>正向补偿(直到本节点断言成功后继续执行流程)</Option>
                  <Option value='3'>跳过(事后补偿本节点)</Option>
                  <Option value='0'>跳过(无需补偿)</Option>
                  <Option value='2'>终止流程</Option>
                  <Option value='4'>结束本节点(其他节点可继续执行)</Option>
                </Select>
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
              <a style={{cursor:'pointer'}} onClick={this.inserDemo}>HTTP状态码断言</a> <Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>SQL条件断言</a> <Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
              返回1断言成立，返回0断言失败，返回2继续运行直到断言成立
              </Col>
            </Row>
          </TabPane>
          <TabPane  tab="测试" key="tester"  >
            <NewWebServiceTest
              parentForm={this.props.form}
              getNodeHeaderParamsConfig={this.getNodeHeaderParamsConfig}
              getRequestBody={this.getRequestBody}
              ref="TestService"
            ></NewWebServiceTest>
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

const WebServiceNode = Form.create()(form);

export default WebServiceNode;
