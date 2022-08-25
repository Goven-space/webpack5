import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//shell 脚本执行节点

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
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.pNodeRole="event";
    this.state={
      mask:false,
      formData:{},
      filtersBeans:[],
      modelCol:[],
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
          postData.pNodeType=this.nodeObj.nodeType;
          postData.processId=this.processId;
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
                  this.props.close(true,title); //返回数据模型id作为节点名称
                }
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
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
          <TabPane  tab="Shell脚本" key="shellCode"  >
            <FormItem label="运行方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('runType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>本地</Radio>
                  <Radio value='2'>远程服务器</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="远程服务器IP"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              style={{display:this.props.form.getFieldValue("runType")==='2'?'':'none'}}
              help='如果为空表示在本地服务器执行'
            >{
              getFieldDecorator('ip')
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="远程服务器用户Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              style={{display:this.props.form.getFieldValue("runType")==='2'?'':'none'}}
              help='登录远程服务器的用户Id'
            >{
              getFieldDecorator('sshuserid')
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="远程服务器用户密码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              style={{display:this.props.form.getFieldValue("runType")==='2'?'':'none'}}
              help='登录远程服务器的用户密码'
            >{
              getFieldDecorator('sshpwd')
              (<Input type='password' />)
              }
            </FormItem>
            <FormItem
              label="超时时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("runType")==='2'?'':'none'}}
              help='执行和链接超时时间毫秒'
            >{
              getFieldDecorator('sshtimeout',{rules: [{ required: true}],initialValue:300000})
              (<InputNumber min={1}  />)
              }
            </FormItem>
            <FormItem
              label="切换工作目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='空表示不切换'
            >{
              getFieldDecorator('directory')
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="Shell脚本"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help={'提示:每行一句命令可以使用${变量}获取变量'}
            >{
              getFieldDecorator('shellCode',{initialValue:"sh \n-c\necho \"hello word\""})
              (<Input.TextArea   rows={12}  />)
              }
            </FormItem>
            <FormItem
              label="结果保存"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='指定shell脚本执行完的结果保存的变量传入到下一节点中'
            >{
              getFieldDecorator('result',{
                rules: [{ required: true}],
                initialValue:'shellResult'
              })
              (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>失败</Radio>
                  <Radio value='1'>成功</Radio>
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
