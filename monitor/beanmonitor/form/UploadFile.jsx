import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const uploadUrl=URI.LIST_CORE_BEANS.uploadJarFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.loadData=this.props.loadData;
    this.state={
      mask:false,
      formData:{},
      fileList:[],
      filePath:'',
    };
  }

  componentDidMount(){

  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
    });
  }

  onFileChange=(info)=>{
          let fileList = info.fileList;
          if (info.file.status === 'done' && info.file.response.state === true) {
            message.success(`${info.file.response.msg}`);
          }else if (info.file.status === 'done' && info.file.response.state === false) {
            message.error(`${info.file.response.msg}`);
          } else if(info.file.status === 'error'){
            message.error(`${info.file.response.msg}`);
            return;
          }
          this.setState({ fileList });
  }

  onFileRemove=(file)=>{
    AjaxUtils.showError("Jar包已经上传不支持删除Jar包文件!");
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const uploadProps={
        name: 'file',
        action: uploadUrl+"?filePath="+(this.props.form.getFieldValue("filePath")||''),
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem  label="存放路径"  help='上传jar包存放的路径,可手动指定,空表示系统自动计算存放jar包的路径' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
          {
            getFieldDecorator('filePath',{
             rules: [{ required: false,message:'请指定文件存储的路径'}]
            })
            (<Input  />)
          }
        </FormItem>
        <Form.Item label="Jar文件" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
                  {getFieldDecorator('dragger')(
                    <Upload.Dragger {...uploadProps} >
                      <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                      </p>
                      <p className="ant-upload-text">点击或者拖拽Jar文件进行上传</p>
                      <p className="ant-upload-hint">支持单个或者批量Jar文件上传</p>
                    </Upload.Dragger>,
                  )}
        </Form.Item>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
