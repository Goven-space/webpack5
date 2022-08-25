import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Radio,Upload,message,Drawer} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AceEditor from '../../core/components/AceEditor';
import AjaxSelect from '../../core/components/AjaxSelect';
import AppSelect from '../../core/components/AppSelect';
import EditJson from './NewTestInParamsJson';
import ReactJson from 'react-json-view';
import ToDayLog from '../../monitor/apimonitor/form/ToDayLog'; //查看控制台日志

const FormItem = Form.Item;
const Option = Select.Option;
const GetConfigUrl=URI.CORE_TESTSERVICES.GetConfigById; //获取测试服务配置信息的url地址
const GetTestLogUrl=URI.CORE_TEST_LOG.details; //获取测试log
const SubmitUrl=URI.CORE_TESTSERVICES.SubmitUrl; //存盘地址
const ExecuteTestUrl=URI.CORE_TESTSERVICES.ExecuteTestUrl; //执行测试地址
const RadioGroup = Radio.Group;
const deleteUrl=URI.CORE_FILE.deleteFile;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=tester";
const updateResponseUrl=URI.NEW_SERVICE.updateResponse; //测试结果更新到服务的输出和输入参数中
const ListTestCase=URI.CORE_TESTSERVICES.ListTestCase; //载入已有测试用例
const GetTestCaseById=URI.CORE_TESTSERVICES.GetTestCaseById; //根据选择的测试用例导入输入参数

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.serviceId=this.props.serviceId;
    this.userId=AjaxUtils.getCookie("userId");
    this.hiddenCloseButton=this.props.hiddenCloseButton||false;
    this.ListTestCaseUrl="";
    this.inParamsJsonObj=[];
    this.testType=this.props.testType||'CASE'; //case表示测试用例,log表示日记
    this.dataType='json';
    this.configType=this.props.configType; //api类型
    if(this.configType=='WEBSERVICE' || this.configType=='RestToWebService'){
      this.dataType='xml';
    }
    if(this.serviceId!=='' && this.serviceId!==undefined && this.serviceId!==null){
        this.ListTestCaseUrl=ListTestCase+"?serviceId="+this.serviceId+"&id="+this.id;
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
      visible:false,
    };
  }

  componentDidMount(){
      let id=this.id;
      let url=GetConfigUrl.replace("{serviceId}",this.serviceId).replace("{id}",id);
      if(this.testType==='LOG'){
        url=GetTestLogUrl+"?id="+id;
      }
      if(this.id==='' && this.serviceId===''){this.setState({mask:false});return;}
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.showInfo(data.msg);
          }else{
            //获得服务配置的id
            if(data.serviceId!=="" && data.serviceId!==undefined){this.serviceId=data.serviceId;}

            //载入附件数据,只有这两种类型才会出现附件上传框
            if(data.requestProperty!==undefined && (data.requestProperty.indexOf('multipart')!==-1 || data.requestProperty.indexOf('image/')!==-1 || data.requestProperty.indexOf('octet-stream')!==-1)){
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
            if(data.methodType==='*'){data.methodType='GET';}
            if(this.dataType==='xml'){data.methodType='POST';}
            data.binaryUpload='0';
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
          postData.inParams=JSON.stringify(this.refs.editJson.getData()); //输入参数传入到后端
          if(postData.mapUrl!==undefined){
            postData.url=postData.mapUrl; //保存时要用相对地址
          }
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state==='false'){
                this.showInfo("服务请求失败,请检查服务接口处于可用状态!");
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
            let body=data.body;
            if(body.startsWith("<") && body.endsWith(">")){
              body=AjaxUtils.formatXml(body);
            }else{
              body=AjaxUtils.formatJson(data.body,'',true);
            }
            this.props.form.setFieldsValue({"body":body});
            this.props.form.setFieldsValue({"currentUrl":data.requestUrl});
            this.props.form.setFieldsValue({"requestHeader":data.requestHeader});
          });
      }
    });
  }

  onSwitchChange=(checked)=>{
    if(checked){
      this.state.authDisplay='';
    }else{
      this.state.authDisplay='none';
    }
    this.state.formData.authFlag=checked;
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


  paramsTypeChange=(e)=>{

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

  updateResponse=(action)=>{
    let responseSample="";
    let failResponseSample="";
    let requestBodySampleStr="";
    if(action===1){
      responseSample=this.props.form.getFieldValue("body");
    }else if(action===2){
      failResponseSample=this.props.form.getFieldValue("body");
    }else if(action===3){
      requestBodySampleStr=this.props.form.getFieldValue("requestBody");
    }
    this.setState({mask:true});
    AjaxUtils.post(updateResponseUrl,{id:this.serviceId,responseSample:responseSample,failResponseSample:failResponseSample,requestBodySampleStr:requestBodySampleStr},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("设置成功!");
        }
    });
  }

  //选择已有测试用例导入相关参数
  testCaseSelectChange=(id)=>{
    let url=GetTestCaseById.replace("{id}",id);
    AjaxUtils.get(url,(data)=>{
      // console.log(data);

      //载入并格式化requestBody
      if(data.requestBody!=='' && data.requestBody!==undefined){
        let requestBody=AjaxUtils.formatJson(data.requestBody);
        this.props.form.setFieldsValue({requestBody:requestBody});
      }

      //设置请求头
      this.props.form.setFieldsValue({requestProperty:data.requestProperty});

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

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  showToDayLog=()=>{
      this.setState({visible: true});
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
        getFieldDecorator('methodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="PATCH">PATCH</Option>
      </Select>)
      );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Drawer   key={Math.random()}
                title=""
                placement="right"
                width='1100px'
                closable={false}
                onClose={this.handleCancel}
                visible={this.state.visible}
              >
              <ToDayLog />
      </Drawer>
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
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
          label="要测试的服务地址"
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
          label="测试用户或token"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定登录的用户id来测试服务,也可以直接填写token字符串'
        >
          {
            getFieldDecorator('testerId', {rules: [{ required: true}],initialValue:this.userId})
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
          label="接口需要认证"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >{
          getFieldDecorator('authFlag',{initialValue:this.state.formData.authFlag})
          (<Switch checked={this.state.formData.authFlag} onChange={this.onSwitchChange} />)
        }
        </FormItem>
        <FormItem
          label="认证用户id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          style={{display:this.state.authDisplay}}
          help="如果接口需要认证则输入"
        >{
          getFieldDecorator('userId')
          (<Input addonBefore={<Icon type="user" />} />
          )}
        </FormItem>
        <FormItem
          label="用户密码"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          style={{display:this.state.authDisplay}}
          help="如果接口需要认证则输入"
        >{
          getFieldDecorator('password')
          (<Input addonBefore={<Icon type="lock" />} type="password" />
          )}
        </FormItem>
        <FormItem
          label="Request Header"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定请求头的信息JSON格式:{'Content-Type':'application/json; charset=utf-8',version:'1.0'}传入version表示调用指定版本的API"
        >{
          getFieldDecorator('requestProperty',{initialValue:'{"Content-Type":"application/json; charset=utf-8"}'})
          (<Input.TextArea autosize onClick={this.formatRequestPropertyJsonStr} />
          )}
        </FormItem>
        <FormItem
          label="参数类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          	getFieldDecorator('inParamsType',{initialValue:'1'})
            (<RadioGroup onChange={this.paramsTypeChange}>
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
            getFieldDecorator('listTestCases',{initialValue:''})
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
          style={{display:this.state.requestBodyDisplay}}
          help={<span>请求JSON数据:<a onClick={this.formatRequestBodyJsonStr} >格式化JSON</a>{' '}<a onClick={this.updateResponse.bind(this,3)} >设为请求示例</a></span>}
        >
          {getFieldDecorator('requestBody', {rules: [{ required: false, message: '' }]})
            (<AceEditor mode={this.dataType} width='100%' height='300px'/>)
          }
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
        <FormItem
          label="附件发送方式"
          {...formItemLayout4_16}
          style={{display:this.state.fileDisplay}}
        >{
            getFieldDecorator('binaryUpload',{initialValue:'0'})
            (<RadioGroup onChange={this.paramsTypeChange}>
              <Radio value='0'>附件作为表单的多文件上传发送</Radio>
              <Radio value='1'>附件作为binary数据发送</Radio>
            </RadioGroup>)
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
          (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
          }
        </FormItem>
        <FormItem
          label="ResponseBody"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help={<span>测试结果:<a onClick={this.updateResponse.bind(this,1)} style={{display:this.hiddenCloseButton===false?"":"none"}} >设为成功示例</a>{' '}<a onClick={this.updateResponse.bind(this,2)} style={{display:this.hiddenCloseButton===false?"":"none"}} >设为失败示例</a></span>}
        >
          {getFieldDecorator('body', {rules: [{ required: false, message: '' }]})
            (<AceEditor mode={this.dataType} width='100%' height='300px'/>)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.executeTest}  >
            开始测试
          </Button>
          {' '}
          <Button onClick={this.onSubmit.bind(this,false)}  >
            保存测试用例
          </Button>
          {' '}
          <Button onClick={this.showToDayLog}  >
            查看控制台日志
          </Button>
          {' '}
          <span style={{display:this.hiddenCloseButton===false?"":"none"}}>
          <Button onClick={this.props.close.bind(this,false)} style={{display:this.id===''?"":"none"}} >
            关闭
          </Button>
        </span>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
