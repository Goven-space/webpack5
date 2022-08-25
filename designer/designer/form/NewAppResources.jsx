import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_APPRESOURCES.getById;
const saveDataUrl=URI.CORE_APPRESOURCES.save;
const uploadUrl=URI.CORE_FILE.uploadResource;
const deleteUrl=URI.CORE_FILE.deleteFile;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId==='AllFile'?'':this.props.categoryId;
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".FileCategory&rootName=资源分类";
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
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = () => {
    if(this.state.fileList.length>1){
      AjaxUtils.showError("只能上传一个文件!");
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
        action: uploadUrl+"?appId="+this.props.appId,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定文件所在分类'
        >
          {
            getFieldDecorator('folderId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId,
              }
            )
            (<TreeNodeSelect  url={this.menuUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem  label="标题"  {...formItemLayout4_16} hasFeedback>
          {
            getFieldDecorator('title',{
             rules: [{ required: true,message:'请输入资源说明'}],
            })
            (<Input  />)
          }
        </FormItem>
	     <FormItem  label="资源文件"  {...formItemLayout4_16}>
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

const NewAppResources = Form.create()(form);

export default NewAppResources;
