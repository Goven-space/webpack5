import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AppSelect from '../../../core/components/AppSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_APPVERSIONS.getById;
const saveDataUrl=URI.CORE_APPVERSIONS.save;
const uploadUrl=URI.CORE_FILE.uploadFile;
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.fileUploadUrl=uploadUrl+"?appId="+this.appId;
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  componentDidMount(){
  }

  onSubmit = () => {
    if(this.state.fileList.length<1){
      AjaxUtils.showError("请选择一个*.zip的版本文件再提交!");
      return;
    }
    if(this.state.fileList.length>1){
      AjaxUtils.showError("一次只能上传一个版本文件!");
      return;
    }
    let fileName=this.state.fileList[0].name;
    let appId=this.props.form.getFieldValue("appId");
    if(fileName.indexOf(".zip")===-1){
      AjaxUtils.showError("只能上传*.zip格式的版本文件!");
      return;
    }
    if(fileName.indexOf(appId)===-1){
      AjaxUtils.showError("应用id与版本文件中的应用id不一致,版本文件中必须要包含应用id!");
      return;
    }

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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.close(true);
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
              file.url = URI.baseResUrl+file.response[0].filePath;
              file.parentDocId='0';
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
      <Form style={{marginRight:'20px'}}>
        <FormItem  label="应用Id"   {...formItemLayout4_16}  hasFeedback help="必须与打包的版本文件的应用id一至否则将会出错" >
          {
            getFieldDecorator('appId',{
              rules: [{required: true}]
            })
            (<Input placeholder="应用唯一id"  />)
          }
        </FormItem>
        <FormItem  label="应用名称"   {...formItemLayout4_16} help="应用名称" >
          {
            getFieldDecorator('appName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
	     <FormItem  label="版本文件"  {...formItemLayout4_16}>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传版本文件(zip格式)
            </Button>
          </Upload>
        </FormItem>
        <FormItem wrapperCol={{ span: 6, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const ImportAppVersion = Form.create()(form);

export default ImportAppVersion;
