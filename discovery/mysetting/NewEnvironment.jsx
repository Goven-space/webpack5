import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AppSelect from '../../core/components/AppSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_ENVIRONMENTS.save;
const loadDataUrl=URI.CORE_ENVIRONMENTS.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||'core';
    this.id=this.props.id;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    if(this.id===undefined || this.id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',this.id);
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
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("????????????!");
                this.props.close(true);
              }
          });
      }
    });
  }

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <FormItem
          label="????????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="??????????????????????????????????????????????????????"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="????????????" />)
          }
        </FormItem>

        <FormItem
          label="????????????Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='??????Id??????UAT,SIT,DEV,FAT???'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true, message: '???????????????id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="??????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea  style={{maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            ??????
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            ??????
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewEnvironment = Form.create()(form);

export default NewEnvironment;
