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
                  timeType:'mail',
                  msgType:'message',
                  title:'ETL流程${processName}运行结果通知!',
                  body:body,
                  bodyType:'html',
                  exceptionAssert:'0',
                  assertAction:'1'
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
              label="接收地址"
              help="请填写邮件地址,支持${变量}"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sendTo',{rules: [{ required: true}],initialValue:''})
              (<Input   />)
              }
            </FormItem>
            <FormItem
              label="邮件标题"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='使用${变量}可以获取变量值'
            >{
              getFieldDecorator('title',{rules: [{ required: true}]})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="邮件内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='使用${变量}可以获取局部或全局变量,支持html标签格式化内容,支持${$.data[].id}获取数据流内容'
            >{
              getFieldDecorator('body',{rules: [{ required: true}]})
              (<Input.TextArea autosize style={{minHeight:'100px'}} />)
              }
            </FormItem>
            <FormItem label="内容模板" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="使用HTML Velocity模板语法来发送HTML报表邮件,可以把运算结果直接发送报表出去"
            >
              {getFieldDecorator('bodyType',{initialValue:'html'})
              (
                <RadioGroup>
                  <Radio value='html'>普通HTML文本</Radio>
                  <Radio value='velocity'>Velocity模板</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="附件配置" key="fileattachment"  >
            <FormItem label="附件来源" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定附件文件的来源'
            >
              {getFieldDecorator('mailFileFrom',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>不发送</Radio>
                  <Radio value='1'>手动指定文件路径</Radio>
                  <Radio value='2'>前继节点读取到的文件列表</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="文件来源变量Id"
              help='指定上一节点的文件列表所在变量Id'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("mailFileFrom")==='2'?'':'none'}}
            >{
              getFieldDecorator('prevNodeReadFileId',{initialValue:'ReadFileList'})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="指定附件路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("mailFileFrom")==='1'?'':'none'}}
              help='可以使用${变量}获取文件路径或者直接指定全路径(多个请用逗号分隔)'
            >{
              getFieldDecorator('filePath',{rules: [{ required: false}]})
              (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>断言成功(忽略异常)</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="断言失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当断言失败时是否终止流程执行,如果不终止则交由后继路由线判断'
            >
              {getFieldDecorator('assertAction',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>终止流程</Radio>
                  <Radio value='0'>继续运行后继节点</Radio>
                </RadioGroup>
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
