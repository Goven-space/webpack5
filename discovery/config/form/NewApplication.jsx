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
                AjaxUtils.showInfo("保存成功!");
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
          label="应用名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="建议与实际运行的服务实例名称保持一至"
        >
          {
            getFieldDecorator('configAppName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="应用唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='全局唯一的任意字符串,必须在服务实例中指定需要同步的应用Id(一个服务实例表示一个应用系统,并不是开发时的应用Id)'
        >
          {
            getFieldDecorator('configAppId', {
              rules: [{ required: true, message: '请输入唯一id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          style={{display:'none'}}
          label="允许推送"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='允许子节点推送最新的配置数据到本配置中心'
        >{
          getFieldDecorator('pushData',{initialValue:true})
          (            <RadioGroup>
                        <Radio value={false}>否</Radio>
                        <Radio value={true}>是</Radio>
                      </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="开发者"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='本应用的开发者userId'
        >{
          getFieldDecorator('designer',{initialValue:this.userId})
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea  style={{maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewApplication = Form.create()(form);

export default NewApplication;
