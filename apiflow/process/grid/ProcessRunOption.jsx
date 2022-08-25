import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AceEditor from '../../../core/components/AceEditor';
import ProcessMonitor from '../ProcessMonitor';

//手动执行流程选项,运行一次还是单步调试

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const RUN_URL=URI.ESB.CORE_ESB_CONFIG.run;
const GetTestParamsUrl=URI.ESB.CORE_ESB_CONFIG.testParamsProcess;
const SaveTestParamsUrl=URI.ESB.CORE_ESB_CONFIG.testParamsProcessSave;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.state={
      mask:false,
      formData:{},
      transactionId:'',
    };
  }

  componentDidMount(){
    let url=GetTestParamsUrl+"?id="+this.processId;
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        let formData=this.state.formData;
        formData.singleStep='false';
        formData.requestBody=AjaxUtils.formatJson(JSON.stringify(data));
        this.setState({formData:formData});
        FormUtils.setFormFieldValues(this.props.form,formData);
      }
    });
  }

  saveTestParams=()=>{
    let body=this.props.form.getFieldValue("requestBody");
    AjaxUtils.post(SaveTestParamsUrl,{id:this.processId,testParams:body},(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
        let transactionId=AjaxUtils.getId(22);
        let body=values.requestBody;
        let url=RUN_URL+"?processId="+this.processId+"&transactionId="+transactionId+"&singleStep="+values.singleStep;
        AjaxUtils.postBody(url,body,(data)=>{
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              AjaxUtils.showInfo("流程运行结果:"+(data.msg===undefined?'-未知-':data.msg));
            }
        });
        this.setState({transactionId:transactionId});
      });
  }

  formatRequestBodyJsonStr=()=>{
    let value=this.props.form.getFieldValue("requestBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"requestBody":value});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
    {
      this.state.transactionId==''?
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="手动运行流程" key="props"  >
            <FormItem
              label="传入测试参数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help={<span>运行时传入的测试参数或变量,没有参数可设为空,<a onClick={this.formatRequestBodyJsonStr} >格式化JSON</a>{' '}</span>}
            >{
              getFieldDecorator('requestBody',{
                rules: [{ required: false}],
                initialValue:'{\nid:1\n}'
              })
              (<AceEditor mode='json' width='100%' height='300px'/>)}
            </FormItem>
            <FormItem
              label="运行方式"
              help='指定流程运行的方式'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('singleStep',{initialValue:'false'})
                ( <RadioGroup>
                  <Radio value='false'>执行一次</Radio>
                  <Radio value='true'>单步调试</Radio>
                </RadioGroup>)
              }
            </FormItem>
          </TabPane>
        </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
              开始运行
            </Button>{' '}
            <Button type="save" onClick={this.saveTestParams}  >保存测试参数</Button>{' '}
              <Button onClick={this.props.close.bind(this,false)}  >
                关闭
              </Button>

          </FormItem>
      </Form>
      :
        <ProcessMonitor status='current' processId={this.processId} transactionId={this.state.transactionId} appId={this.appId}   />
      }
      </Spin>
    );
  }
}

export default Form.create()(form);
