import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message,Radio } from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.ETL.DBF_READ_NODE.getDBFFileHead;
const uploadUrl=URI.CORE_FILE.uploadResource;
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId="etl";
    this.sheetName=this.props.sheetName;
    this.fileUploadUrl=uploadUrl+"?appId=etl";
    this.loadTableColumns=this.props.loadTableColumns;
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
      AjaxUtils.showError("请选择一个文件再提交!");
      return;
    }
    if(this.state.fileList.length>1){
      AjaxUtils.showError("一次只能上传一个文件!");
      return;
    }
    let fileName=this.state.fileList[0].name;
    let appId=this.appId;

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
          postData.sheetName=this.sheetName;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.loadTableColumns(data);
                AjaxUtils.showInfo("导入成功!");
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
	     <FormItem  label="DBF文件"  {...formItemLayout4_16}>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传DBF文件
            </Button>
          </Upload>
        </FormItem>
        <FormItem wrapperCol={{ span: 10, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            开始获取字段
          </Button>
        </FormItem>
          <FormItem wrapperCol={{ span: 10, offset: 4 }}>
          上传一个DBF文件并从中分析head获取读取字段
        </FormItem>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
