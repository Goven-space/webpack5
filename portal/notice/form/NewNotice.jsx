import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormActions from '../../../core/utils/FormUtils';
import Editor from '../../../core/components/Editor';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_NOTICE.getById;
const saveDataUrl=URI.CORE_NOTICE.save;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=notice";
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      this.setState({mask:true});
      //载入附件数据
      FormActions.getFiles(id,(fileList)=>{
        if(fileList.length>0){
          this.setState({ fileList:fileList });
        }
      });
      //载入表单数据
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormActions.setFormFieldValues(this.props.form,data);
	          this.refs.editor.setText(data.body);
          }
      });
    }
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
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
              if(file.response.state==false){
                AjaxUtils.showError("文件上传失败或禁止上传此类文件!");
              }else{
                file.uid=file.response[0].id;
                file.url = URI.baseResUrl+file.response[0].filePath;
                file.parentDocId='0';
              }
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
    this.state.formData.body=content;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 2 },wrapperCol: { span: 22 },};
    const uploadProps={
        name: 'file',
        action: uploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };
    const noticeType = (
        getFieldDecorator('noticeType',{ initialValue:'info'})
        (<Select style={{width:90}} >
              <Option value="info">通知</Option>
              <Option value="success">提示</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
      </Select>)
    );

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem  label="标题"  {...formItemLayout4_16} hasFeedback>
          {
            getFieldDecorator('title',{
             rules: [{ required: true,message:'请输入公告标题'}],
            })
            (<Input addonBefore={noticeType} style={{width:'100%'}}/>)
          }
        </FormItem>
        <FormItem  label="内容"  {...formItemLayout4_16}>
	         <Editor ref="editor" options={{style:{height:'300px',marginBottom:'50px'}}} onChange={this.editorChange} />
        </FormItem>
        <FormItem  label="附件"  {...formItemLayout4_16}>
           <Upload {...uploadProps}>
             <Button>
               <Icon type="upload" /> 点击上传附件
             </Button>
           </Upload>
         </FormItem>
        <FormItem label="已阅" style={{display:this.props.id?"":"none"}} {...formItemLayout4_16} help='已阅的用户列表'  >
          {
            getFieldDecorator('readUser')
            (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 6, offset: 2 }}>
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

const NewNotice = Form.create()(form);

export default NewNotice;
