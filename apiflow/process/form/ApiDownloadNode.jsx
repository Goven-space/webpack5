import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import SelectServices from '../../components/SelectServices';
import SaveNodeTemplate from '../../components/SaveNodeTemplate';
import ApiNodeParamsConfig from './components/ApiNodeParamsConfig';
import ApiNodeHeaderConfig from './components/ApiNodeHeaderConfig';
import NewRestfulTest from '../../api/NewRestfulTest';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

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
      templateVisible: false,
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
          postData.inHeaders=JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
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

    updateRequestBodyCode=(newCode)=>{
      this.state.formData.requestBody=newCode; //断言代码
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
  if(indoc.get("字段")=="admin"){
    result=1; //返回结果符合要求断言成立
  }
  return result;
}`;
          codeMirror.setValue(code);
          this.state.formData.assertCode=code;
      }

  formatRequestBodyJsonStr=(fieldId)=>{
    let value=this.state.formData[fieldId];
    value=AjaxUtils.formatJson(value).trim();
    let codeMirror=this.refs.requestBodyCodeMirror.getCodeMirror();
    codeMirror.setValue(value);
    this.state.formData.requestBody=value; //断言代码
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
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
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
              help="API调用结果数据是否输出给本流程发布的API的调用端"
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
          <TabPane  tab="API配置" key="regApi"  >
            <FormItem
              label="API URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请指定要注册的API如:http://ip:8080/testapi 支持服务实例名http://serviceName/rest/api多个时用逗号分隔,可用${变量}获取http传入参数作为URL的组成部分'
            >
              {
                getFieldDecorator('apiUrl', {
                  rules: [{ required: true}],
                  initialValue:'${#config.apiserver}/rest/',
                })
                (<Input addonBefore={selectMethod}
                  addonAfter={<span style={{cursor:"pointer"}} onClick={this.showModal.bind(this)} >选择API</span>}
                   />)
              }
            </FormItem>
            <FormItem
              label="追加认证头"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='调用API时自动追加token认证标识,只对注册在本平台中的API有效，流程在自动调度时请选择是'
            >
              {
                getFieldDecorator('addIdentitytoken', {
                  rules: [{ required: false}],initialValue:'1'
                })
                (
                  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='0'>否</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
            <FormItem label="负载均衡策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当后端API有多个时选择负载均衡策略"
            >
              {getFieldDecorator('loadBalanceId',{initialValue:'WeightRandomServer'})
              (
                <AjaxSelect url={listAllBlanceUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
              )}
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
          <TabPane  tab="API参数" key="params"  >
            <div   style={{display:this.state.formData.requestBodyFlag==='true'?'':'none'}} >
              <FormItem
                label="参数获取方式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                help='指定本节点API的输入参数的来源'
              >
                {
                  getFieldDecorator('requestBodyAuto', {
                    rules: [{ required: false}],
                    initialValue:'1'
                  })
                  (
                    <Select>
                      <Option value='1'>HTTP请求分发给本节点的数据</Option>
                      <Option value='3'>HTTP请求的二进制流数据作为输入流</Option>
                      <Option value='2'>上一节点的执行结果</Option>
                      <Option value='4'>指定一个计算规则返回字符串作为输入参数</Option>
                      <Option value='0'>自定义一个字符串</Option>
                    </Select>
                  )
                }
              </FormItem>
              <FormItem
                label="使用计算规则"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
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

              <Row style={{visibility:this.props.form.getFieldValue("requestBodyAuto")==='0'?'':'hidden'}} >
                <Col span={4} style={{textAlign:'right'}}>指定Body参数:</Col>
                <Col span={18}>
                  <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                    <CodeMirror ref='requestBodyCodeMirror'
                    value={this.state.formData.requestBody}
                    onChange={this.updateRequestBodyCode}
                    options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                    />
                  </div>
                  <a onClick={this.formatRequestBodyJsonStr.bind(this,"requestBody")} >格式化JSON</a>{' '}<Tooltip title="取上一节点结果${$.变量},取指定节点结果:${$.T00001.变量},取HTTP参数:${$.http.变量},取Header值:${$.header.变量},全局变量${$.global.userid},${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值作为参数">显示取值帮助?</Tooltip>
              </Col>
            </Row>
            </div>
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}}  >
              <ApiNodeParamsConfig ref='nodeParamsConfig' serviceId={this.state.formData.apiId} inParams={inParamsJson}  />
              使用 $.变量 可获取上一节点的结果字段,如果上一节点为非JSON则使用$.ResponseBody获取
            </div>
            <br></br>
            <Switch
              checked={this.state.formData.requestBodyFlag==='true'}
              onChange={this.onParamsEditTypeSwitchChange}
              checkedChildren="Body请求参数"
              unCheckedChildren="表单请求参数"
              style={{marginLeft:this.state.formData.requestBodyFlag==='true'?'160px':'',marginBottom:'10px'}}
            />
          </TabPane>
          <TabPane  tab="Header" key="header"  >
            <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} />
            <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 16 }}
              help='透传Header头时配置的Header参数将追加或覆盖HTTP请求头中的值，注意:定时调度时不支持透传Header头'
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
          <TabPane  tab="保存目录" key="folder"  >
            <FormItem label="保存方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="文件下载后的数据保存方式"
            >
              {getFieldDecorator('save2variant',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>保存到服务器目录</Radio>
                  <Radio value='0'>作为二进制数据暂存(后继节点通过获取HTTP二进制数据获取)</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="保存目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("save2variant")==='1'?'':'none'}}
              help='指定下载文件保存的目录(目录不存在会自动创建)，支持${变量}作为目录'
            >
              {
                getFieldDecorator('downloadFolder', {
                  rules: [{ required: true}],
                  initialValue:'d:/apidownload',
                })
                (<Input  />)
              }
            </FormItem>
            <FormItem
              label="文件名"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("save2variant")==='1'?'':'none'}}
              help='如果文件名为空则系统偿试自动获取,如果获取失败则节点执行异常，支持${变量}作为文件名'
            >
              {
                getFieldDecorator('downloadFileName', {
                  rules: [{ required: false}],
                  initialValue:'',
                })
                (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="断言" key="Assertion"   >
            <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当断言失败时是否跳过节点或者进行补偿运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>正向补偿(直到本节点断言成功)</Radio>
                  <Radio value='3'>跳过(事后补偿本节点)</Radio>
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
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>HTTP状态码断言</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>SQL条件断言</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
                返回1断言成立，返回0断言失败，返回2继续运行直到断言成立
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >保存</Button>{' '}
          <Button type="ghost" onClick={this.showTemplateModal}  >保存为模板</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
