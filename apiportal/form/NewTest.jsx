import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Radio,Upload,message} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import AppSelect from '../../core/components/AppSelect';
import EditJson from './NewTestInParamsJson';
import ReactJson from 'react-json-view';

const FormItem = Form.Item;
const Option = Select.Option;
const GetConfigUrl=URI.CORE_APIPORTAL_TEST.getApiTestConfig; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_TESTSERVICES.SubmitUrl; //存盘地址
const ExecuteTestUrl=URI.CORE_TESTSERVICES.ExecuteTestUrl; //执行测试地址
const RadioGroup = Radio.Group;
const deleteUrl=URI.CORE_FILE.deleteFile;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=tester";
const ListTestCase=URI.CORE_TESTSERVICES.ListTestCase; //载入已有测试用例
const GetTestCaseById=URI.CORE_TESTSERVICES.GetTestCaseById; //根据选择的测试用例导入输入参数

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.logId=this.props.id; //测试记录的id
    this.serviceId=this.props.serviceId; //被测试api的id
    this.userId=AjaxUtils.getCookie("userId");
    this.ListTestCaseUrl="";
    this.inParamsJsonObj=[];
    if(this.serviceId!=='' && this.serviceId!==undefined && this.serviceId!==null){
        this.ListTestCaseUrl=ListTestCase+"?serviceId="+this.serviceId;
    }
    this.state={
      mask:true,
      authDisplay:'none',
      requestBodyDisplay:'none',
      jsonEditDisplay:'',
      formData:{},
      resultData:{body:'{}'},
      inParamsType:'1',
      paramsEditType:false,
      fileList:[],
      fileDisplay:'none',
    };
  }

  componentDidMount(){
      let id=this.id;
      let url=GetConfigUrl+"?apiId="+this.serviceId+"&logId="+this.logId;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.showInfo(data.msg);
          }else{
            //获得服务配置的id
            if(data.serviceId!=="" && data.serviceId!==undefined){this.serviceId=data.serviceId;}
            //载入附件数据,只有这两种类型才会出现附件上传框
            if(data.requestProperty!==undefined && (data.requestProperty.indexOf('multipart')!==-1 || data.requestProperty.indexOf('octet-stream')!==-1)){
              this.setState({fileDisplay:''});
            }
            if(id!==undefined && id!==''){
              FormUtils.getFiles(id,(fileList)=>{
                if(fileList.length>0){
                  this.setState({ fileList:fileList });
                }
              });
            }

            //格式化requestBody
            if(data.testDebugService===undefined){data.testDebugService=false;}
            if(data.requestBody!=='' && data.requestBody!==undefined){
            	data.requestBody=AjaxUtils.formatJson(data.requestBody);
            }

            //设置接口地址
            if(data.url!==undefined && data.url.indexOf("http://")===-1 && data.url.indexOf("https://")===-1){
              if(host.substring(0,4)==='http'){
                data.url=host+data.url;
              }else{
                let port=window.location.port;
                let thost=window.location.protocol+"//"+window.location.host+appPath;
                data.url=thost+data.url;
              }
            }

            //去除数据中不存在的表单控件中的数据
            let allFormFieldsValue=this.props.form.getFieldsValue();
            for(var itemName in allFormFieldsValue){
              allFormFieldsValue[itemName]=data[itemName];
            }
            if(allFormFieldsValue.appId===undefined || allFormFieldsValue.appId===''){allFormFieldsValue.appId=this.appId;}

            this.props.form.setFieldsValue(allFormFieldsValue);
            this.setState({formData:data,mask:false});
            this.jsonLoad(data.inParams); //设置输入参数到子控件中去
            if(data.inParams===undefined){
              this.inParamsJsonObj={};
            }else{
              this.inParamsJsonObj=JSON.parse(data.inParams); //设置输入参数到子控件中去
            }

            //设置接口认证方式
            if(data.authFlag===true){
              this.setState({authDisplay:''});
            }

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

  showInfo=(msg)=>{
        notification.info({
            message: '操作提示',
            duration: 3,
            description: msg
        });
  }

  onSubmit = (closeFlag) => {
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
          postData.fileList=this.state.fileList.map((file) => {if(file.parentDocId==='0'){return file.uid;}}).join(",");//附件id要上传
          postData=Object.assign({},this.state.formData,postData);
          postData.serviceId=this.serviceId; //服务的唯一id
          postData.appId=this.appId;
          postData.inParams=JSON.stringify(this.refs.editJson.getData()); //输入参数传入到后端
          if(postData.mapUrl!==undefined){
            postData.url=postData.mapUrl; //保存时要用相对地址
          }
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                this.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.close();
                }
              }
          });
      }
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
          postData.fileList=this.state.fileList.map((file) => {return file.uid}).join(",");//所有上传的附件id
          postData=Object.assign({},this.state.formData,postData);
          postData.serviceId=this.serviceId;
          postData.inParams=JSON.stringify(this.refs.editJson.getData()); //输入参数传入到后端
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

  //上传一个附件
  onFileChange=(info)=>{
          let fileList = info.fileList;
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            return;
          }
          fileList = fileList.map((file) => {
            if (file.response) {
              file.uid=file.response[0].id;
              file.url = URI.baseResUrl+file.response[0].filePath;
              file.parentDocId='0';
            }
            return file;
          });
          this.setState({ fileList });
  }

  //删除附件
  onFileRemove=(file)=>{
    let fileId=file.uid;
    let postData={ids:fileId};
    if(!window.confirm("删除附件?")){
      return false;
    }else{
      AjaxUtils.post(deleteUrl,postData,(data)=>{
        message.success(`${file.name} deleted successfully`);
      });
    }
  };

  //选择已有测试用例导入相关参数
  testCaseSelectChange=(id)=>{
    let url=GetTestCaseById.replace("{id}",id);
    AjaxUtils.get(url,(data)=>{
      // console.log(data);

      //设置请求头
      this.props.form.setFieldsValue({requestProperty:data.requestProperty});

      //载入并格式化requestBody
      if(data.requestBody!=='' && data.requestBody!==undefined){
        let requestBody=AjaxUtils.formatJson(data.requestBody);
        this.props.form.setFieldsValue({requestBody:requestBody});
      }

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

      //输入输入参数
      this.jsonLoad(data.inParams);
    });
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
    const uploadProps={
        name: 'file',
        action: uploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };
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
          label="要测试的API地址"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='要测试的API地址'
        >
          {
            getFieldDecorator('url', {
              rules: [{ required: true}]
            })
            (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="测试用户或token"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定登录的用户id来测试服务,也可以直接填写token字符串'
        >
          {
            getFieldDecorator('testerId', {rules: [{ required: true}]})
            (<Input  />)
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
          label="Request Header"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定请求头的信息JSON格式:{'Content-Type':'application/json; charset=utf-8',version:'1.0'}"
        >{
          getFieldDecorator('requestProperty',{initialValue:"{'Content-Type':'application/json; charset=utf-8'}"})
          (<Input.TextArea autosize  onClick={this.formatRequestPropertyJsonStr} />
          )}
        </FormItem>
        <FormItem
          label="参数类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          	getFieldDecorator('inParamsType',{initialValue:'1'})
            (<RadioGroup>
              <Radio value='1'>键值对(Form Query)</Radio>
              <Radio value='2'>RequestBody请求</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="已有测试用例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择已有测试用例可以直接导入测试用例的输入参数'
        >{
            getFieldDecorator('listTestCases',{initialValue:'1'})
            (<AjaxSelect url={this.ListTestCaseUrl} style={{ width: '30%' }} onChange={this.testCaseSelectChange}  />)
          }
        </FormItem>
        <FormItem
          label="输入参数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.jsonEditDisplay}}
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
          help='请根据RequestHeader类型输入请求参数,一般为JSON格式数据'
          style={{display:this.state.requestBodyDisplay}}
        >{
          getFieldDecorator('requestBody')
          (
            <Input.TextArea autosize style={{minHeight:'200px'}}  onClick={this.formatRequestBodyJsonStr}   />
          )}
        </FormItem>
        <FormItem
          label="参数编辑模式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >{
          getFieldDecorator('paramsEditType',{initialValue:this.state.paramsEditType})
          (<Switch checked={this.state.paramsEditType} onChange={this.onParamsEditTypeSwitchChange}  checkedChildren="文本模式" unCheckedChildren="可视模式"  />)
        }
        </FormItem>
        <FormItem  label="附件测试" style={{display:this.state.fileDisplay}}  {...formItemLayout4_16}>
          <Upload {...uploadProps}  >
            <Button>
              <Icon type="upload" /> 点击上传附件
            </Button>
          </Upload>
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
          (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }}    />)
          }
        </FormItem>
        <FormItem
          label="ResponseBody"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='测试结果'
        >{
          getFieldDecorator('body')
          (
            <Input.TextArea  autosize={{ minRows: 2, maxRows: 16 }}  />
            //<ReactJson style={{marginTop:'13px',lineHeight:'15px'}} name={null} collapsed={1} displayDataTypes={false}  displayObjectSize={false} src={JSON.parse(this.state.resultData.body)} />
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.executeTest}  >
            开始测试
          </Button>
          {' '}
          <Button onClick={this.onSubmit.bind(this,false)}  >
            保存为测试用例
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewTest = Form.create()(form);

export default NewTest;
