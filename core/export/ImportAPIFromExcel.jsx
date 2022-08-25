import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message,Radio } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import AppSelect from '../components/AppSelect';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

const saveDataUrl=URI.CORE_OPENAPI_EXCELANDWORD.importExcelSave;
const uploadUrl=URI.CORE_OPENAPI_EXCELANDWORD.importExcelUpload;
const deleteUrl=URI.CORE_OPENAPI_EXCELANDWORD.importExcelDelete;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId,
    this.fileUploadUrl=uploadUrl+"?appId=gateway";
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
      AjaxUtils.showError("请选择一个*.xls的文件再提交!");
      return;
    }
    if(this.state.fileList.length>1){
      AjaxUtils.showError("一次只能上传一个数据包文件!");
      return;
    }
    let fileName=this.state.fileList[0].name;
    if(fileName.indexOf(".xls")===-1&&fileName.indexOf(".xlsx")===-1){
      AjaxUtils.showError("只能上传*.xls/.xlsx格式的应用文件!");
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
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                this.props.closeModal();
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
              file.url = URI.baseResRootUrl+"/attachments/"+file.response[0].filePath;
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
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId)},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
	     <FormItem  label="数据包"  {...formItemLayout4_16} help='可以先导出API到Excel获得一个Excel填写的模板'>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传API设计打包文件(*.xls或*.xlsx格式)
            </Button>
          </Upload>
        </FormItem>

        <FormItem wrapperCol={{ span: 10, offset: 4 }} key="appId">
          <Button type="primary" onClick={this.onSubmit}  >
            开始导入
          </Button>
          {' '}
          <Button onClick={this.props.closeModal}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
