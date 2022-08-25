import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//rfc配置直接生成服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CONNECT.SAPRFC.createApi; //生成restful api
const SubmitUrlForWebService=URI.CONNECT.SAPRFC.createWebService; //生成webservice

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.connecterId=this.props.record.id; //配置的id
    this.configName=this.props.record.functionName;
    this.functionId=this.props.record.functionId;
    this.state={
      mask:false,
      formData:[],
    };
  }

  onSubmit = (closeFlag=true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          let url=postData.apiType=='restful'?SubmitUrl:SubmitUrlForWebService;
          AjaxUtils.post(url,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: '服务生成失败',content:data.msg,width:600});
              }else{
                if(data.msg.indexOf('(0)')!==-1){
                  Modal.error({title: '服务生成失败',content:data.msg+",URI重复或者其他原因!",width:600});
                }else{
                  Modal.info({title: '服务生成结果',content:data.msg+",如果API没有列出请点击刷新按扭!",width:600});
                }
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const QueryMethodType = (
        getFieldDecorator('methodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const url="/sap/"+this.functionId;

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="函数Id"
          help='无需修改'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('connecterId',{initialValue:this.connecterId})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('serviceName',{rules: [{ required: true}],initialValue:this.configName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="服务类型"
          help='可以同时发布多个为Restful API或者WebService API的服务,可应对不同的消费端类型'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('apiType',{initialValue:'restful'})
            ( <RadioGroup>
              <Radio value='restful'>Restful API</Radio>
              <Radio value='webservice'>WebService SOAP</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="注意:如果URI路径已经存在，系统不会重复发布相同URI的API"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('serviceUrl',{rules: [{required: true}],initialValue:url})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="参数类型"
          help='给RFC提交数据时请选择Body请求,查询数据可选择Form Query'
          style={{display:this.props.form.getFieldValue("apiType")=='restful'?"":"none"}}
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('requestBodyFlag',{initialValue:'true'})
            ( <RadioGroup>
              <Radio value='true'>RequestBody Json字符串</Radio>
              <Radio value='false'>Form Query键值对</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
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
