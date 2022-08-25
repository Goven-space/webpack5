import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Tag,Tabs,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import UserActionButtonConfig from './components/UserActionButtonConfig';
import FieldItemConfig from './components/FieldItemConfig';

//普通用户审批节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.BPM.CORE_BPM_PROCESSNODE.props;
const SubmitUrl=URI.BPM.CORE_BPM_PROCESSNODE.save; //存盘地址

const defaultActionIds=[
  {actionId:"startRouter",actionName:"提交后继路由",visible:false},
  {actionId:"startNode",actionName:"提交指定节点",visible:true},
  {actionId:"transferOtherUser",actionName:"转交",visible:true},
  {actionId:"backFirstNode",actionName:"回退首环节",visible:false},
  {actionId:"backAnyNode",actionName:"回退任意节点",visible:false}
];

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      mask:false,
      formData:{},
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
              if(data.pNodeId==undefined){
                data.pNodeName=this.nodeObj.text;
                data.pNodeId=this.nodeObj.key;
                data.approveUserIds=this.userId;
              }
              if(data.approveUserIds){data.approveUserIds=data.approveUserIds.split(",");}
              if(data.actionIdConfigs=='[]'||data.actionIdConfigs==''||data.actionIdConfigs==undefined){
                data.actionIdConfigs=JSON.stringify(defaultActionIds);
              }
              this.setState({formData:data});
              FormUtils.setFormFieldValues(this.props.form,data);
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
          postData.nodeType=postData.pNodeType=this.nodeObj.nodeType;
          postData.actionIdConfigs=this.getActionIdConfigs();
          postData.fieldConfigs=this.getFieldConfigs();
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

  //获得操作配置
  getActionIdConfigs = () => {
    if (this.refs.UserActionButtonConfig) {
      return JSON.stringify(this.refs.UserActionButtonConfig.getData());
    } else {
      return this.state.formData.actionIdConfigs;
    }
  }

  //获得字段配置
  getFieldConfigs = () => {
    if (this.refs.FieldItemConfig) {
      return JSON.stringify(this.refs.FieldItemConfig.getData());
    } else {
      return this.state.formData.fieldConfigs;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let actionIdConfigs = this.state.formData.actionIdConfigs == undefined ? [] : JSON.parse(this.state.formData.actionIdConfigs);
    let fieldConfigs=this.state.formData.fieldConfigs||"[]";
    if(fieldConfigs==''){fieldConfigs="[]";}
    fieldConfigs =JSON.parse(fieldConfigs);

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
            <FormItem label="传入用户" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}  help="是否允许前继审批节点选择本节点的用户并传入" >
              {getFieldDecorator('allowSelectUser',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="审批用户"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定可以审批本节点的用户'
            >{
              getFieldDecorator('approveUserIds',{rules: [{ required: true}],initialValue:this.userId})
              (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
            }
            </FormItem>
            <FormItem
              label="阶段"
              help="指定流程阶段进度时使用，相同阶段的节点会被聚合在一起显示"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('processStage')
              (<Input />)
              }
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
          <TabPane  tab="动作设置" key="actionIds"  >
            <UserActionButtonConfig  ref='UserActionButtonConfig' actionIdConfigs={actionIdConfigs} nodeId={this.nodeId} processId={this.processId} applicationId={this.applicationId}  />
          </TabPane>
          <TabPane  tab="表单设置" key="formConfig"  >
            <FormItem
              label="PC端表单ID"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('pcFormId')
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="移动端表单ID"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('mobileFormId')
              (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="字段设置" key="fieldConfig"  >
            <FieldItemConfig  ref='FieldItemConfig' fieldConfigs={fieldConfigs} nodeId={this.nodeId} processId={this.processId} applicationId={this.applicationId}  />
          </TabPane>
          <TabPane  tab="办理时限" key="timeConfig"  >
            <FormItem
              label="限制完成时间(分钟)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定必须在限制时间内完成处理,从待办到达开始计算'
            >{
              getFieldDecorator('exceedTime',{rules: [{ required: true}],initialValue:"30"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="提前告警时间(分钟)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定提前多少分钟之前进行告警'
            >{
              getFieldDecorator('tirstTriggerTime',{rules: [{ required: true}],initialValue:"30"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="最大告警次数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定最大告警次数'
            >{
              getFieldDecorator('maxTriggerCount',{rules: [{ required: true}],initialValue:"3"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem label="告警方式" help='指定告警通知的方式' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('warningType',{initialValue:'SendMail'})
              (
                <Select  >
                  <Option value='SendMail'>邮件</Option>
                  <Option value='SendSms'>手机短信</Option>
                  <Option value='SendDingDing'>发送钉钉消息</Option>
                  <Option value='SendWeiXin'>发送企业微信消息</Option>
                  <Option value='RunRule'>执行自定义规则</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="超时策略" help='超时后如何处理本节点' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('overTimeEvent',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>不处理</Option>
                  <Option value='2'>回退给提交者</Option>
                  <Option value='3'>提交下一节点</Option>
                  <Option value='4'>转给流程管理员</Option>
                  <Option value='5'>执行自定义规则</Option>
                </Select>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="审批意见" key="remarkConfig"  >
            <FormItem label="必填" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('mustRemark',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="意见级别" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="对不同节点的意见进行分级,方便把相同级别的意见显示在表单上面"
            >
              {getFieldDecorator('remarkType',{initialValue:'1'})

              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem label="提示信息" help='给审批者在审批时的一些提示信息' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('remarkInfo',{initialValue:''})
              (
                <Input.TextArea autosize />
              )}
            </FormItem>
            <FormItem label="初始意见" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('initRemark',{initialValue:''})
              (
                <Input.TextArea autosize />
              )}
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

export default Form.create()(form);
