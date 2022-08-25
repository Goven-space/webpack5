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
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole="router";
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
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
              if(JSON.stringify(data)!=='{}'){
                if(data.pNodeName==''){data.pNodeName=data.pNodeId;}
                this.setState({formData:data});
                FormUtils.setFormFieldValues(this.props.form,data);
              }
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
          postData.pNodeRole=this.pNodeRole;
          postData.pNodeType=this.nodeObj.nodeType;
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
      let code=`//使用上一节点的流入的数据量作为断言
function assert(engine,nodeDoc,nodeId,indoc){
  if(engine.getDataTotalCount(indoc)>0){
    return 1; //有数据时条件成立
  }else{
    return 0;//没有数据时禁止路由
  }
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
  var doc=RdbUtil.getDoc(RdbUtil.getConnection("mysql"),sql);
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
      let code=`//indoc为上一节点执行的结果数据
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
      let code=`//使用断言作为判断条件,返回1不成立返回0
function assert(engine,nodeDoc,nodeId,indoc){
  var result=engine.getAssert("T00001");//获取指定节点的断言结果
  return result;
}`;
  codeMirror.setValue(code);
  this.state.formData.condition=code;
}

inserDemo5=()=>{
    let codeMirror=this.refs.codeMirror.getCodeMirror();
    let code=`//使用变量作为判断标记
function assert(engine,nodeDoc,nodeId,indoc){
  var flag=indoc.get("updateFlag"); //获取变量
  if(flag==="true"){
    return 1; //返回1表示成立
  }else{
    return 0;//返回0表示禁止
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
                label="节点名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本节点的说明"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: true}],
                    initialValue:this.nodeObj.nodeId
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="节点id不能重复"
              >
                {
                  getFieldDecorator('pNodeId', {
                    rules: [{ required: true}],
                    initialValue:this.nodeObj.nodeId
                  })
                  (<Input disabled={true} />)
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
                help="同步模式表示按先后顺序执行,异步并行模式表示多线程并行执行"
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
                (<Input.TextArea autoSize />)
                }
              </FormItem>
          </TabPane>
          <TabPane  tab="数据切分" key="dataSplit"  >
            <FormItem label="切分" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help="对数据记录进行切分复制(切分数据后不会对上一节点数据记录数造成影响)" >
              {getFieldDecorator('splitData',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="开始数据行"
              help='0表示从第1行开始,负数表示倒数第多少行,支持${变量}+1运算'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 12 }}
            >{
              getFieldDecorator('startNo',{rules: [{ required:false}],initialValue:0})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="结束数据行"
              help='0表示切到最后一行,负数表示倒数第多少行,++或--表示在开始行上增加或减少行数(如:++10),支持${变量}+1运算'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 12}}
            >{
              getFieldDecorator('endNo',{rules: [{ required:false}],initialValue:0})
              (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="路由条件" key="event"  >
            <FormItem
              label="执行条件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='使用上一节点的断言结果作为路由条件'
            >
              {
                getFieldDecorator('assertCondition', {
                  rules: [{ required: false}],initialValue:'0'
                })
                (
                  (<Select  >
                    <Option value='0'>始终执行</Option>
                    <Option value='1'>上一节点断言成立时执行</Option>
                    <Option value='2'>上一节点断言失败时执行</Option>
                    <Option value='4'>上一节点有数据流入时执行</Option>
                    <Option value='5'>上一节点没有数据流入时执行</Option>
                    <Option value='9'>所有前继节点执行结束后执行</Option>
                    <Option value='7'>前继分页读取完成或有完成变量到达时执行</Option>
                    <Option value='8'>前继分页读取未完成或没有完成变量到达时执行</Option>
                    <Option value='6'>默认路由(其他路由条件均不成立时执行)</Option>
                    <Option value='3'>自定义逻辑判断</Option>
                  </Select>)
                )
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
                条件返回1表示通过0表示禁止路由:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo5}>使用变量判断</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>流入数据量判断</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>SQL判断</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>API结果判断</a> <Divider type="vertical" />
                <a style={{cursor:'pointer'}} onClick={this.inserDemo4}>断言判断</a> <Divider type="vertical" />
              </Col>
            </Row>
          </TabPane>
          <TabPane  tab="调试输出" key="debug"  >
            <FormItem label="输出方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定数据输出的位置方便调试查看数据是否符合预期结果'
            >
              {getFieldDecorator('outputType',{initialValue:'1'})
              (
                <Select  >
                <Option value='1'>在控制台日志中输出</Option>
                <Option value='2'>在调试日志中输出</Option>
                <Option value='3'>输出到指定文件</Option>
                <Option value='4'>不输出</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="指定文件路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("outputType")==='3'?'':'none'}}
              help='输出到指定文件时请指定服务器的目录如：d:/etl/log,不指定则输出到默认目录中'
            >
              {getFieldDecorator('logFilePath',{initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem
              label="起始记录数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定从第多个行数据开始输出0表示从第一行开始输出'
            >{
              getFieldDecorator('startNum',{rules: [{ required: false}],initialValue:0})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="最大输出记录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定最大数据输出的记录数,0表示不限定'
            >{
              getFieldDecorator('maxWriteNum',{rules: [{ required: false}],initialValue:30})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="输出范围"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='仅输出数据行可以更清楚的查看数据结构,全部表示可以查看到当前数据流中包含的所有变量值和数据'
            >{
              getFieldDecorator('outputRows',{rules: [{ required: false}],initialValue:'1'})
              (  <Select>
                  <Option value='1'>仅逐行输出数据</Option>
                  <Option value='2'>仅输出变量不含数据</Option>
                  <Option value='4'>仅输出包含的记录总数</Option>
                  <Option value='3'>全部(包含变量和数据)</Option>
                </Select>)
              }
            </FormItem>
            <FormItem
              label="仅调试时输出"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='调试时输出数据，正式运行时不会输出日志数据'
            >{
              getFieldDecorator('debugOnlyFlag',{rules: [{ required: false}],initialValue:'1'})
              (  <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='2'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
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
