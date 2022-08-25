import React from 'react';
import { Form, Select, Input, Button, Spin, Icon, Radio, Row, Col, Tooltip, Popover, InputNumber, Tabs, Modal, Tag, Card, Switch, Divider } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import SelectServices from '../../components/SelectServices';
import SaveNodeTemplate from '../../components/SaveNodeTemplate';
import ApiNodeParamsConfig from './components/ApiNodeParamsConfig';
import ApiExportParamsConfig from './components/ApiExportParamsConfig';
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
const PropsUrl = URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl = URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const listAllBlanceUrl = URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl = URI.ESB.CORE_ESB_RULE.select;
const parseExportParamsUrl=URI.ESB.CORE_ESB_NODEPARAMS.parseExportParams;

class form extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.nodeObj = this.props.nodeObj;
    this.eleId = this.props.eldId;
    this.nodeId = this.nodeObj.key;
    this.processId = this.props.processId;
    this.templateId = this.nodeObj.templateId;
    this.applicationId = this.props.applicationId;
    this.state = {
      mask: false,
      visible: false,
      templateVisible: false,
      formData: { inParams: '[]', inHeaders: '[]', exportParams: '[]' },
      apiSelectRows: [],
      outPutParaTableData:[],
			requestBody:''/* */
    };
  }

  componentDidMount() {
    this.loadNodePropsData();
  }

  loadNodePropsData = () => {
    let url = PropsUrl + "?processId=" + this.processId + "&nodeId=" + this.nodeObj.key + "&templateId=" + this.templateId;
    this.setState({ mask: true });
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (JSON.stringify(data) !== '{}') {
          this.setState({ formData: data,  requestBody:data.requestBody /**/});
          FormUtils.setFormFieldValues(this.props.form, data);
        }
      }
    });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postData = {};
        Object.keys(values).forEach(
          function (key) {
            if (values[key] !== undefined) {
              let value = values[key];
              if (value instanceof Array) {
                postData[key] = value.join(","); //数组要转换为字符串提交
              } else {
                postData[key] = value;
              }
            }
          }
        );
        postData = Object.assign({}, this.state.formData, postData);
        postData.appId = this.appId;
        postData.processId = this.processId;
        postData.pNodeType = this.nodeObj.nodeType;
        postData.inParams = JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
        postData.inHeaders = JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
        postData.exportParams = JSON.stringify(this.getExportParamsConfig()); //输出参数转换为字符串
        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
          if (data.state === false) {
            this.showInfo(data.msg);
          } else {
            this.setState({ mask: false });
            AjaxUtils.showInfo("保存成功!");
            if (closeFlag) {
              this.props.close(true, postData.pNodeName);
            }
          }
        });
      } else {
        AjaxUtils.showError("请填写完整后再提交!");
      }
    });
  }

  ///保存为模板时从此方法中获取节点的配置数据
  getNodeFormData = () => {
    let postData = this.props.form.getFieldsValue();
    postData.appId = this.appId;
    postData.pNodeType = this.nodeObj.nodeType;
    postData.inParams = JSON.stringify(this.getNodeInParamsConfig()); //输入参数的定义转换为字符串
    postData.inHeaders = JSON.stringify(this.getNodeHeaderParamsConfig()); //输入头的定义转换为字符串
    return postData;
  }

  //获得API的输入参数配置
  getNodeInParamsConfig = () => {
    if (this.refs.nodeParamsConfig) {
      return this.refs.nodeParamsConfig.getData();
    } else {
      return JSON.parse(this.state.formData.inParams);
    }
  }

  //获得API的Headwer参数配置
  getNodeHeaderParamsConfig = () => {
    if (this.refs.nodeHeaderConfig) {
      return this.refs.nodeHeaderConfig.getData();
    } else {
      return JSON.parse(this.state.formData.inHeaders);
    }
  }

  //获得API的输出参数配置
  getExportParamsConfig = () => {
    if (this.refs.exportParams) {
      return this.refs.exportParams.getData();
    } else {
      return JSON.parse(this.state.formData.exportParams || '[]');
    }
  }


  //服务选择相关函数
  saveSelectedServices = () => {
    //调用子窗口获取已经选中的行
    let selectedRows = this.refs.SelectServices.getSelectedRows();
    if(!selectedRows.length||selectedRows.length!==1) {
      AjaxUtils.showInfo('请选择一条API！')
      return false
    }
		let selectData = selectedRows[0]
		let codeMirror = null
    let formData = {...this.state.formData};
		if(this.refs.requestBodyCodeMirror) {
			codeMirror = this.refs.requestBodyCodeMirror.getCodeMirror();
		}

    formData.apiId = selectData.id;
    formData.apiUrl = selectData.mapUrl;
    // console.log(formData.apiId);
		let requestBodyFlag = 'false'
		if(selectData.requestBodyFlag === false){
			requestBodyFlag = 'false'
		}else if(selectData.paramsDocs && selectData.paramsDocs.length) {
			requestBodyFlag = 'json'
		}else {
			requestBodyFlag = 'true'
			selectData.requestBodyAuto='0'
			if(codeMirror) {
				// console.log(selectData.requestBodySampleStr);
				codeMirror.setValue(selectData.requestBodySampleStr?selectData.requestBodySampleStr:'');
			}else {
				// console.log(selectData.requestBodySampleStr);
				this.updateRequestBodyCode(selectData.requestBodySampleStr?selectData.requestBodySampleStr:'')
			}
    	/* 如果是true，参数获取方式需要为自定义，然后将后端给的指定Body参数回显，codeMirror.setValue回显指定Body参数字段，值来自后端选中的requestBodySampleStr（后端没给字段）组件codeMirror的值一定要是字符串，不能是undefined，但是后端字段requestBodySampleStr存在undefined的可能，所以要判断一下  */
		}
    selectData = {
      requestBodyFlag: requestBodyFlag,
      apiUrl:selectData.mapUrl,
      apiId:selectData.id,
      loadBalanceId:selectData.loadBalanceId,
      retryNum:selectData.retryNum,
      retrySleep:selectData.retrySleep,
      netConnectTimeout:selectData.backendConnectTimeout,
      methodType: selectData.methodType,
      transferHeader:selectData.backendHaderTransparent?'true':'false'
    }/*selectedRows[0]是选中的api, selectData是从选中的api里拎出要回显form的参数*/
    this.setState({ formData: formData, visible: false,apiSelectRows: selectedRows});

    this.props.form.setFieldsValue({ ...selectData});
  }

  showModal = (action) => {
    this.setState({ visible: true, action: action });
  }
  showTemplateModal = (action) => {
    this.setState({ templateVisible: true });
  }
  closeModal = () => {
    this.setState({ visible: false, templateVisible: false });
  }
  handleCancel = (e) => {
    this.setState({ visible: false, templateVisible: false });
  }
  //服务选择结束

  onParamsEditTypeSwitchChange = (checked) => {
    let r = checked === true ? 'true' : 'false';
    let formData = this.state.formData;
    formData.requestBodyFlag = r;
    this.setState({ formData: formData });
  }

  onTransferHeaderSwitchChange = (checked) => {
    let r = checked === true ? 'true' : 'false';
    let formData = this.state.formData;
    formData.transferHeader = r;
    this.setState({ formData: formData });
  }

  updateCode = (newCode) => {
    let formData = this.state.formData;
    formData.assertCode = newCode; //断言代码
  }

  updateRequestBodyCode = (newCode) => {
    this.state.formData.requestBody = newCode; //请求示例
		 this.setState({
			requestBody: newCode
		}) /**/
  }

  //获取请求示例参数
  getRequestBody = () => {
    /*return this.state.formData.requestBody; */
    return this.state.requestBody;
  }

  inserDemo = () => {
    let codeMirror = this.refs.codeMirror.getCodeMirror();
    let code = `//使用HTTP状态码作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var statusCode=engine.getStatusCode(nodeId); //获取当前节点的HTTP状态码
  if(statusCode=="200"){
  	result=1; //断言成立
  }
  return result;
}`;
    codeMirror.setValue(code);
    this.state.formData.assertCode = code;
  }

  inserDemo2 = () => {
    let codeMirror = this.refs.codeMirror.getCodeMirror();
    let code = `//执行sql条件作为判断条件
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
    this.state.formData.assertCode = code;
  }

  inserDemo3 = () => {
    let codeMirror = this.refs.codeMirror.getCodeMirror();
    let code = `//indoc为API执行的结果数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(indoc.get("字段")=="admin"){
    result=1; //返回结果符合要求断言成立
  }
  return result;
}`;
    codeMirror.setValue(code);
    this.state.formData.assertCode = code;
  }

  formatRequestBodyJsonStr = (fieldId) => {
    let value = this.state.formData[fieldId];
    value = AjaxUtils.formatJson(value).trim();
    let codeMirror = this.refs.requestBodyCodeMirror.getCodeMirror();
    codeMirror.setValue(value);
    this.state.formData.requestBody = value; //断言代码
		this.setState({
			requestBody:value
		}) /* */
  }

  //获取节点输入参数
  getNodeSampleInParamsConfig = () => {
    let value = this.props.form.getFieldValue("nodeInParams");
    if (value === '') {
      let jsonObj = {};
      let paramsConfigList = this.getNodeInParamsConfig();
      paramsConfigList.forEach((v, index, array) => {
        jsonObj[v.paramsId] = "";
      });
      value = JSON.stringify(jsonObj);
    }
    value = AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({ "nodeInParams": value });
  }

  loadFromJson = (value) => {
    AjaxUtils.post(parseExportParamsUrl,{body: value},(data)=>{
      const newData = data.map(item=> ({
        id:AjaxUtils.guid(),
        paramsId: item.paramsId,
        paramsValue: item.paramsValue
      }))
      this.setState({outPutParaTableData:newData});
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = { labelCol: { span: 4 }, wrapperCol: { span: 16 }, };
    const selectMethod = (
      getFieldDecorator('methodType', { initialValue: 'GET' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
          <Option value="PATCH">PATCH</Option>
        </Select>)
    );
    let inParamsJson = this.state.formData.inParams == undefined ? [] : JSON.parse(this.state.formData.inParams);
    let inHeaderJson = this.state.formData.inHeaders == undefined ? [] : JSON.parse(this.state.formData.inHeaders);
    let exportParamsJson = this.state.formData.exportParams == undefined ? [] : JSON.parse(this.state.formData.exportParams);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Modal key={Math.random()} title='选择API服务' maskClosable={false}
          width='1200px'
          style={{ top: 20 }}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onOk={this.saveSelectedServices}
          cancelText='关闭'
          okText='确定选择'
        >
          <SelectServices ref='SelectServices' appId={this.appId} closeModal={this.closeModal} serviceId={this.state.formData.apiId}/>
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
            <TabPane tab="基本属性" key="props"  >
              <FormItem
                label="节点名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本节点的说明(选择API后自动填充为API的名称)"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: true }],
                    initialValue: this.nodeObj.text
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
                    rules: [{ required: true }],
                    initialValue: this.nodeObj.key
                  })
                    (<Input disabled={true} />)
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
                    rules: [{ required: false }]
                  })
                    (<Input />)
                }
              </FormItem>
              <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="API调用结果数据是否输出给本流程发布的API的调用端"
              >
                {getFieldDecorator('responseData', { initialValue: '1' })
                  (
                    <Select  >
                      <Option value='1'>输出API结果到调用端</Option>
                      <Option value='0'>不输出API结果</Option>
                      <Option value='2'>多次循环调用时累加结果并输出</Option>
                    </Select>
                  )}
              </FormItem>
              <FormItem label="分页读取" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="针对数据查询节点可以指定分页循环读取直到最后一页,必须在API参数中通过${pageNo}获取页数作为输入参数"
              >
                {getFieldDecorator('pageReadDataFlag', { initialValue: '0' })
                  (
                    <RadioGroup>
                      <Radio value='0'>否</Radio>
                      <Radio value='1'>是</Radio>
                    </RadioGroup>
                  )}
              </FormItem>
              <FormItem
                label="数据体所在字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: this.props.form.getFieldValue("pageReadDataFlag") === '1' ? '' : 'none' }}
                help="指定数据体所在字段支持JsonPath指定层次，如果没有数据了就停止读取"
              >
                {
                  getFieldDecorator('pageDataJsonPath', {
                    rules: [{ required: false }],
                    initialValue: '$.data'
                  })
                    (<Input />)
                }
              </FormItem>
              <FormItem label="保存请求参数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="在节点实例中保存API的请求参数，如果数据量较大建议不要保存，注意不保存则不再支持补偿操作"
              >
                {getFieldDecorator('saveRequestBody', { initialValue: '1' })
                  (
                    <RadioGroup>
                      <Radio value='1'>是</Radio>
                      <Radio value='0'>否</Radio>
                    </RadioGroup>
                  )}
              </FormItem>
              <FormItem label="保存API调用结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="在节点实例中保存API的调用结果，如果数据量较大建议不要保存"
              >
                {getFieldDecorator('saveResponseBody', { initialValue: '1' })
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
            <TabPane tab="API配置" key="regApi"  >
              <FormItem
                label="API URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定API如:http://ip:8080/api/${userid},支持服务实例名http://serviceName/api多个用逗号分隔,可用${$.http.变量}获取http变量,${变量}取上一节点变量,${$.T0001.变量}取指定节点输出变量作为URL的组成部分'
              >
                {
                  getFieldDecorator('apiUrl', {
                    rules: [{ required: true }],
                    initialValue: '${#config.apiserver}/rest/',
                  })
                    (<Input addonBefore={selectMethod}
                      addonAfter={<span style={{ cursor: "pointer" }} onClick={this.showModal.bind(this)} >选择API</span>}
                    />)
                }
              </FormItem>
              <FormItem
                label="选择的API的id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
              >
                {
                  getFieldDecorator('apiId', {
                    rules: [{ required: false }],
                    initialValue:''
                  })
                    (<Input  />)
                }
              </FormItem>
              <FormItem label='参数传递方式' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                {getFieldDecorator('requestBodyFlag', { initialValue: 'false' })
                  (
                    <RadioGroup>
                      <Radio value='false'>Form键值对</Radio>
                      <Radio value='json'>Body请求</Radio>
                      <Radio value='true'>Body请求(自定义来源或JSON)</Radio>
                    </RadioGroup>
                  )}
              </FormItem>
              <FormItem
                label="追加认证头"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='调用API时自动追加token认证标识,只对注册在本平台中的API有效，流程在自动调度时请选择是'
              >
                {
                  getFieldDecorator('addIdentitytoken', {
                    rules: [{ required: false }], initialValue: '1'
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
                label="异步调用"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='注意:异步调用API时调用结果不会传入到后续节点中，后继路由不支持使用断言作为路由条件'
              >
                {
                  getFieldDecorator('asyncFlag', {
                    rules: [{ required: false }]
                    , initialValue: '0'
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
                help="当后端API有多个时选择负载均衡策略"
              >
                {getFieldDecorator('loadBalanceId', { initialValue: 'WeightRandomServer' })
                  (
                    <AjaxSelect url={listAllBlanceUrl} defaultData={{ "configName": "无", configId: "" }} valueId='configId' textId='configName' options={{ showSearch: true }} />
                  )}
              </FormItem>
              <FormItem
                label="网络链接超时"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='网络链接的超时时间(默认10秒)单位毫秒'
              >{
                  getFieldDecorator('netConnectTimeout', { rules: [{ required: true }], initialValue: "10000" })
                    (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="请求读取超时"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='读取API返回数据超时时间(默认3秒)单位毫秒'
              >{
                  getFieldDecorator('connectTimeout', { rules: [{ required: true }], initialValue: "30000" })
                    (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="重试次数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='调用后端服务失败后是否进行重试(默认0表示不重试)'
              >{
                  getFieldDecorator('retryNum', { rules: [{ required: true }], initialValue: "0" })
                    (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="重试间隔"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='每次重试时的间隔时间0表示立即重试(单位:毫秒)'
              >{
                  getFieldDecorator('retrySleep', { rules: [{ required: true }], initialValue: "0" })
                    (<InputNumber min={0} />)
                }
              </FormItem>
            </TabPane>
            <TabPane tab="Header" key="header"  >
              <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} nodeId={this.nodeId} processId={this.processId} applicationId={this.applicationId} apiSelectRows={this.state.apiSelectRows}/>
              <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}
                help='提示:取上一节点:$.变量,指定节点$.T00001.变量,Header参数$.header.变量,HTTP请求参数$.http.变量,全局变量$.global.变量'
              >
                {getFieldDecorator('transferHeader', { initialValue: 'true' })
                  (
                    <RadioGroup>
                      <Radio value='true'>透传Header</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>
                  )}
              </FormItem>
            </TabPane>
            <TabPane tab="输入参数" key="params"  >
              <div style={{ display: this.props.form.getFieldValue("requestBodyFlag") === 'true' ? '' : 'none' }} >
                <FormItem
                  label="参数获取方式"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                  help='指定本节点API的输入参数的来源'
                >
                  {
                    getFieldDecorator('requestBodyAuto', {
                      rules: [{ required: false }],
                      initialValue: '1'
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
                  style={{ display: this.props.form.getFieldValue("requestBodyAuto") === '4' ? '' : 'none' }}
                  help='选择一个规则并返回一个字符串作为Body输入参数'
                >
                  {
                    getFieldDecorator('requestBodyRuleId', {
                      rules: [{ required: false }]
                    })
                      (<TreeNodeSelect url={ruleSelectUrl} options={{ showSearch: true, multiple: false, allowClear: true, treeNodeFilterProp: 'label' }} />)
                  }
                </FormItem>
                <Row style={{ visibility: this.props.form.getFieldValue("requestBodyAuto") === '0' ? '' : 'hidden' }} >
                  <Col span={4} style={{ textAlign: 'right' }}>指定Body参数:</Col>
                  <Col span={18}>
                    <div style={{ border: '1px #cccccc solid', minHeight: '280px', margin: '2px', borderRadius: '0px' }}>
                      <CodeMirror ref='requestBodyCodeMirror'
                        /* value={this.state.formData.requestBody} */
                        value={this.state.requestBody}
                        onChange={this.updateRequestBodyCode}
                        options={{ lineNumbers: true, mode: 'javascript', autoMatchParens: true }}
                      />
                    </div>
                    <a onClick={this.formatRequestBodyJsonStr.bind(this, "requestBody")} >格式化JSON</a>{' '}<Tooltip title="取上一节点结果${$.变量},取指定节点结果:${$.T00001.变量},取HTTP参数:${$.http.变量},取Header值:${$.header.变量},全局变量${$.global.userid},${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值作为参数">显示取值帮助?</Tooltip>
                  </Col>
                </Row>
              </div>
              <div style={{ display: this.props.form.getFieldValue("requestBodyFlag") === 'true' ? 'none' : '' }}  >
                <ApiNodeParamsConfig ref='nodeParamsConfig' applicationId={this.applicationId} serviceId={this.state.formData.apiId} nodeId={this.nodeId} processId={this.processId} inParams={inParamsJson} apiSelectRows={this.state.apiSelectRows}/>
                取上一节点:$.变量,指定节点$.T00001.变量,Header参数$.header.变量,HTTP请求参数$.http.变量,全局变量$.global.变量
              </div>
            </TabPane>
            <TabPane tab="输出变量" key="exportParamsTag"  >
              <ApiExportParamsConfig ref='exportParams' exportParams={exportParamsJson} apiSelectRows={this.state.apiSelectRows} serviceId={this.state.formData.apiId} outPutParaTableData={this.state.outPutParaTableData}/>
              把本API返回的数据设置到全局变量中，方便后继节点选择本变量
            </TabPane>
            <TabPane tab="断言" key="Assertion"   >
              <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="当断言失败时是否跳过节点或者进行补偿运行"
              >
                {getFieldDecorator('compensateFlag', { initialValue: '1' })
                  (
                    <Select>
                      <Option value='1'>正向补偿(直到本节点断言成功后继续执行流程)</Option>
                      <Option value='3'>跳过(事后补偿本节点)</Option>
                      <Option value='0'>跳过(无需补偿)</Option>
                      <Option value='2'>终止流程</Option>
                      <Option value='4'>结束本节点(其他节点可继续执行)</Option>
                    </Select>
                  )}
              </FormItem>
              <Row>
                <Col span={4} style={{ textAlign: 'right' }}>断言逻辑:</Col>
                <Col span={18}>
                  <div style={{ border: '1px #cccccc solid', minHeight: '280px', margin: '2px', borderRadius: '0px' }}>
                    <CodeMirror ref='codeMirror'
                      value={this.state.formData.assertCode}
                      onChange={this.updateCode}
                      options={{ lineNumbers: true, mode: 'javascript', autoMatchParens: true }}
                    />
                  </div>
                  <a style={{ cursor: 'pointer' }} onClick={this.inserDemo}>HTTP状态码断言</a> <Divider type="vertical" />{' '}
                  <a style={{ cursor: 'pointer' }} onClick={this.inserDemo2}>SQL条件断言</a> <Divider type="vertical" />{' '}
                  <a style={{ cursor: 'pointer' }} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
                  返回1断言成立，返回0断言失败，返回2继续运行直到断言成立
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="测试" key="tester"  >
              <NewRestfulTest
                parentForm={this.props.form}
                requestBodyFlag={this.props.form.getFieldValue("requestBodyFlag")}
                getNodeInParamsConfig={this.getNodeInParamsConfig}
                getNodeHeaderParamsConfig={this.getNodeHeaderParamsConfig}
                getRequestBody={this.getRequestBody}
                ref="TestService"
                loadFromJson={this.loadFromJson}
              ></NewRestfulTest>
            </TabPane>
          </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this, true)}  >保存</Button>{' '}
            <Button type="ghost" onClick={this.showTemplateModal}  >保存为模板</Button>{' '}
            <Button onClick={this.props.close.bind(this, false)}  >关闭</Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
