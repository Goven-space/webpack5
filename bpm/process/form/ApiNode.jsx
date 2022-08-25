import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import SelectServices from '../../components/SelectServices';
import ApiNodeParamsConfig from './components/ApiNodeParamsConfig';
import ApiNodeHeaderConfig from './components/ApiNodeHeaderConfig';
import AceEditor from '../../../core/components/AceEditor'

//Rest API 节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.BPM.CORE_BPM_PROCESSNODE.props;
const SubmitUrl=URI.BPM.CORE_BPM_PROCESSNODE.save; //存盘地址
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl=URI.BPM.CORE_BPM_RULE.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.templateId=this.nodeObj.templateId;
    this.applicationId=this.props.applicationId;
    this.state={
      mask:false,
      visible: false,
      templateVisible: false,
      formData:{inParams:'[]',inHeaders:'[]',requestBody:'${formBody}'},
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
      this.state.formData.requestBody=newCode; //请求示例
    }

    //获取请求示例参数
    getRequestBody=()=>{
      return this.state.formData.requestBody;
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
              <Option value="PATCH">PATCH</Option>
      </Select>)
    );
    let inParamsJson=this.state.formData.inParams==undefined?[]:JSON.parse(this.state.formData.inParams);
    let inHeaderJson=this.state.formData.inHeaders==undefined?[]:JSON.parse(this.state.formData.inHeaders);
    let exportParamsJson=this.state.formData.exportParams==undefined?[]:JSON.parse(this.state.formData.exportParams);

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
            <FormItem label="调用失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当调用失败时是否终止流程运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>跳过</Radio>
                  <Radio value='2'>终止流程</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="附加API数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="API结果数据附加到表单字段中"
            >
              {getFieldDecorator('addToFormData',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
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
              help='指定API如:http://ip:8080/api/${字段id}，可用${字段id}获取表单数据'
            >
              {
                getFieldDecorator('apiUrl', {
                  rules: [{ required: true}],
                  initialValue:'${#config.apiserver}/rest/',
                })
                (<Input addonBefore={selectMethod} />)
              }
            </FormItem>
            <FormItem label='参数传递方式' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('requestBodyFlag',{initialValue:'false'})
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
              help='调用API时自动追加本平台的token认证标识'
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
            <FormItem
              label="异步调用"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='异步调用不会影流程的运行'
            >
              {
                getFieldDecorator('asyncFlag', {
                  rules: [{ required: false}]
                  ,initialValue:'0'
                })
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )
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
              label="请求读取超时"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='读取API返回数据超时时间(默认3秒)单位毫秒'
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
          </TabPane>
          <TabPane  tab="Header" key="header"  >
            <ApiNodeHeaderConfig ref='nodeHeaderConfig' inParams={inHeaderJson} nodeId={this.nodeId} processId={this.processId} applicationId={this.applicationId} />
          </TabPane>
          <TabPane  tab="输入参数" key="params"  >
            <div   style={{display:this.props.form.getFieldValue("requestBodyFlag")==='true'?'':'none'}} >
              <FormItem
                label="Body参数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                help="${formBody}表示全部转为JSON输出给API，取表单字段${字段id}"
              >{
                getFieldDecorator('requestBody',{rules: [{ required: true}],initialValue:"${formBody}"})
                (<AceEditor height={460} mode='json'  />)
                }
              </FormItem>
            </div>
            <div  style={{display:this.props.form.getFieldValue("requestBodyFlag")==='true'?'none':''}}  >
              <ApiNodeParamsConfig ref='nodeParamsConfig' applicationId={this.applicationId} serviceId={this.state.formData.apiId} nodeId={this.nodeId} processId={this.processId} inParams={inParamsJson}  />
            </div>
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

export default Form.create()(form);
