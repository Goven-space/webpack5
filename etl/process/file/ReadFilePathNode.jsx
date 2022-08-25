import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//文本文件读取

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.pNodeRole="source";
    this.state={
      mask:false,
      formData:{tableColumns:'[]'},
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
          postData.pNodeRole=this.pNodeRole;
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
          let title=postData.pNodeId+"#"+postData.pNodeName;
          if(values.readType=='4'){
            title=postData.pNodeName+"#监听文件传入";
          }
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
              <FormItem label="读取模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定文件的读取模式'
              >
                {getFieldDecorator('readType',{initialValue:'1'})
                (
                  (<Select  >
                  <Option value='1'>指定具体的文件路径</Option>
                  <Option value='2'>在指定目录中获取文件修改时间大于流程最后一次运行时间的文件</Option>
                  <Option value='3'>指定目录中的所有文件</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem label="指定文件目录"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("readType")==='4'?'none':''}}
                help='指定要读取文件的所在目录如：d:/etl/file,目录可以是一节点设置的变量如:${folder}'
              >
                {getFieldDecorator('filePath',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="文件后缀规则"
                help='指定要读取的文件后缀类型多个用逗号分隔，空表示所有文件'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(this.props.form.getFieldValue("readType")==='1'||this.props.form.getFieldValue("readType")==='4')?'none':''}}
              >{
                getFieldDecorator('fileExtension',{rules: [{ required:false}],initialValue:'txt,json,xml,csv'})
                (<Input />)
                }
              </FormItem>
              <FormItem label="文件名匹配规则"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(this.props.form.getFieldValue("readType")==='1'||this.props.form.getFieldValue("readType")==='4')?'none':''}}
                help='指定文件名匹配规则支持正则表达式(以^开头表示正则表达式否则表示包含字符串)，空表示所有文件'
              >
                {getFieldDecorator('fileNameRule',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="往前偏移时间(秒)"
                help='指定本节点最后运行时间的往前偏移多少秒再与文件修改时间进行对比,0表示不偏移'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(this.props.form.getFieldValue("readType")==='1'||this.props.form.getFieldValue("readType")==='3')?'none':''}}
              >{
                getFieldDecorator('forwardSecond',{rules: [{ required:false}],initialValue:10})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem label="文件名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("readType")==='1'?'':'none'}}
                help='文件名中可以使用${变量}来接收上一节点设置的变量参数'
              >
                {getFieldDecorator('fileName',{rules: [{ required: false}],initialValue:'test.txt'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="文件名包含时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("readType")==='1'?'':'none'}}
                help='在文件名的结尾自动追加时间,如果为空表示不包含时间(格式：yyyyMMddHHmmss)'
              >
                {getFieldDecorator('dateTimeFormat',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="最大读取文件数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(this.props.form.getFieldValue("readType")==='1' || this.props.form.getFieldValue("readType")==='4')?'none':''}}
                help='一次运行时是否可以读取多个文件的数据进行合并0表示不限制，其他表示每次最大读取的文件数'
              >{
                getFieldDecorator('maxReadFileCount',{rules: [{ required: true}],initialValue:"0"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="文件名存放变量Id"
                help='指定读取到的文件名放的变量Id,全局变量中会以NodeId_变量Id形式存放'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fileVariableId',{initialValue:'ReadFileList'})
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
            <FormItem label="未找到文件时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定未找到读取的文件时是否断言失败'
            >
              {getFieldDecorator('notFindFile',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>断言成功</Radio>
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

        <FormItem wrapperCol={{ span: 4, offset: 20 }} >
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
