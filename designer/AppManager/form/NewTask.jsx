import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message,DatePicker } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import Editor from '../../../core/components/Editor';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_TASK.getById;
const saveDataUrl=URI.CORE_TASK.save;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=task";
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.userId=AjaxUtils.getCookie("userId");
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
      FormUtils.getFiles(id,(fileList)=>{
        if(fileList.length>0){
          this.setState({ fileList:fileList });
        }
      });
      //载入表单数据
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.endDate){
              data.endDate=moment(data.endDate, dateFormat);
            }
            if(data.taskOwner!==undefined && data.taskOwner!=='' ){
              data.taskOwner=data.taskOwner.split(",");
            }
            console.log(data.taskOwner);
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
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
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          if(postData.endDate){
            postData.endDate=postData.endDate.format(dateFormat); //日期转换
          }
          postData.fileList=this.state.fileList.map((file) => {if(file.parentDocId==='0'){return file.uid;}}).join(",");//附件id要上传
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
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

  editorChange=(content)=>{
    this.state.formData.body=content;
  }

  render() {
    let createDate=this.props.createDate||this.state.formData.createDate;
    if(createDate!=='' && createDate!==undefined){
      createDate=moment(createDate,dateFormat); //把日期格式为moment对象
    }

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
    const taskType = (
        getFieldDecorator('taskType',{ initialValue:'需求'})
        (<Select style={{width:90}} >
              <Option value="需求">需求</Option>
              <Option value="BUG">BUG</Option>
              <Option value="建议">建议</Option>
              <Option value="优化">优化</Option>
      </Select>)
    );

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem  label="说明"  {...formItemLayout4_16} hasFeedback >
          {
            getFieldDecorator('title',{
             rules: [{ required: true,message:'请输入任务说明'}],
            })
            (<Input placeholder="一句话描述本任务" addonBefore={taskType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem label="日期" {...formItemLayout4_16} help="期望完成日期" >
          {
            getFieldDecorator('endDate',{rules: [{ required: true,message:'请选择日期'}], initialValue:createDate})
            (<DatePicker format={dateFormat}  style={{width:'200px'}} />)
          }
        </FormItem>
        <FormItem  label="开发者"  {...formItemLayout4_16} help='指定本任务的开发者' >
          {
            getFieldDecorator('taskOwner',{initialValue:this.userId})
            (<UserAsynTreeSelect />)
          }
        </FormItem>
	     <FormItem  label="附件"  {...formItemLayout4_16}>
          <Upload {...uploadProps}>
            <Button style={{width:'200px'}} >
              <Icon type="upload" /> 点击上传附件
            </Button>
          </Upload>
        </FormItem>
        <FormItem  label="内容"  {...formItemLayout4_16}>
	         <Editor ref="editor" options={{style:{height:'260px',marginBottom:'50px'}}} onChange={this.editorChange} />
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

const NewTask = Form.create()(form);

export default NewTask;
