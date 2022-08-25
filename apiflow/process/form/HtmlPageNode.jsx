import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Tabs,Tag} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import EditSQLCode from './components/EditSQLCode';

//html页面节点

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
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.state={
      mask:false,
      formData:{htmlCode:this.getDefaultHtmlCode()},
      filtersBeans:[],
      modelCol:[],
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  getDefaultHtmlCode=()=>{
    return `<html>
<body>
<center>请点击后跳转到下一步</center>
<a href="/restcloud/rest/esb/process/nextpage?transactionId=`+"${transactionId}&random=${$random}"+`">第一步</a>
</body>
</html>`;
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
          postData.pNodeType=this.nodeObj.nodeType;
          postData.processId=this.processId;
          postData.pNodeRole=this.pNodeRole;
          try{
            postData.htmlCode=this.refs.htmlCode.getCode();
          }catch(e){}
          let title=postData.pNodeName;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,title); //返回数据模型id作为节点名称
                }
              }
          });
      }
    });
  }


//获取html语句
  getHtmlCode=()=>{
    if(this.refs.htmlCode!==undefined){
      return this.refs.htmlCode.getCode();
    }else{
      return this.state.formData.htmlCode;
    }
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
              hasFeedback
              help="节点id不能重复"
            >
              {
                getFieldDecorator('pNodeId', {
                  rules: [{ required: true}],
                  initialValue:this.nodeObj.key
                })
                (<Input disabled={true} />)
              }
            </FormItem>
            <FormItem label="页面输出方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定本节点的页面输出方式'
            >
              {getFieldDecorator('executerType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>转向到指定页面</Radio>
                  <Radio value='2'>直接输出HTML代码</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="转向URL"
              help="指定要转向的页面URL地址(在页面中通过事件回调本流程后可继续执行下一节点)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("executerType")==='1'?'':'none'}}
            >{
              getFieldDecorator('url',{initialValue:'http://localhost/test.html?transactionId=${transactionId}&nodeId=${nodeId}'})
              (<Input   />)
              }
            </FormItem>
            <FormItem label="等待回调" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定本节点是否需要页面回调才流转到下一节点(否一般用在最后一个结束页面中)'
            >
              {getFieldDecorator('pageCallBackFlag',{initialValue:'1'})
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
              (<Input.TextArea autoSize />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="HTML代码" key="htmlCode"  >
            <div style={{maxHeight:'550px',overflowY:'scroll'}}>
                <EditSQLCode  code={this.state.formData.htmlCode} ref='htmlCode'  getSelectSql={this.getHtmlCode}  />
                {'提示:配置的HTML代码会直接输出到调用端,通过${变量}获取变量如:${transactionId},${$random},${nodeId},${processId}'}
            </div>
          </TabPane>
          <TabPane  tab="回调API" key="api"  >
            <FormItem
              label="页面回调API"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="页面处理完后,通过按扭或事件回调API可让流程执行到下一节点并可传入表单数据给下一节点"
            >
            <Tag color="blue">POST</Tag>
              {host+"/rest/esb/process/nextnode?transactionId=事务id"}
            </FormItem>
            <FormItem
              label="页面跳转API"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="在页面中处理完后,通过按扭或链接直接跳转到下一个页面"
            >
            <Tag color="blue">GET</Tag>
              {host+"/rest/esb/process/nextpage?transactionId=事务id&random=随机数"}
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 4, offset: 20 }}>
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
