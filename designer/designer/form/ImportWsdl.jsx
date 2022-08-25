import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message,Radio,Switch,Modal } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AppSelect from '../../../core/components/AppSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.SERVICE_CORE_WSDL.importWsdl;
const uploadUrl=URI.CORE_FILE.uploadFile;
const deleteUrl=URI.CORE_FILE.deleteFile;
const ProjectSrcPathUrl=URI.CORE_DATAMODELS.projectSrcPath; //项目源码路径获取url

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.fileUploadUrl=uploadUrl+"?appId=installapp";
    this.state={
      mask:false,
      formData:{},
      fileList:[],
      authDisplay:'none',
      authFlag:false,
      projectSrcPath:'',
    };
  }

  componentDidMount(){
    this.setState({mask:true});
    AjaxUtils.get(ProjectSrcPathUrl,(data)=>{
        if(data.state===false){
          this.showInfo(data.msg);
        }else{
          this.setState({projectSrcPath:data.msg,mask:false});
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

  onSubmit = () => {
    if(this.state.fileList.length>0){
      if(this.state.fileList.length>1){
        AjaxUtils.showError("一次只能上传一个数据包文件!");
        return;
      }
      let fileName=this.state.fileList[0].name;
      let appId=this.appId;
      if(fileName.indexOf(".wsdl")===-1){
        AjaxUtils.showError("只能上传*.wsdl格式的应用文件!");
        return;
      }
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
                Modal.error({"WSDL导入结果": 'WSDL导入结果',content:data.msg,width:600});
              }else{
                Modal.info({"WSDL导入结果": 'WSDL导入结果',content:data.msg,width:600});
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
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
          style={{display:this.appId==='gateway'?'none':''}}
        >
          {
            getFieldDecorator('appId', {initialValue:this.appId})
            (<AppSelect/>)
          }
        </FormItem>
       <FormItem
          label="远程WSDL文件"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定网络上的wsdl路径如:http://localhost:81/test.wsdl"
        >{
          getFieldDecorator('wsdlUrl')
          (<Input  />)
          }
      </FormItem>
      <FormItem
        label="WSDL需要认证"
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
        help="如果需要认证则输入"
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
        help="如果需要认证则输入"
      >{
        getFieldDecorator('password')
        (<Input addonBefore={<Icon type="lock" />} type="password" />
        )}
      </FormItem>
	     <FormItem  label="本地WSDL文件"  {...formItemLayout4_16}>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传wsdl文件(*.wsdl格式)
            </Button>
          </Upload>
        </FormItem>
        <FormItem
           label="项目路径"
           labelCol={{ span: 4 }}
           wrapperCol={{ span: 16 }}
           help="生成调用WebService的源代码保存路径"
         >{
           getFieldDecorator('projectSrcPath',{initialValue:this.state.projectSrcPath})
           (<Input  />)
           }
       </FormItem>
        <FormItem
           label="指定生成的包名"
           labelCol={{ span: 4 }}
           wrapperCol={{ span: 16 }}
           help="指定导入wsdl后生成class文件所在包(不同的wsdl文件不要指定相同的名包)"
         >{
           getFieldDecorator('packageName',{initialValue:'cn.restcloud.userapp.'+this.appId.toLowerCase()+'.webservice'})
           (<Input  />)
           }
       </FormItem>
        <FormItem
          label="自动生成API代码"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{getFieldDecorator('code',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 10, offset: 4 }}>
          <Button type="primary" onClick={AjaxUtils.showConfirm.bind(this,"导入WSDL文件","提示:如果已经导入过且代码已存在将会被覆盖!",this.onSubmit)}  >
            开始导入
          </Button>
          {' '}
          <Button onClick={this.props.closeTab.bind(this,false)} >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const ImportWsdl = Form.create()(form);

export default ImportWsdl;
