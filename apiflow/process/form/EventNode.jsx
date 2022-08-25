import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditJavaCode from '../../../core/components/EditJavaCode';
import ApiExportParamsConfig from './components/ApiExportParamsConfig';

//执行Java脚本规则节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const getByRuleId=URI.ESB.CORE_ESB_RULE.getByRuleId; //根据规则ruleId获取规则配置数据
const saveRuleDataUrl=URI.ESB.CORE_ESB_RULE.save; //保存规则代码

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.state={
      mask:false,
      formData:{},
      ruleData:{},
      disabledRule:true,
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
                this.loadRuleData();//载入规则
              }
              // console.log(data);
            }
        });
  }

  loadRuleData=()=>{
    let ruleId=this.props.form.getFieldValue("ruleId");
    if(ruleId===''||ruleId===undefined){return;}
    let url=getByRuleId.replace("{ruleId}",ruleId);
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({ruleData:data,disabledRule:false});
        }
    });
  }

  ruleChange=(value, nodeLabel, extra)=>{
    this.setState({disabledRule:true});
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
          postData.exportParams=JSON.stringify(this.getExportParamsConfig()); //输出参数转换为字符串
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
      }
    });
  }

  //保存代码
  saveEditCode=(classPath,code,ruleData,showMsg)=>{
    this.setState({loading:true});
    ruleData.ruleCode=code;
    AjaxUtils.post(saveRuleDataUrl,ruleData,(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        if(showMsg){
          AjaxUtils.showInfo("保存成功!");
        }
      }
    });
  }

  //获得规则的输出参数配置
  getExportParamsConfig=()=>{
    if(this.refs.exportParams){
      return this.refs.exportParams.getData();
    }else{
      return JSON.parse(this.state.formData.exportParams||'[]');
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const codeContent=<EditJavaCode ref="editJavaCodeObj"  code={this.state.ruleData.ruleCode} record={this.state.ruleData} saveEditCode={this.saveEditCode} templateType="ESBProcessRule"  />;
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
              label="选择要执行的规则"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='通过规则可以对API返回的数据进行二次处理'
            >
              {
                getFieldDecorator('ruleId', {
                  rules: [{ required: true}]
                })
                (<TreeNodeSelect url={this.applicationRuleSelectUrl} onChange={this.ruleChange} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="规则执行结果数据是否输出给本流程发布的API的调用端"
            >
              {getFieldDecorator('responseData',{initialValue:'0'})
              (
                <Select  >
                  <Option value='1'>输出API结果到调用端</Option>
                  <Option value='0'>不输出API结果</Option>
                </Select>
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
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
              保存
            </Button>
              {' '}
              <Button onClick={this.props.close.bind(this,false)}  >
                关闭
              </Button>
          </FormItem>
        </TabPane>
        <TabPane  tab="规则代码" key="ruleEditor" disabled={this.state.disabledRule}  >
          {codeContent}
        </TabPane>
        <TabPane  tab="输出参数" key="exportParamsTag"  >
          <ApiExportParamsConfig ref='exportParams' exportParams={exportParamsJson} />
          把本节点输出的数据进行设置，方便后继节点选择输入参数
        </TabPane>
      </Tabs>
      </Form>
      </Spin>
    );
  }
}

const EventNode = Form.create()(form);

export default EventNode;
