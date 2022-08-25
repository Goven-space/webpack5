import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

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
              if(JSON.stringify(data)==='{}'){
                data={pNodeName:this.nodeObj.text,pNodeId:this.nodeObj.key,processId:this.processId,pNodeType:this.nodeObj.nodeType,
                  msgType:'text',
                  title:'钉钉机器人提醒消息',
                  body:'来自${processName}的消息',
                };
              }
              // console.log(data);
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
    let msgType=this.props.form.getFieldValue("msgType");
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
                  rules: [{ required: false}]
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
                  rules: [{ required: true}]
                })
                (<Input  disabled={true} />)
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
                (<Input  />)
              }
            </FormItem>
            <FormItem
              label="WebHook"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="填写钉钉机器人的WebHook地址"
            >{
              getFieldDecorator('webhook',{rules: [{ required: true}],initialValue:'${#config.webhook}'})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="Secret"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="钉钉加签模式时的密钥"
            >{
              getFieldDecorator('secret',{rules: [{ required: false}],initialValue:''})
              (<Input  />)
              }
            </FormItem>
            <FormItem label="消息类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="请指定钉钉消息的类型"
            >
              {getFieldDecorator('msgType',{initialValue:'text'})
              (
                <RadioGroup>
                  <Radio value='text'>text</Radio>
                  <Radio value='link'>link</Radio>
                  <Radio value='markdown'>markdown</Radio>
                  <Radio value='action_card'>action_card</Radio>
                  <Radio value='json'>自定义</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="标题"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:msgType=='action_card' || msgType=='link' || msgType=='markdown' || msgType=='json'?'':'none'}}
              help='markdown消息类型的标题可以使用${变量}获取上一节点的结果数据'
            >{
              getFieldDecorator('title',{rules: [{ required: false}]})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="链接URL"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:(msgType==='link' || msgType==='action_card')?'':'none'}}
              help='link/action_card消息类型的链接url地址,可以使用${变量}获取上一节点的结果数据'
            >{
              getFieldDecorator('messageUrl',{rules: [{ required: false}]})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="消息内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='使用${变量}获取上一节点的结果数据'
            >{
              getFieldDecorator('body',{rules: [{ required: true}]})
              (<Input.TextArea autosize style={{minHeight:'100px'}} />)
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

const DingNode = Form.create()(form);

export default DingNode;
