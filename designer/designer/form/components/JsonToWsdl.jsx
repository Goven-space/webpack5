import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber} from 'antd';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import AceEditor from '../../../../core/components/AceEditor';

const FormItem = Form.Item;
const createWsdlUrl=URI.NEW_SERVICE.createWsdl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.webserviceUrl=this.props.webserviceUrl;
    this.closeModal=this.props.closeModal;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
  }


  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
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
          postData.id=this.id; //API的唯一id
          this.setState({mask:true});
          AjaxUtils.post(createWsdlUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("创建成功!");
                this.closeModal(data);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit}  >
      <FormItem
        label="API URL"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        help='WebService的请求地址'
      >{
        getFieldDecorator('webserviceUrl',{rules: [{ required: true}],initialValue:this.webserviceUrl})
        (<Input/>)
        }
      </FormItem>
        <FormItem
          label="请求JSON"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='输入API的请求JSON'
        >{
          getFieldDecorator('requestJson',{rules: [{ required: true}],initialValue:""})
          (<AceEditor mode='json' width='100%' height='260px'/>)
          }
        </FormItem>
        <FormItem
          label="输出JSON"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='输入API的响应结果JSON'
        >{
          getFieldDecorator('responseJson',{rules: [{ required: false}],initialValue:""})
          (<AceEditor mode='json' width='100%' height='260px'/>)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button onClick={this.onSubmit} type="primary"  >
            开始生成
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
