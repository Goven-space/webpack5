import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//执行任务的节点属性
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.state={
      mask:false,
      formData:{},
      filtersBeans:[],
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.nodeId;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              if(JSON.stringify(data)==='{}'){
                data={
                  pNodeName:this.nodeObj.text,
                  pNodeId:this.nodeObj.nodeId,
                  processId:this.processId,
                  pNodeType:this.nodeObj.nodeType,
                  sourceId:this.nodeObj.sourceId,
                  targetId:this.nodeObj.targetId,
                  copyData:'0',
                  errorNum:100,
                  commitData:'0',
                  targetDeleteAll:'0',
                  clearProcessMainData:'0',
                  order:0,
                  assertCondition:'0',
                  async:'false',
                };
              }
              if(data.pNodeName==''){data.pNodeName=data.pNodeId;}
              this.setState({formData:data});
              FormUtils.setFormFieldValues(this.props.form,data);
            }
        });
  }

  onSubmit = (closeFlag) => {
    if(this.props.form.getFieldValue("pNodeName")===''){
      AjaxUtils.showError("路由名称不能为空!");
      return;
    }
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
          postData.sourceId=this.nodeObj.sourceId;
          postData.targetId=this.nodeObj.targetId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName,'router');
                }
              }
          });
      }
    });
  }

  updateFieldMapConfigs=(data)=>{
    this.state.formData.fieldMapConfig=JSON.stringify(data);
  }

  inserDemo=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//使用HTTP状态码作为断言条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var statusCode=engine.getStatusCode("T00001"); //获取指定节点API调用的HTTP状态码
  if(statusCode=="200"){
  	result=1; //允许路由
  }
  return result;
}`;
      codeMirror.setValue(code);
      this.state.formData.condition=code;
  }

  inserDemo2=()=>{
    let codeMirror=this.refs.codeMirror.getCodeMirror();
    let code=`//执行sql条件作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var sql="select * from table where id=1";
  var doc=RdbUtil.getDoc(sql);
  if(doc!==null){
    result=1; //SQL记录存在时允许路由
  }
  return result;
}`;
    codeMirror.setValue(code);
    this.state.formData.condition=code;
  }

  inserDemo3=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//indoc为上一节点执行的结果数据和局部变量数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(indoc.get("userId")==="admin"){
    result=1; //返回结果符合要求时允许路由
  }
  return result;
}`;
      codeMirror.setValue(code);
      this.state.formData.condition=code;
  }

  inserDemo4=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//使用断言作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=engine.getAssert("T00001");//获取指定节点的断言结果
  return result;
}`;
      codeMirror.setValue(code);
      this.state.formData.assertCode=code;
  }

  inserDemo5=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//使用全局变量作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var value=engine.get("endFlag");//获取指定全局变量
  if(value==='1'){
    return 1;
  }else{
    return 0;
  }
}`;
      codeMirror.setValue(code);
      this.state.formData.assertCode=code;
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.condition=newCode; //sqlcode 存在业务模型的filters字段中
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="基本属性" key="props"  >
              <FormItem
                label="路由名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本路由的说明"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: true}],initialValue:this.nodeObj.nodeId
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
                help="节点id不能重复"
              >
                {
                  getFieldDecorator('pNodeId', {
                    rules: [{ required: true}]
                  })
                  (<Input disabled={true} />)
                }
              </FormItem>
              <FormItem
                label="节点类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
              >
                {
                  getFieldDecorator('pNodeType', {
                    rules: [{ required: true}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
              >
              {this.nodeObj.nodeId+",源节点:"+this.nodeObj.sourceId+" 目标节点:"+this.nodeObj.targetId}
              </FormItem>
              <FormItem label="运行模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="同步模式表示按依赖或先后顺序执行路由,异步并行模式表示同时并行执行路由"
              >
                {getFieldDecorator('async',{initialValue:'false'})
                (
                  <RadioGroup>
                    <Radio value='false'>同步模式</Radio>
                    <Radio value='true'>异步并行</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="执行顺序"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='当有并行分支时数字越小越先执行'
              >{
                getFieldDecorator('order',{rules: [{ required: false}],initialValue:1})
                (<InputNumber min={0} max={100} />)
                }
              </FormItem>
              <FormItem label="清空数据流" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help="清空后数据不再流入到后继节点" >
                {getFieldDecorator('clearProcessMainData',{initialValue:'0'})
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
          <TabPane  tab="路由条件" key="event"  >
            <FormItem
              label="执行条件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本路由执行的条件'
            >
              {
                getFieldDecorator('assertCondition', {
                  rules: [{ required: false}]
                })
                (<Select  >
                  <Option value='0'>始终执行</Option>
                  <Option value='1'>上一节点断言成立时执行</Option>
                  <Option value='2'>上一节点断言失败时执行</Option>
                  <Option value='6'>默认路由(其他路由条件均不成立时执行)</Option>
                  <Option value='7'>全局变量中有完成变量标识时执行</Option>
                  <Option value='9'>所有前继节点执行结束后执行</Option>
                  <Option value='3'>自定义逻辑判断</Option>
                </Select>)
              }
            </FormItem>
            <Row style={{visibility:this.props.form.getFieldValue("assertCondition")==='3'?'':'hidden'}} >
              <Col span={4} style={{textAlign:'right'}}>自定义逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.condition}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                返回1表示执行本路由,0表示禁止路由:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>HTTP状态码</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>SQL条件</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>API调用结果</a> <Divider type="vertical" />
                <a style={{cursor:'pointer'}} onClick={this.inserDemo4}>指定节点断言</a> <Divider type="vertical" />
                <a style={{cursor:'pointer'}} onClick={this.inserDemo5}>全局变量判断</a> <Divider type="vertical" />
              </Col>
            </Row>
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

const RouterNode = Form.create()(form);

export default RouterNode;
