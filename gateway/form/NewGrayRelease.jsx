import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_GRAY.save;
const loadDataUrl=URI.CORE_GATEWAY_GRAY.getById;
const listBeansUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.url=loadDataUrl.replace('{id}',this.id);
    this.state={
      methodReLoadFlag:true,
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    if(this.id===undefined || this.id===''){
        FormUtils.getSerialNumber(this.props.form,"configId","GATEWAY","GRAY");
        this.setState({mask:false});
    }else{
      AjaxUtils.get(this.url,(data)=>{
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
          postData.appId='gateway';
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined && values[key]!==null){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo("??????????????????,???????????????????????????????????????!");
              }else{
                AjaxUtils.showInfo("????????????!");
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
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="????????????????????????"
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
          label="??????Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='????????????????????????Id'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="BeanId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="BeanId????????????????????????????????????IGrayReleaseStrategy?????????Bean"
        >
          {
            getFieldDecorator('beanId', {
              rules: [{ required: true }]
            })
            (<AjaxSelect url={listBeansUrl+"?interface=IGrayReleaseStrategy"} valueId='beanId' textId='beanId' style={{ width: '30%' }} options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="???????????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='??????BeanId??????????????????'
        >
          {
            getFieldDecorator('defaultParamsValue')
            (<Input.TextArea  autosize />)
          }
        </FormItem>
        <FormItem
          label="??????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea  autosize />)
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

const NewGrayRelease = Form.create()(form);
export default NewGrayRelease;
