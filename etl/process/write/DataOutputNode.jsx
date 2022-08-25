import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

//数据调试输出节点

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
    this.pNodeRole="target";
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
    let outputType=this.props.form.getFieldValue("outputType");
    let logFilePath=this.props.form.getFieldValue("logFilePath");
    if(outputType==="3" && logFilePath===''){
      AjaxUtils.showError("请指定一个文件!");
      return;
    }
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
              <FormItem label="输出方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='指定数据输出的位置方便调试查看数据是否符合预期结果'
              >
                {getFieldDecorator('outputType',{initialValue:'1'})
                (
                  <Select  >
                  <Option value='1'>在控制台日志中输出</Option>
                  <Option value='2'>在调试日志中输出</Option>
                  <Option value='3'>输出到指定文件</Option>
                  <Option value='4'>不输出</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="指定文件路径"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("outputType")==='3'?'':'none'}}
                help='输出到指定文件时请指定服务器的目录如：d:/etl/log,不指定则输出到默认目录中'
              >
                {getFieldDecorator('logFilePath',{initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="起始记录数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定从第多个行数据开始输出0表示从第一行开始输出'
              >{
                getFieldDecorator('startNum',{rules: [{ required: false}],initialValue:0})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="最大输出记录"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定最大数据输出的记录数,0表示不限定'
              >{
                getFieldDecorator('maxWriteNum',{rules: [{ required: false}],initialValue:30})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="输出范围"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='仅输出数据行可以更清楚的查看数据结构,全部表示可以查看到当前数据流中包含的所有变量值和数据'
              >{
                getFieldDecorator('outputRows',{rules: [{ required: false}],initialValue:'1'})
                (  <Select>
                    <Option value='1'>仅逐行输出数据</Option>
                    <Option value='2'>仅输出变量不含数据</Option>
                    <Option value='4'>仅输出包含的记录总数</Option>
                    <Option value='3'>全部(包含变量和数据)</Option>
                  </Select>)
                }
              </FormItem>
              <FormItem
                label="仅调试时输出"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='调试时输出数据，正式运行时不会输出日志数据'
              >{
                getFieldDecorator('debugOnlyFlag',{rules: [{ required: false}],initialValue:'1'})
                (  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='2'>否</Radio>
                  </RadioGroup>)
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
