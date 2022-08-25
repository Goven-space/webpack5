import React from 'react';
import { Form, Input,Title, Button, Spin,Select,Icon,Upload,message,Radio } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

//备份数据的url
const backupsUrl = URI.CORE_DBMGR_MONGODB.backupsUrl;


class form extends React.Component{
  constructor(props){
    super(props);
    this.dbName=this.props.dbName;
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  componentDidMount(){
  }

handleSubmit = e => {
  e.preventDefault();
  this.setState({mask:true});
  this.props.form.validateFields((err, values) => {
    let v=""
    if (!err) {
      Object.keys(values).forEach(
        function(key){
           v=values[key];
        }
      );
      AjaxUtils.post(backupsUrl,{dbName:this.dbName,savePath:v},(data)=>{
        this.setState({mask:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
          AjaxUtils.showInfo(data.msg); //msg为文件路径
         }
       });
    }
  });
};


  render() {
    const { getFieldDecorator } = this.props.form;


    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
     <Form  onSubmit={this.handleSubmit}>
         <p>备份{this.dbName}数据库</p>
        <Form.Item label="保存备份的路径" help='指定服务器上的数据备份目录' >
          {
            getFieldDecorator('savePath', {
              rules: [{ required: true, message: '请填写路径!' }],initialValue:'d:/bakup'
            })(<Input />)
          }
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
          <Button type="primary" htmlType="submit">
            开始备份
          </Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </Form.Item>
      </Form>
    </Spin>
    );
  }
}

const BackupFromPath = Form.create()(form);

export default BackupFromPath;
