import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber,AutoComplete,Upload,Icon,message} from 'antd';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import * as FormActions from '../../../../core/utils/FormUtils';
import AceEditor from '../../../../core/components/AceEditor';
import UserAsynTreeSelect from '../../../../core/components/UserAsynTreeSelect';
import Editor from '../../../../core/components/Editor';

const FormItem = Form.Item;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.loadResponseSample;
const uploadUrl=URI.CORE_FILE.uploadResource_mgdb;
const downloadUrl=URI.CORE_FILE.download_mgdb;
const deleteUrl=URI.CORE_FILE.deleteFile;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.fileUploadUrl=uploadUrl+"?appId=apidoc&parentDocId="+this.id;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    if(this.id===undefined || this.id===''){
        this.setState({mask:false});
    }else{

      //载入附件列表
      let url=URI.CORE_FILE.listFiles.replace("{id}",this.id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            let fileList = data.map((file) => {
              file.uid=file.id;
              // file.url = URI.baseResUrl+file.filePath;
              file.url=downloadUrl.replace("{id}",file.uid);
              file.name=file.fileName;
              return file;
            });
          this.setState({ fileList:fileList });
          }
      });

      //加载表单数据
      url=loadDataUrl.replace('{id}',this.id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.responseSample!==undefined && data.responseSample!==null){
              data.responseSample=AjaxUtils.formatJson(data.responseSample);
              data.failResponseSample=AjaxUtils.formatJson(data.failResponseSample);
            }
            if(data.requestBodyDataType==='' || data.requestBodyDataType===undefined){
              data.requestBodyDataType="JSON";
            }
            if(data.visibleUserIds!==undefined && data.visibleUserIds!==null){
              data.visibleUserIds=data.visibleUserIds.split(",");
            }
            if(data.describeBody==undefined || data.describeBody==''){data.describeBody="<p></p>";}
            this.refs.editor.setText(data.describeBody);
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }


  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          // postData=Object.assign({},this.state.formData,postData); 这里不能合并
          postData.id=this.id; //API的唯一id
          postData.describeBody=this.state.formData.describeBody;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
              }
          });
      }
    });
  }

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
              //file.url = URI.baseResUrl+file.response[0].filePath;
              file.url=downloadUrl.replace("{id}",file.uid);
              file.parentDocId=this.id;
            }
            return file;
          });
          this.setState({ fileList });
  }

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

  editorChange=(content)=>{
    this.state.formData.describeBody=content;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const uploadProps={
        name: 'file',
        action: this.fileUploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="Produces ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="指定服务返回的数据类型"
        >{
          getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
          (<AutoComplete  >
              <Option value="*">透传注册服务的ContentType</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
              <Option value="application/x-msdownload;charset=utf-8">application/octet-stream;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem
          label="RequestBody参数类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.formData.requestBodyFlag?'':'none'}}
          help='指定RequestBody请求时的数据类型,默认为单个JSON对象'
        >{
          getFieldDecorator('requestBodyDataType',{initialValue:'JSON'})
          (<Select >
              <Option value="JSON">单个JSON对象</Option>
              <Option value="ARRAY">JSON数组</Option>
              <Option value="STRING">任意字符串</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="热门API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='是否设置并显示到热门API列表中'
        >{
            getFieldDecorator('hotFlag',{initialValue:0})
            (<RadioGroup>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="推荐API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='是否设置并显示到推荐API列表中'
        >{
            getFieldDecorator('recommendFlag',{initialValue:0})
            (<RadioGroup>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="API显示图标"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:'none'}}
          help='是否设置并显示到推荐API列表中,空表示使用缺省图标如:/res/images/api.png'
        >{
            getFieldDecorator('iconUrl',{initialValue:''})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="API价格(积分)"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          help='是否设置每次API调用的价格,方便计费时使用,0表示免费'
        >{
            getFieldDecorator('price',{initialValue:'0'})
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="API可见范围"
          help="选择能在API门户中查看本API文档的用户,空表示所有用户"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('visibleUserIds')
            (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
          }
        </FormItem>
        <FormItem
          label="RequestBody请求示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.formData.requestBodyFlag?'':'none'}}
          help='指定RequestBody请求时的示例JSON或字符串,在API文档中查看或测试时提供参考'
        >
          {getFieldDecorator('requestBodySampleStr', {rules: [{ required: false, message: '' }]})
            (<AceEditor mode='json' width='100%' height='300px'/>)
          }
        </FormItem>
        <FormItem
          label="调用成功返回示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='在API文档可查看本输出示例'
        >
          {getFieldDecorator('responseSample', {rules: [{ required: false, message: '' }]})
            (<AceEditor mode='json' width='100%' height='300px'/>)
          }
        </FormItem>
        <FormItem
          label="调用失败返回示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >
          {getFieldDecorator('failResponseSample', {rules: [{ required: false, message: '' }]})
            (<AceEditor mode='json' width='100%' height='200px'/>)
          }
        </FormItem>
        <FormItem  label="补充说明"  {...formItemLayout4_16}>
           <Editor ref="editor" options={{style:{height:'300px',marginBottom:'50px'}}} onChange={this.editorChange} />
        </FormItem>
        <FormItem  label="附件"  {...formItemLayout4_16}>
           <Upload {...uploadProps}>
             <Button>
               <Icon type="upload" /> 点击上传附件
             </Button>
           </Upload>
         </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button onClick={this.onSubmit} type="primary"  >
            保存
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}
export default Form.create()(form);
