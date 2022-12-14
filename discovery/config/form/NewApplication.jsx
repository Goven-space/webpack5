import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.LIST_CONFIG_APPLICATION.save;
const loadDataUrl=URI.LIST_CONFIG_APPLICATION.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||'core';
    this.userId=AjaxUtils.getCookie("userId");
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
            if(data.environment!=='' && data.environment!==undefined){
              data.environment=data.environment.split(",");
            }
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
            getFieldDecorator('configAppName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="????????????Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='??????????????????????????????,???????????????????????????????????????????????????Id(??????????????????????????????????????????,???????????????????????????Id)'
        >
          {
            getFieldDecorator('configAppId', {
              rules: [{ required: true, message: '???????????????id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          style={{display:'none'}}
          label="????????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='????????????????????????????????????????????????????????????'
        >{
          getFieldDecorator('pushData',{initialValue:true})
          (            <RadioGroup>
                        <Radio value={false}>???</Radio>
                        <Radio value={true}>???</Radio>
                      </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="?????????"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='?????????????????????userId'
        >{
          getFieldDecorator('designer',{initialValue:this.userId})
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

const NewApplication = Form.create()(form);

export default NewApplication;
