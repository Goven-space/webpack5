import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Tag,Tabs,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

//手动确认节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.BPM.CORE_BPM_PROCESSNODE.props;
const SubmitUrl=URI.BPM.CORE_BPM_PROCESSNODE.save; //存盘地址

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
          postData.nodeType=postData.pNodeType=this.nodeObj.nodeType;
          postData.allowSelectUser="0";
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
            <FormItem
              label="回调API"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="业务系统完成处理后回调本API即可让流程继续执行,回调POST的JSON参数会写入表单字段中"
            >
            <Tag color="blue">POST</Tag>
              {host+"/bpm/process/callback?applicationId=&transactionId=事务id&nodeId="+this.nodeObj.key}
            </FormItem>
            <FormItem
              label="提示信息"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="用户提交后的提示信息"
            >{
              getFieldDecorator('tip',{
                rules: [{ required: true}],
                initialValue:'流程需要等待业务系统进行处理'
              })
              (<Input />)
              }
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
                  <Option value='3'>提交下一节点</Option>
                  <Option value='5'>执行自定义规则</Option>
                </Select>
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
