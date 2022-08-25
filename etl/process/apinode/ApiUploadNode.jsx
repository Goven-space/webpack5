import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import SelectServices from '../../components/SelectServices';
import SaveNodeTemplate from '../../components/SaveNodeTemplate';
import ApiNodeParamsConfig from './ApiNodeParamsConfig';
import ApiNodeHeaderConfig from './ApiNodeHeaderConfig';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//API文件上传

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl=URI.ETL.RULE.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.templateId=this.nodeObj.templateId;
    this.pNodeRole="api";
    this.state={
      mask:false,
      visible: false,
      templateVisible: false,
      formData:{inParams:'[]',inHeaders:'[{"headerId":"Content-Type","headerValue":"multipart/form-data"}]'},
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
          postData.pNodeRole=this.pNodeRole;
          postData.inParams=JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
          postData.inHeaders=JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
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

  ///保存为模板时从此方法中获取节点的配置数据
  getNodeFormData=()=>{
    let postData=this.props.form.getFieldsValue();
    postData.appId=this.appId;
    postData.pNodeType=this.nodeObj.nodeType;
    postData.inParams=JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
    postData.inHeaders=JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
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

    //服务选择相关函数
    saveSelectedServices=(item)=>{
        //调用子窗口获取已经选中的行
        let selectedRows=this.refs.SelectServices.getSelectedRows();
        let formData=this.state.formData;
        formData.apiId=selectedRows[0].id;
        formData.apiUrl=selectedRows[0].mapUrl;
        // console.log(formData.apiId);
        let requestBodyFlag=selectedRows[0].requestBodyFlag===true?'true':'false';
        this.setState({formData:formData,visible:false});
        this.props.form.setFieldsValue({apiUrl:formData.apiUrl,methodType:selectedRows[0].methodType,requestBodyFlag:requestBodyFlag});
    }

    showModal=(action)=>{
      this.setState({visible: true,action:action});
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
    //服务选择结束

    onParamsEditTypeSwitchChange=(checked)=>{
      let r=checked===true?'true':'false';
      let formData=this.state.formData;
      formData.requestBodyFlag=r;
      this.setState({formData:formData});
    }

    onTransferHeaderSwitchChange=(checked)=>{
      let r=checked===true?'true':'false';
      let formData=this.state.formData;
      formData.transferHeader=r;
      this.setState({formData:formData});
    }

    updateCode=(newCode)=>{
      let formData=this.state.formData;
      formData.assertCode=newCode; //断言代码
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
        let code=`//indoc为API返回的JSON结果数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(engine.getDataTotalCount(indoc)>0){
    result=1; //返回数据大于0时断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode=code;
      }

      inserDemo3=()=>{
          let codeMirror=this.refs.codeMirror.getCodeMirror();
          let code=`//indoc为API返回的JSON结果数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(DocumentUtil.getString(indoc,"status")==="ok"){
    result=1; //返回结果符合要求断言成立
  }
  return result;
}`;
          codeMirror.setValue(code);
          this.state.formData.assertCode=code;
      }

  formatRequestBodyJsonStr=(fieldId)=>{
    let value=this.props.form.getFieldValue(fieldId);
    value=AjaxUtils.formatJson(value);
    let obj={};
    obj[fieldId]=value.trim();
    this.props.form.setFieldsValue(obj);
  }

  //获取节点输入参数
  getNodeSampleInParamsConfig=()=>{
    let value=this.props.form.getFieldValue("nodeInParams");
    if(value===''){
      let jsonObj={};
      let paramsConfigList=this.getNodeInParamsConfig();
      paramsConfigList.forEach((v,index,array)=>{
        jsonObj[v.paramsId]="";
      });
      value=JSON.stringify(jsonObj);
    }
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"nodeInParams":value});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
      </Select>)
    );
    let inParamsJson=this.state.formData.inParams==undefined?[]:JSON.parse(this.state.formData.inParams);
    let inHeaderJson=this.state.formData.inHeaders==undefined?[]:JSON.parse(this.state.formData.inHeaders);
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title='选择API服务' maskClosable={false}
          width='1000px'
          style={{ top: 20 }}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onOk={this.saveSelectedServices}
          cancelText='关闭'
          okText='确定选择'
          >
          <SelectServices ref='SelectServices' appId={this.appId}  closeModal={this.closeModal} />
      </Modal>
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large">
        <TabPane  tab="基本属性" key="props"  >
            <FormItem
              label="节点名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="指定任何有意义且能描述本节点的说明(选择API后自动填充为API的名称)"
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
              label="API URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请指定API地址如:http://ip:8080/testapi 可使用${变量}获取路径'
            >
              {
                getFieldDecorator('apiUrl', {
                  rules: [{ required: true}],
                  initialValue:host+'/api/',
                })
                (<Input addonBefore={selectMethod} />)
              }
            </FormItem>
            <FormItem
              label="追加认证头"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='调用API时自动追加token认证标识,只对RestCloud的数据服务API有效,其他系统发布的API请选择否'
            >
              {
                getFieldDecorator('addIdentitytoken', {
                  rules: [{ required: false}],initialValue:'0'
                })
                (
                  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='0'>否</Radio>
                  </RadioGroup>
                )
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
          <TabPane  tab="超时设置" key="more"  >
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
              help='执行超时时间(默认3秒)单位毫秒'
            >{
              getFieldDecorator('connectTimeout',{rules: [{ required: true}],initialValue:"3000"})
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
          </TabPane>
          <TabPane  tab="上传文件" key="folder"  >
            <FormItem label="数据上传方式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择数据流上传的方式'
            >
              {getFieldDecorator('fileType',{initialValue:'file'})
              (
                <RadioGroup>
                  <Radio value='file'>本地已存在的文件</Radio>
                  <Radio value='json'>数据流转为JSON文件后上传</Radio>
                  <Radio value='xml'>数据流转为XML文件后上传</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="控件名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定服务器端接收文件上传控件的名称'
            >
              {getFieldDecorator('controlName',{rules: [{ required: true}],initialValue:'file'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="本地文件目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定存储本地文件的目录,目录支持${变量}'
            >
              {getFieldDecorator('localFolder',{rules: [{ required: true}],initialValue:'d:/etlfile'})
              (
                (<Input />)
              )}
            </FormItem>
            <div style={{display:this.props.form.getFieldValue('fileType')==='file'?'':'none'}} >
                <FormItem label="文件来源" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                   help='指定查找文件的方式'
                >
                  {getFieldDecorator('fileFrom',{initialValue:'1'})
                  (
                    <RadioGroup>
                      <Radio value='1'>指定文件</Radio>
                      <Radio value='2'>根据后缀查找文件</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="指定文件名"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.props.form.getFieldValue('fileFrom')==='1'?'':'none'}}
                  help='指定要上传的文件名多个用逗号分隔,支持变量${变量}'
                >
                  {getFieldDecorator('fileName',{rules: [{ required: false}],initialValue:'test.json'})
                  (
                    (<Input />)
                  )}
                </FormItem>
                <FormItem label="文件后缀"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.props.form.getFieldValue('fileFrom')==='2'?'':'none'}}
                  help='指定要上传的文件的后缀多个用逗号分隔,*号表示所有(xml,json,xlsx),支持直接填写文件名,支持变量${变量}'
                >
                  {getFieldDecorator('fileExtension',{rules: [{ required: true}],initialValue:'*'})
                  (
                    (<Input />)
                  )}
                </FormItem>
                <FormItem label="按修改时间上传" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                   help='仅上传修改时间晚于流程最后一次运行时间的文件'
                   style={{display:this.props.form.getFieldValue('fileFrom')==='2'?'':'none'}}
                >
                  {getFieldDecorator('lastUpdateFile',{initialValue:'0'})
                  (
                    <RadioGroup>
                      <Radio value='0'>否</Radio>
                      <Radio value='1'>是</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
            </div>
            <FormItem label="上传后" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='上传后文件处理方式'
            >
              {getFieldDecorator('deleteFile',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>不处理</Radio>
                  <Radio value='1'>删除文件</Radio>
                  <Radio value='2'>移动到其他目录</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="目标文件目录"
              help='移动到目标文件夹支持${变量}获取变量'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("deleteFile")==='2'?'':'none'}}
            >{
              getFieldDecorator('targetFolder')
              (<Input />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="API参数" key="params"  >
            <FormItem
              label="Body参数获取方式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.state.formData.requestBodyFlag==='true'?'':'none'}}
              help='Http请求表示通过节点Id或别名获取HTTP请求中的数据请求格式为:{"节点Id":{jsondata}}'
            >
              {
                getFieldDecorator('requestBodyAuto', {
                  rules: [{ required: false}],
                  initialValue:'1'
                })
                (
                  <RadioGroup>
                    <Radio value='1'>HTTP请求分包给本节点的数据</Radio>
                    <Radio value='2'>上一节点的执行结果</Radio>
                    <Radio value='0'>自定义</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
            <FormItem
              label="使用计算规则"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.state.formData.requestBodyFlag==='true'?'':'none'}}
              help='选择一个规则并返回一个字符串作为Body输入参数'
            >
              {
                getFieldDecorator('requestBodyRuleId', {
                  rules: [{ required: false}]
                })
                (<TreeNodeSelect url={ruleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',disabled:this.props.form.getFieldValue("requestBodyAuto")==='0'?false:true}}  />)
              }
            </FormItem>
            <FormItem
              label="指定Body字符串"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='自定义字符串作为请求参数,可以使用${字段Id}获取HTTP或上一节点执行结果的字段值如:${userInfo}则在http请求json中传入:{userInfo:{...}},使用${$rule.规则Id}引用规则,使用${$.field}通过JsonPath取值'
              style={{display:this.state.formData.requestBodyFlag==='true'?'':'none'}}
            >{
              getFieldDecorator('requestBody')
              (
                <Input.TextArea autosize style={{minHeight:'300px'}} onClick={this.formatRequestBodyJsonStr.bind(this,"requestBody")} disabled={this.props.form.getFieldValue("requestBodyAuto")==='0'?false:true} />
              )}
            </FormItem>
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}}  >
              <ApiNodeParamsConfig ref='nodeParamsConfig' serviceId={this.state.formData.apiId} inParams={inParamsJson}  />
            </div>
          </TabPane>
          <TabPane  tab="Header" key="header"  >
            <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} />
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
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>返回数据量断言</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
                返回1断言成立，返回0断言失败，返回2等待外部条件再次触发运行
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >保存</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>
      </Form>
      </Spin>
    );
  }
}

const ApiNode = Form.create()(form);

export default ApiNode;
