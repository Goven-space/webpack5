import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Checkbox,Radio,InputNumber} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import AppSelect from '../../core/components/AppSelect';
import EditJson from './PTS_TestParamsConfig';
import ReactJson from 'react-json-view';

//新增压力测试场景

const FormItem = Form.Item;
const Option = Select.Option;
const GetConfigUrl=URI.CORE_PTS_TESTCONFIG.details;
const SubmitUrl=URI.CORE_PTS_TESTCONFIG.save;
const ExecuteTestUrl=URI.CORE_PTS_TESTCONFIG.run;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id||'';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      mask:true,
      requestBodyDisplay:'none',
      jsonEditDisplay:'',
      formData:{},
      inParamsType:'1',
      paramsEditType:false,
    };
  }

  componentDidMount(){
      let id=this.id;
      if(this.id===''){
        let jsonObj=[{paramsId:"Content-Type",paramsValue:"application/json;charset=utf-8"}];
        console.log(jsonObj);
        this.refs.headerJson.loadParentData(jsonObj); //调用子组件的方法
        this.setState({mask:false});
        return;
      }
      let url=GetConfigUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showInfo(data.msg);
          }else{
            FormUtils.setFormFieldValues(this.props.form,data);
            this.setState({formData:data,mask:false});

            this.jsonLoad(data.inParams); //设置输入参数到子控件中去
            this.headerLoad(data.requestProperty); //设置输入参数到子控件中去

            //设置参数输入方式
            if(data.paramsEditType===undefined){
              if(data.inParamsType==='2'){
                this.state.formData.paramsEditType=true; //用来保存
                this.setState({paramsEditType:true});  //用来显示
              }else{
                this.state.formData.paramsEditType=false; //用来保存
                this.setState({paramsEditType:false});
              }
            }else{
              this.setState({paramsEditType:data.paramsEditType});
            }

            //设置编辑器显示和隐藏
            if(this.state.paramsEditType){
              this.setState({requestBodyDisplay:''});
              this.setState({jsonEditDisplay:'none'});
            }else{
              this.setState({requestBodyDisplay:'none'});
              this.setState({jsonEditDisplay:''});
            }

          }
      });
  }

  onSubmit = (action) => {
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
          postData.inParams=JSON.stringify(this.refs.editJson.getData()); //输入参数传入到后端
          postData.requestProperty=JSON.stringify(this.refs.headerJson.getData()); //输入参数传入到后端
          postData.appId=this.appId;
          postData.action=action;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功");
                if(action==='saveOnly'){
                  this.props.close();
                }
              }
          });
      }
    });
  }

  onParamsEditTypeSwitchChange=(checked)=>{
    if(checked){
      this.setState({requestBodyDisplay:''});
      this.setState({jsonEditDisplay:'none'});
    }else{
      this.setState({requestBodyDisplay:'none'});
      this.setState({jsonEditDisplay:''});
    }
    this.state.formData.paramsEditType=checked;
    this.state.paramsEditType=checked;
  }

  jsonLoad=(jsonStr)=>{
      if(jsonStr!==undefined && jsonStr!==''){
        let jsonObj=JSON.parse(jsonStr);
        jsonObj.forEach((item)=>{
          item.paramsValue=decodeURIComponent(item.paramsValue);
        });
        this.refs.editJson.loadParentData(jsonObj); //调用子组件的方法
        this.state.formData.inParams=JSON.stringify(jsonObj); //默认第一次要把paramsValue解码，不然直接进入测试时sampleValue是乱码
      }
  }

  headerLoad=(jsonStr)=>{
      if(jsonStr!==undefined && jsonStr!==''){
        let jsonObj=JSON.parse(jsonStr);
        jsonObj.forEach((item)=>{
          item.paramsValue=decodeURIComponent(item.paramsValue);
        });
        this.refs.headerJson.loadParentData(jsonObj); //调用子组件的方法
      }
  }


  formatRequestPropertyJsonStr=()=>{
    let value=this.props.form.getFieldValue("requestProperty");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"requestProperty":value.trim()});
  }

  formatRequestBodyJsonStr=()=>{
    let value=this.props.form.getFieldValue("requestBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"requestBody":value.trim()});
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
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="测试说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本次测试的名称"
        >
          {
            getFieldDecorator('title', {
              rules: [{ required: true, message: 'Please input the title!' }]
            })
            (<Input placeholder="测试名称" />)
          }
        </FormItem>
        <FormItem
          label="要测试的URL地址"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='要测试的服务URL地址'
        >
          {
            getFieldDecorator('url', {
              rules: [{ required: true}]
            ,initialValue:'http://'})
            (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="总测试请求数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='设定总计发出的HTTP请求数量'
        >{
          getFieldDecorator('maxRequestCount',{rules: [{ required: true}],initialValue:"100"})
          (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem
          label="并发线程数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='开启多少个并发线程进行请求发送(相当于并发用户数)'
        >{
          getFieldDecorator('maxThreadCount',{rules: [{ required: true}],initialValue:"100"})
          (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem
          label="超时时间"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='设定请求的超时时间(毫秒)'
        >{
          getFieldDecorator('conntionTimeOut',{rules: [{ required: true}],initialValue:"3000"})
          (<InputNumber min={0} />)
          }
        </FormItem>
        <FormItem
          label="调试"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='调试时请把线程数设为1可以更好的观察请求和响应数据,可以控制台日志查看调试结果'
        >
          {
            getFieldDecorator('debugTest', {
              rules: [{ required: false}],initialValue:false
            })
            (
              <RadioGroup>
                <Radio value={false}>否</Radio>
                <Radio value={true}>是</Radio>
              </RadioGroup>
            )
          }
        </FormItem>
        <FormItem
          label="自动追加认证头"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='调用API时自动追加本平台的token认证标识,其他系统发布的API请选择否'
        >
          {
            getFieldDecorator('addIdentitytoken', {
              rules: [{ required: false}],initialValue:'0'
            })
            (
              <RadioGroup>
                <Radio value='1'>是</Radio>
                <Radio value='0'>否</Radio>
              </RadioGroup>
            )
          }
        </FormItem>
        <FormItem
          label="Request Header"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="指定Header请求头的信息"
        >{
              <EditJson ref="headerJson"  />
          }
        </FormItem>
        <FormItem
          label="参数类型"
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
          label="输入参数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.props.form.getFieldValue('inParamsType')==='1'?'':'none'}}
        >{
          (<div>
            <EditJson ref="editJson"  />
           </div>
          )}
        </FormItem>
        <FormItem
          label="RequestBody"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue('inParamsType')==='2'?'':'none'}}
          help={<span>请求JSON数据</span>}
        >{
          getFieldDecorator('requestBody')
          (
            <Input.TextArea autosize style={{minHeight:'200px'}}   />
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,'saveOnly')}  >
            保存退出
          </Button>
          {' '}
          <Button type="ghost" onClick={this.onSubmit.bind(this,'saveAndRun')}  >
            保存并测试
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
