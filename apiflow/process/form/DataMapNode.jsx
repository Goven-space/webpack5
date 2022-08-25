import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Modal,Tag,Card,Switch,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DataMapNodeParams from './components/DataMapNodeParams';
import DataMapNodeParams_Graph from './components/DataMapNodeParams_Graph';
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

//json数据转换器

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const previewJsonPath=URI.ESB.CORE_ESB_PROCESSNODE.previewJsonPath;
const SelectNodeUrl=URI.ESB.CORE_ESB_PROCESSNODE.selectNode; //节点选择

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
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

 //获取字段映射配置
  getMapParams=()=>{
    return JSON.parse(this.state.formData.params);
  }

  updateMapParams=(data)=>{
    this.state.formData.params=JSON.stringify(data);
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.mapCode=newCode; //断言代码
  }

    inserDemo2=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//indoc为上一节点输出参数并作为下一节点的输入参数
function converter(engine,nodeDoc,nodeId,indoc){
  indoc.put("count",DocumentUtil.getInteger(indoc, "count")); //字符串转为数字
  indoc.put("user_name",indoc.get("userName"));//修改字段名
  indoc.remove("user_tel"); //删除不需要的字段
}`;
      codeMirror.setValue(code);
      this.state.formData.mapCode=code;
    }

    inserDemo3=()=>{
        let codeMirror=this.refs.codeMirror.getCodeMirror();
        let code=`//indoc为上一节点输出参数并作为下一节点的输入参数
function converter(engine,nodeDoc,nodeId,indoc){
  //对数组中的数据进行转换
  var rowDocs=indoc.get("rows");
  for(x in rowDocs){
    var rowDoc=rowDocs[x];
    rowDoc.put("user_id",rowDoc.get("userId")); //修改字段名
    rowDoc.remove("tel");//删除字段
  }
}`;
        codeMirror.setValue(code);
        this.state.formData.mapCode=code;
    }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let paramsJson=this.state.formData.params==undefined?[]:JSON.parse(this.state.formData.params);
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large"   >
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
            <FormItem label="要转换的数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="指定要进行转换的数据"
            >
              {getFieldDecorator('dataType',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>对流程的最终输出结果数据进行转换</Option>
                  <Option value='2'>仅对上一节点的输出结果进行转换</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="数据类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="指明要转换的数据类型,如果是数组会对每一行中的字段进行转换"
            >
              {getFieldDecorator('objectType',{initialValue:'object'})
              (
                <RadioGroup>
                  <Radio value='object'>对象</Radio>
                  <Radio value='array'>数组</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="字段所在层级"
              help="数据所在层级(空表示根层),输出结果层级:$.T00001.data,上一节点输入层级$.data"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('dataJsonPath',{initialValue:''})
              (<Input   />)
              }
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
          <TabPane  tab="映射配置" key="mapConfig"  >
            <DataMapNodeParams ref='nodeParamsConfig' updateMapParams={this.updateMapParams} getMapParams={this.getMapParams}  processId={this.processId} nodeId={this.nodeObj.key} parentForm={this.props.form} />
            <div>源字段Id将转换为目标字段Id</div>
          </TabPane>
          <TabPane  tab="映射关系图" key="graphConfig"  >
            <div style={{height:'550px',width:'950px',overflow:'auto'}} >
              <DataMapNodeParams_Graph ref='nodeParamsConfig_graph' getMapParams={this.getMapParams} updateMapParams={this.updateMapParams} processId={this.processId} nodeId={this.nodeObj.key} parentForm={this.props.form}  />
            </div>
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
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>数据转换示例1</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>数据转换示例2</a>
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
