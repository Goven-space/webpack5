import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,DatePicker,Tag,Upload,Icon,message} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APIPORTAL_APPY.appyApi;
const uploadUrl=URI.CORE_FILE.uploadResource;
const deleteUrl=URI.CORE_FILE.deleteFile;

//API调用申请表

class form extends React.Component{
  constructor(props){
    super(props);
    this.apiIds=this.props.apiIds;
    this.apiNames=this.props.apiNames;
    this.userName=AjaxUtils.getCookie("userName");
    this.appId='apiportal';
    this.uploadUrl=uploadUrl+"?appId="+this.appId;
    this.state={
      mask:false,
      fileList:[],
    };
  }


  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.apiId=this.apiIds.join(",");
          if(postData.endDateTime){
            postData.endDateTime=postData.endDateTime.format("YYYY-MM-DD HH:mm"); //日期转换
          }
          postData.fileList=this.state.fileList.map((file) => {if(file.parentDocId==='0'){return file.uid;}}).join(",");//附件id要上传
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const uploadProps={
        name: 'file',
        action: this.uploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <FormItem
          label="要申请的API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {
            this.apiNames.map(item=><Tag color='green' >{item}</Tag>)
          }
        </FormItem>
        <FormItem
          label="申请人姓名"
          help='请填写申请者的姓名'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('userName',{rules: [{ required: true}],initialValue:this.userName} )
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="有效时间"
          help='空表示永久有效'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {
            getFieldDecorator('endDateTime',{rules: [{ required: false,message:'请选择时间'}]})
            (<DatePicker  showTime format="YYYY-MM-DD HH:mm"    style={{width:'200px'}} />)
          }
        </FormItem>
        <FormItem
          label="联系电话"
          help='请填写一个有效的联系电话'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('tel',{rules: [{ required: true}]} )
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="申请备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark',{rules: [{ required: true}]} )
          (<Input.TextArea rows={6}  />)
          }
        </FormItem>
        <FormItem  label="附件"  {...formItemLayout4_16}>
           <Upload {...uploadProps}>
             <Button>
               <Icon type="upload" /> 点击上传附件
             </Button>
           </Upload>
         </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
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

export default Form.create()(form);
