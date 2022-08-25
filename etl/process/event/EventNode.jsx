import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditJavaCode from '../../../core/components/EditJavaCode';

//执行java规则节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const ruleSelectUrl=URI.ETL.RULE.select;
const getByRuleId=URI.ETL.RULE.getByRuleId; //根据规则ruleId获取规则配置数据
const saveRuleDataUrl=URI.ETL.RULE.save; //保存规则代码

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole='event';
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
          postData.pNodeRole=this.pNodeRole;
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const codeContent=<EditJavaCode ref="editJavaCodeObj"  code={this.state.ruleData.ruleCode} record={this.state.ruleData} saveEditCode={this.saveEditCode} templateType="ETLProcessRule"  />;

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
            <FormItem
              label="规则参数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='本参数将传入到规则的params变量中'
            >{
              getFieldDecorator('ruleParams')
              (<Input />)
              }
            </FormItem>
            <FormItem label="补偿时跳过" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当流程进行补偿运行时如果不想重复执行规则可以选择跳过"
            >
              {getFieldDecorator('skipCompensateFlag',{initialValue:'0'})
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
        <TabPane  tab="编辑规则" key="ruleEditor" disabled={this.state.disabledRule}  >
          {codeContent}
        </TabPane>
      </Tabs>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
