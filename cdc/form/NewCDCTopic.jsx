import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
// import TreeNodeSelect from '../../core/components/TreeNodeSelect';
// import AjaxSelect from '../../core/components/AjaxSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById   = host+"/rest/cdc/topic/getById"; //获取数据接口地址
const SubmitUrl = host+"/rest/cdc/topic/save";; //保存数据接口地址
// const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=Kafka,mqtt,jms,RabbitMQ";

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){return;}
      let url=GetById+"?id="+this.id;
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

  onSubmit = (closeFlag,testConn='') => {
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
                AjaxUtils.showInfo(data.msg);
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
          label="主题说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本消息的说明"
        >
          {
            getFieldDecorator('topicName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="用途"
          help='指定消息用途'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('topicType',{initialValue:'0'})
            (<RadioGroup >
              <Radio value='0'>增量数据采集</Radio>
              <Radio value='1'>其它</Radio>
            </RadioGroup>)
          }
        </FormItem>

        <FormItem
          label="topic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="主题"
        >
          {
            getFieldDecorator('topic', {rules: [{ required: true}],initialValue:'cdc-record'})
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
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
