import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import JsonMapNodeParams from './components/JsonMapNodeParams';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
import ReactJson from 'react-json-view'

//JSON数据转换器

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const ruleSelectUrl=URI.ETL.RULE.select;
const previewJsonPath=URI.ETL.PROCESSNODE.previewJsonPath;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole='event';
    this.state={
      mask:false,
      visible: false,
      sourceJson:"",
      targetJson:"",
      formData:{params:'[]'},
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.key;
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
          if(this.refs.nodeParamsConfig){
            postData.params=JSON.stringify(this.refs.nodeParamsConfig.getData()); //映射配置json
          }
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

    updateCode=(newCode)=>{
      let formData=this.state.formData;
      formData.mapCode=newCode; //断言代码
    }

    inserDemo=()=>{
        let codeMirror=this.refs.codeMirror.getCodeMirror();
        let code=`//indoc为上一节点输出数据流
function converter(engine,nodeDoc,nodeId,indoc){
  //逐行对数据进行转换
  var dataDocs=indoc.get("data");
  for(x in dataDocs){
    var doc=dataDocs[x];
    doc.put("userName",doc.get("userId")); //修改字段名
    doc.put("creatTime",DateTimeUtil.getNow());//增加创建时间
    doc.remove("tel");//删除一个字段
  }
}`;
        codeMirror.setValue(code);
        this.state.formData.mapCode=code;
    }

  onTabsChange=(activeKey)=>{
  		if(activeKey==='dataPrview'){
        let dataMapConfig={};
        if(this.refs.nodeParamsConfig==undefined){
          dataMapConfig=this.state.formData.params==undefined?[]:JSON.parse(this.state.formData.params);
        }else{
          dataMapConfig=this.refs.nodeParamsConfig.getData();
        }

        this.setState({mask:true});
        AjaxUtils.post(previewJsonPath,{processId:this.processId,nodeId:this.nodeObj.key,dataMapConfig:JSON.stringify(dataMapConfig)},(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              let sourceJsonStr=AjaxUtils.formatJson(JSON.stringify(data.sourceJson));
              let targetJsonStr=AjaxUtils.formatJson(JSON.stringify(data.targetJson));
              this.setState({sourceJson:sourceJsonStr,targetJson:targetJsonStr});
            }
        });
      }
  }

  // 遍历解析Json
parseJson=(jsonObj)=>{
    // 循环所有键
    let x=0;
    for(var key in jsonObj) {
        //如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
        var element = jsonObj[key];
        if(element.length > 0 && typeof(element) == "object" || typeof(element) == "object") {
            this.parseJson(element);
        } else { //不是对象或数组、直接输出
          let spos=key.indexOf(".");
          if(spos!==-1){
            //说明是有层次的
            let fistKey=key.substring(0,spos);
            let lastKey=key.substring(spos+1);
            let lastObj={};
            lastObj[lastKey]="";
            delete jsonObj[key];
            if(lastKey.indexOf(".")!==-1){
             this.parseJson(lastObj);
            }
            // console.log("fistKey=>" + fistKey + " lastKey=="+lastKey);
            let valueObj=jsonObj[fistKey];
            // console.log("valueObj=="+JSON.stringify(valueObj));
            // console.log("lastObj=="+JSON.stringify(lastObj));
            if(valueObj===undefined){
              jsonObj[fistKey]=lastObj;
            }else{
              //要在valueObj的倒数第层设置一个属性
             var obj = this.mergeJSON(valueObj,lastObj); //合并到llastObj对象中
              jsonObj[fistKey]=lastObj;
            }
          }else{
            //没有层次结构的不处理
          }
        }
        x++;
    }
    // console.log(jsonObj);
    return jsonObj;
}

// 遇到相同元素级属性，以（minor）为准 // 不返还新Object，而是main改变
mergeJSON=(minor, main)=>{
      for(var key in minor) {
          if(main[key] === undefined) { // 不冲突的，直接赋值
              main[key] = minor[key];
              continue;
          }
          // 冲突了，如果是Object，看看有么有不冲突的属性
          // 不是Object 则以（minor）为准为主，
          // console.log(key)
          if(this.isJSON(minor[key])||this.isArray(minor[key])) { // arguments.callee 递归调用，并且与函数名解耦
              // console.log("is json")
              //arguments.callee(minor[key], main[key]);
              this.mergeJSON(minor[key], main[key]);
          }else{
              main[key] = minor[key];
          }
      }

  }

isJSON=(target)=>{
      return typeof target == "object" && target.constructor == Object;
  }

isArray=(o)=>{
      return Object.prototype.toString.call(o) == '[object Array]';
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let paramsJson=this.state.formData.params==undefined?[]:JSON.parse(this.state.formData.params);
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large"  onChange={this.onTabsChange} >
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
                  rules: [{ required: false}],
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
            <FormItem label="逐行转换" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="逐行转换表示对每行数据执行一次映射配置,整体转换表示作为一个整体执行一次映射配置"
            >
              {getFieldDecorator('rowMapFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是(逐行转换)</Radio>
                  <Radio value='0'>否(整体转换)</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="继承数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("rowMapFlag")==='0'?'none':''}}
              help="未配置字段的数据继承源数据行的字段值"
            >
              {getFieldDecorator('copyRowData',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="调试" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="在调试中输出转换前和转换后的数据"
            >
              {getFieldDecorator('debugData',{initialValue:'1'})
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
          <TabPane  tab="转换配置" key="mapConfig"  >
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}} >
              <JsonMapNodeParams ref='nodeParamsConfig' params={paramsJson} processId={this.processId} nodeId={this.nodeObj.key}  />
            </div>
            <div>逐行转换示例:取源数据$.userid即可,整体转换示例:$.data[0].userid表示取第一行的userid</div>
          </TabPane>
          <TabPane  tab="转换预览" key="dataPrview"  >
              <Card title='转换后JSON数据'>
                <Input.TextArea  rows={20}  value={this.state.targetJson}  />
              </Card>
            <div>注意:数据以最终运行执行时为准,可以选择调试输出数据查看最终的转换结果</div>
          </TabPane>
          <TabPane  tab="转换规则" key="mapRule"   >
            <Row>
              <Col span={4} style={{textAlign:'right'}}>转换逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.mapCode}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                通过JS逻辑对数据进行转换:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>数据转换示例</a> <Divider type="vertical" />{' '}
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

export default  Form.create()(form);
