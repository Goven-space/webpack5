import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APPPROPERTIES.save;
const loadDataUrl=URI.CORE_APPPROPERTIES.getById;
const listAllUrl=URI.CORE_ENVIRONMENTS.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
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
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
          hasFeedback
          help='????????????id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="????????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="???????????????????????????????????????(core.properties??????ConfigEnvironment????????????????????????)"
        >
          {
            getFieldDecorator('environment', {initialValue:'ALL'})
            (<AjaxSelect url={listAllUrl}  options={{showSearch:true}} valueId="configId" textId="configId" />)
          }
        </FormItem>
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
          label="???????????????ID"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='????????????????????????????????????(????????????????????????????????????),?????????appId.??????????????????????????????'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true, message: '???????????????id' }],initialValue:this.appId+"."})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="?????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='?????????????????????'
        >{
          getFieldDecorator('configValue', {
              rules: [{ required: true, message: '??????????????????' }]})
          (<Input.TextArea autosize style={{maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem
          label="??????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='?????????????????????????????????????????????'
        >{
          getFieldDecorator('passwordValue',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>???</Radio>
              <Radio value={true}>???</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="??????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize style={{maxHeight:'450px'}} />)
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

const NewAppProperties = Form.create()(form);

export default NewAppProperties;
