import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Radio,Upload,message} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import EditJson from './EditTestParamsJson';

const ExecuteTestUrl=URI.ESB.CORE_ESB_API.testRestfulAPI; //执行测试地址
const DefaultHostUrl=URI.ESB.CORE_ESB_API.defaultHostUrl; //获取 host

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.userId=AjaxUtils.getCookie("userId");
    this.parentForm=this.props.parentForm;
    this.requestBodyFlag=this.props.requestBodyFlag;
    this.getNodeInParamsConfig=this.props.getNodeInParamsConfig; //获得输入参数的方法
    this.getNodeHeaderParamsConfig=this.props.getNodeHeaderParamsConfig; //获得输入Header参数的方法
    this.getRequestBody=this.props.getRequestBody; //获取请求示例参数
    this.inParamsJsonObj=[];
    this.state={
      mask:true,
      jsonEditDisplay:'',
      formData:{},
      resultData:{body:'{}'},
      inParamsType:'1',
      paramsEditType:false,
    };
  }

  componentDidMount(){
    this.initFormData();
    this.getApiUrl();
  }

  initFormData=()=>{
    let data={};
    data.methodType=this.parentForm.getFieldValue("methodType");
    data.inParamsType=(this.requestBodyFlag==='true' || this.requestBodyFlag==='json')?'2':'1';
    if(this.requestBodyFlag==='true'){
        data.requestBody=this.getRequestBody(); //获取请求示例
    }else if(this.requestBodyFlag==='json'){
        let bodyData={};
        let paramsConfig=this.getNodeInParamsConfig();
        for(let i=0;i<paramsConfig.length;i++){
          let tmpitem=paramsConfig[i];
          bodyData[tmpitem.paramsId]=tmpitem.paramsValue;
        }
        data.requestBody=JSON.stringify(bodyData);
    }
    this.setState({formData:data,mask:false});
    FormUtils.setFormFieldValues(this.props.form,data);
    this.refs.paramsJson.loadParentData(this.getNodeInParamsConfig()); //设置请求参数
    let headerData=this.getNodeHeaderParamsConfig().slice();
    headerData.forEach((item, index, arr)=>{
      item.paramsId=item.headerId;
      item.paramsValue=item.headerValue;
    });
    let addIdentitytoken=this.parentForm.getFieldValue("addIdentitytoken");//追加认证头
    if(addIdentitytoken==="1"){
      let tokenItem={id:headerData.length+1,paramsId:"identitytoken",paramsValue:"自动生成"};
      headerData.push(tokenItem);
    }
    this.refs.headerJson.loadParentData(headerData); //设置请求Header参数
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.parentForm!==nextProps.parentForm || this.requestBodyFlag!==nextProps.requestBodyFlag){
      this.parentForm=nextProps.parentForm;
      this.requestBodyFlag=nextProps.requestBodyFlag;
      this.initFormData();
      this.getApiUrl();
    }
  }

  getApiUrl=()=>{
    let url=this.parentForm.getFieldValue("apiUrl");
    let apiId=this.parentForm.getFieldValue("apiId");
    if(url!==undefined && url.startsWith("http")){
      this.props.form.setFieldsValue({url:url});
      return;
    }
    let hostUrl=DefaultHostUrl+"?id="+apiId;
    AjaxUtils.get(hostUrl,(data)=>{
      if(data.state==false){
        AjaxUtils.showError("获取缺省Host地址时发生错误!");
      }else{
        url=data.url+url;
      }
      this.props.form.setFieldsValue({url:url});
    });
  }

  executeTest=()=>{
      this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let value=values[key];
              if(value!==undefined){
                postData[key]=value;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.inParams=JSON.stringify(this.refs.paramsJson.getData()); //输入参数传入到后端
          postData.headerParams=JSON.stringify(this.refs.headerJson.getData()); //输入Headwer参数传入到后端
          this.props.form.setFieldsValue({"body":''}); //先清空已有结果
          this.props.form.setFieldsValue({"header":''}); //先清空已有结果
          this.setState({mask:true});
          AjaxUtils.post(ExecuteTestUrl,postData,(data)=>{
            this.setState({mask:false,resultData:data});
            this.props.form.setFieldsValue({"header":data.header});
            this.props.form.setFieldsValue({"body":AjaxUtils.formatJson(data.body,'',true)});
            this.props.form.setFieldsValue({"currentUrl":data.requestUrl});
            this.props.form.setFieldsValue({"requestHeader":data.requestHeader});
          });
      }
    });
  }

  getTestResult=()=>{
    //获取测试结果
    return this.props.form.getFieldValue("body");
  }

  formatRequestBodyJsonStr=()=>{
    let value=this.props.form.getFieldValue("requestBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"requestBody":value.trim()});
  }

  loadFromJson=()=>{
    let value = this.props.form.getFieldValue("body")
    this.props.loadFromJson(value)/* 这个函数从父级取也是为了能够去更行输出的table表 */
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
      );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form >
        <FormItem
          label="要测试的API地址"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='要测试的服务地址URL'
        >
          {
            getFieldDecorator('url', {
              rules: [{ required: true}]
            })
            (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="调试"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >{
          getFieldDecorator('testDebugService',{initialValue:true})
          (<Checkbox checked={this.state.formData.testDebugService} onClick={(e)=>{this.state.formData.testDebugService=e.target.checked}} >调试(只对本系统的服务有效)</Checkbox>)
        }
        </FormItem>
        <FormItem
          label="Header参数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          (<div>
            <EditJson ref="headerJson"  />
           </div>
          )}
        </FormItem>
        <FormItem
          label="请求参数类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('inParamsType',{initialValue:'1'})
            (<RadioGroup >
              <Radio value='1'>键值对(Form Query)</Radio>
              <Radio value='2'>RequestBody请求</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="请求参数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.props.form.getFieldValue("inParamsType")==='1'?'':'none'}}
        >{
          (<div>
            <EditJson ref="paramsJson"  />
           </div>
          )}
        </FormItem>
        <FormItem
          label="RequestBody"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("inParamsType")==='2'?'':'none'}}
          help={<span>请求JSON数据:<a onClick={this.formatRequestBodyJsonStr} >格式化JSON</a></span>}
        >{
          getFieldDecorator('requestBody')
          (
            <Input.TextArea autosize style={{minHeight:'160px'}}   />
          )}
        </FormItem>
         <FormItem
          label="Request Url"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='测试结果(请求Url)'
        >{
          getFieldDecorator('currentUrl')
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="Request Headers"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='测试结果(请求头)'
        >{
          getFieldDecorator('requestHeader')
          (<Input.TextArea autosize={{ minRows: 2, maxRows: 12 }} />)
          }
        </FormItem>
        <FormItem
          label="ResponseHeaders"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='测试结果(响应头)'
        >{
          getFieldDecorator('header')
          (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
          }
        </FormItem>
        <FormItem
          label="ResponseBody"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help={<span>测试返回结果{' '}<a onClick={this.loadFromJson} style={{marginLeft:20}}>设置为API节点的输出参数</a></span>}
        >{
          getFieldDecorator('body')
          (
            <Input.TextArea  autosize={{ minRows: 2, maxRows: 16 }} />
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.executeTest}  >
            开始测试
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
