import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ProcessDesigner from '../ProcessDesigner';

//子流程节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const SelectProcessUrl=URI.ESB.CORE_ESB_PROCESSNODE.selectProcess;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.SelectSubProcessUrl=SelectProcessUrl+"?applicationId="+this.applicationId;
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
          postData.pNodeType=this.nodeObj.nodeType;
          postData.processId=this.processId;
          postData.pNodeRole=this.pNodeRole;
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
              <FormItem
                label="指定子流程"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="请选择一个要执行的子流程"
              >
                {
                  getFieldDecorator('subProcessId',{rules: [{ required: true}],initialValue:''})
                  (<TreeNodeSelect url={this.SelectSubProcessUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
                }
              </FormItem>
              <FormItem label="数据流入" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='上一节点的输出数据流入给本子任务作为输入数据'
              >
                {getFieldDecorator('inDataFlag',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="数据流出" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='本子任务执行的结果数据作为本节点的输出并流入下一节点'
              >
                {getFieldDecorator('outDataFlag',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="子流程结果数据是否输出给本流程发布的API的调用端"
              >
                {getFieldDecorator('responseData',{initialValue:'1'})
                (
                  <Select  >
                    <Option value='1'>输出执行结果给调用端</Option>
                    <Option value='0'>不输出执行结果</Option>
                    <Option value='2'>多次循环调用时累加结果并输出</Option>
                  </Select>
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
            <FormItem label="子流程执行失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当子流程执行失败时是否标记为断言失败?'
            >
              {getFieldDecorator('subProcessFailed',{initialValue:'0'})
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
          <TabPane tab="查看子流程" key="subprocess" disabled={this.props.form.getFieldValue("subProcessId")==''} >
            <ProcessDesigner processId={this.props.form.getFieldValue("subProcessId")} appId={this.appId}   applicationId={this.applicationId}  />
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
