import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ApiNodeHeaderConfig from './ApiNodeHeaderConfig';
import XmlExportParamsConfig from './components/XmlExportParamsConfig';
import NewWebServiceTest from '../../api/NewWebServiceTest';

import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/xml/xml');

//webservice 节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址

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
          let title=postData.pNodeId+"#"+postData.pNodeName;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,title);
                }
              }
          });
      }else{
        AjaxUtils.showError("请填写完整后再提交!");
      }
    });
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

  closeModal=()=>{
      this.setState({visible: false,templateVisible:false});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,templateVisible:false});
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
          <TabPane  tab="WebService配置" key="regApi"  >
            <FormItem
              label="WebServce提交URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定WSDL如:http://ip:8080/api.wsdl或者WebService执行的URL地址,支持变量${变量}作为url的一部分'
            >
              {
                getFieldDecorator('apiUrl',{initialValue:'http://ip/test?wsdl',rules: [{ required: true}]})
                (<Input   />)
              }
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
              help='后端返回的XML转为JSON传入后继节点，如果不转为JSON则XML作为整体字符串放入到responseBody变量中'
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
            <FormItem
              label="XML转为JSON后数组所在字段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='Xml转为JSON后指定数组所在字段Id如果为对像则放入数组的第一行中,空表示不放入data中'
            >
              {
                getFieldDecorator('jsonDataKey', {
                  rules: [{ required: false}],
                  initialValue:'',
                })
                (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="Header" key="header"  >
            <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} processId={this.processId} nodeId={this.nodeId} />
          </TabPane>
          <TabPane  tab="输入参数" key="inParamsTag"  >
            <Row  >
              <Col span={4} style={{textAlign:'right'}}>指定SOAP XML：</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'320px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirrorXml'
                  value={this.state.formData.requestBody}
                  onChange={this.updateRequestBody}
                  options={{lineNumbers: true,mode: 'xml',autoMatchParens:true}}
                  />
              </div>
                {"请使用velocity模板取indoc中的或全局变量填充到XML输入参数中如:$变量,$data "}
              </Col>
            </Row>
          </TabPane>
          <TabPane  tab="断言" key="Assertion"   >
            <FormItem label="断言失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当断言失败时是否终止流程执行,如果不终止则交由后继路由线判断'
            >
              {getFieldDecorator('assertAction',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>终止流程</Radio>
                  <Radio value='0'>继续运行后继节点</Radio>
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
