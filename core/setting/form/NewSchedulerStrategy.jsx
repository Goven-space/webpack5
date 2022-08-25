import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

//新增定时调度策略

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_SCHEDULER_STRATEGY.getById;
const SubmitUrl=URI.CORE_SCHEDULER_STRATEGY.save;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.state={
      mask:false,
      RdbDisplay:'',
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        FormUtils.getSerialNumber(this.props.form,"ruleId",this.appId,"TIME");
        return;
      }
      let url=GetById.replace("{id}",this.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true);
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
        <FormItem
          label="策略唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定一个唯一Id,如果id已被引用修改id会引起错误"
        >
          {
            getFieldDecorator('ruleId', {
              rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="策略名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本策略的说明"
        >
          {
            getFieldDecorator('ruleName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="定时表达式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='格式请参见quartz开源组件的表达式,注意:使用{i}可以表示一个1-60的随机数,可以避免所有服务器在同一时间运行任务'
        >
          {
            getFieldDecorator('expression', {
              rules: [{ required: true, message: '请输入定时表达式' }]})
              (<Select mode='combobox' >
                <Option value='0/10 * * * * ?'>每隔秒数执行</Option>
                <Option value='0 0/3 * * * ?'>每隔分钟数执行</Option>
                <Option value='0 0 12 * * ?'>每天中午12点执行</Option>
                <Option value='0 15 23 * * ?'>每天晚上23点15分执行 </Option>
              </Select>)
          }
        </FormItem>
        <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}  help='停用表示所有引用此调度策略的流程都不会被安排调度' >
          {getFieldDecorator('state',{initialValue:'1'})
          (
            <RadioGroup>
              <Radio value='1'>启用</Radio>
              <Radio value='0'>停用</Radio>
            </RadioGroup>
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

const NewSchedulerStrategy = Form.create()(form);

export default NewSchedulerStrategy;
