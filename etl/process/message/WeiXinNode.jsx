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
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址

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
        let body="ETL流程名称:${processName}\n开始时间:${startTime}\n结束时间:${endTime}\n总读取数据量:${totalReadCount}\n成功传输数据量:${totalSuccessCount}\n失败传输数据量:${totalFailedCount}";
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.key;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              if(JSON.stringify(data)==='{}'){
                data={pNodeName:this.nodeObj.text,pNodeId:this.nodeObj.key,processId:this.processId,pNodeType:this.nodeObj.nodeType,
                  timeType:'weixin',
                  corpId:'${$config.corpId}',
                  secrect:'${$config.secrect}',
                  agentId:'1000001',
                  body:body,
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
              label="企业corpId"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请在企业微信中获取此corpId,可使用${#config.corpId}引用变量"
            >{
              getFieldDecorator('corpId',{rules: [{ required: true}],initialValue:'${#config.corpId}'})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="应用AgentId"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请在企业微信中的应用中获取AgentId,可使用${#config.corpId}引用变量"
            >{
              getFieldDecorator('agentId',{rules: [{ required: true}],initialValue:'${#config.agentId}'})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="应用密钥"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请在企业微信中的应用中获取此密钥,可使用${$config.secrect}引用变量"
            >{
              getFieldDecorator('secrect',{rules: [{ required: true}],initialValue:'${#config.secrect}'})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="微信接收UserId"
              help="成员ID列表（消息接收者，多个接收者用‘|’分隔，最多支持1000个）。特殊情况：指定为@all，则向该企业应用的全部成员发送，支持${变量}"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sendTo',{rules: [{ required: true}]})
              (<Input   />)
              }
            </FormItem>
            <FormItem
              label="消息内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='使用${变量}可以获取上一节点的执行结果数据'
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

const WeiXinNode = Form.create()(form);

export default WeiXinNode;
