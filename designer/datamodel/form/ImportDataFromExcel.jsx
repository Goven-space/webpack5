import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_DATAMODELS.ImportModelDataFromExcel;
const uploadUrl=URI.CORE_FILE.uploadResource;;
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  onSubmit = () => {
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
          postData.modelId=this.modelId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
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
    const formItemLayout4_16 = {labelCol: { span: 6 },wrapperCol: { span:12 },};
    const uploadProps={
        name: 'file',
        action: uploadUrl+"?appId="+this.appId,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
	     <FormItem  label="选择要导入的Excel文件"  {...formItemLayout4_16}  help='Excel文件的第一行必须为字段的Id'>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传Excel文件
            </Button>
          </Upload>
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 6 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            开始导入
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
