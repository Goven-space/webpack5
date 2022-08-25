import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const uploadUrl=URI.ETL.FileManager.uploadFile;
const deleteUrl=URI.ETL.FileManager.deleteFile;

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
          if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功,请点击刷新按扭`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            return;
          }
          this.setState({ fileList });
  }

  onFileRemove=(file)=>{
    AjaxUtils.showInfo("请在文件列表中删除已上传的文件!");
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const uploadProps={
        name: 'file',
        action: uploadUrl+"?id="+this.id+"&appId="+this.props.appId,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <Form.Item >
                  {getFieldDecorator('dragger')(
                    <Upload.Dragger {...uploadProps} >
                      <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                      </p>
                      <p className="ant-upload-text">点击或者拖拽文件进行上传</p>
                      <p className="ant-upload-hint">支持单个或者批量文件上传</p>
                    </Upload.Dragger>,
                  )}
        </Form.Item>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
