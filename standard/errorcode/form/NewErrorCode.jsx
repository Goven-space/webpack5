import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_ErrorCodes.getById;
const saveDataUrl=URI.CORE_ErrorCodes.save;

//新增错误码配置

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData(); //载入表单数据
  }

  loadData(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      //载入表单数据
      this.setState({mask:true});
      let url=loadDataUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
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
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
            this.setState({mask:false});
              if(data.state===false){
                message.error(data.msg);
              }else{
                this.props.close(true);
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
      <Form  >
        <FormItem  label="错误码" help='请按标准规范录入错误编码'  {...formItemLayout4_16} >
          {
            getFieldDecorator('errorCode', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="错误码名称"  help='指定一个有意义的名称'  {...formItemLayout4_16}   >
          {
            getFieldDecorator('errorName',{rules: [{ required: true}],initialValue:''})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="出错提示信息" help='出错时的建议提示信息'   {...formItemLayout4_16} >
          {
            getFieldDecorator('errorMsg', {
              rules: [{ required: false}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="所属系统名称"  help='错误码产生的业务系统的名称多个用逗号分隔'  {...formItemLayout4_16}   >
          {
            getFieldDecorator('systemName',{rules: [{ required: false}],initialValue:'所有'})
            (<Input />)
          }
        </FormItem>
        <FormItem  label="错误JSON" help='出错时对应的JSON数据示例'   {...formItemLayout4_16} >
          {
            getFieldDecorator('jsonMsg', {
              rules: [{ required: false}]
            })
            (<Input.TextArea  />)
          }
        </FormItem>
        <FormItem  label="详细描述" help='出错时的详细描述信息'   {...formItemLayout4_16} >
          {
            getFieldDecorator('describe', {
              rules: [{ required: false}]
            })
            (<Input.TextArea  />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
