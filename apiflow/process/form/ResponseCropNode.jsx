import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ResponseCropNodeConfig from './components/ResponseCropNodeConfig';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
import ReactJson from 'react-json-view'

//对结果数据进行裁剪

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
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
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
          if(this.refs.nodeParamsConfig){
            postData.params=JSON.stringify(this.refs.nodeParamsConfig.getData()); //映射配置json
          }
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

    updateCode=(newCode)=>{
      let formData=this.state.formData;
      formData.code=newCode; //断言代码
    }

    inserDemo=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//对结果数据进行裁剪,map对象为所有API输出结果数据,indoc为上一节点的输入数据
function converter(engine,nodeDoc,nodeId,indoc){
  var map=engine.getResponseMap();//获取结果数据
  map.put("userName","test");//设置一个字段
  map.remove("orderno");//删除一个字段
}`;
      codeMirror.setValue(code);
      this.state.formData.mapCode=code;
    }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let paramsJson=JSON.parse(this.state.formData.params);
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large"  >
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
            <FormItem label="裁剪数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="指定要进行裁剪的数据"
            >
              {getFieldDecorator('dataType',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>对流程的最终输出结果数据进行裁剪</Option>
                  <Option value='2'>仅对上一节点的输出结果进行裁剪,结果作为下一节点的输入</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="结果合并到顶层" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="把输出结果合并到最顶层输出,适用于单个节点结果输出时使用"
            >
              {getFieldDecorator('mergeResult',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="调试" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="在调试中输出裁剪前和裁剪后的数据"
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
          <TabPane  tab="裁剪配置" key="mapConfig"  >
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}} >
              <ResponseCropNodeConfig ref='nodeParamsConfig' params={paramsJson} processId={this.processId} nodeId={this.nodeObj.key}  />
            </div>
            <div>对结果数据裁剪必须指定节点Id如：$.T00001.data.userid,对上一节点流入数据裁剪无需指定节点如:$.data.userid</div>
          </TabPane>
          <TabPane  tab="裁剪规则" key="mapRule"   >
            <Row>
              <Col span={4} style={{textAlign:'right'}}>裁剪逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.code}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                通过JS逻辑对数据进行裁剪:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>数据裁剪示例</a>
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

export default Form.create()(form);
