import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_LANG.save;
const loadDataUrl=URI.CORE_LANG.getById;

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
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
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
                AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
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
          label="标签名"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="指定任何有意义的且能描述本语言标签的名称"
        >
          {
            getFieldDecorator('tagName', {
              rules: [{ required: true, message: 'Please input the tagName!' }]
            })
            (<Input placeholder="标签说明" />)
          }
        </FormItem>

        <FormItem
          label="标签唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="标签名以L_开头"
        >
          {
            getFieldDecorator('tagId', {
              rules: [{ required: true, message: '请输入标签id' }],initialValue:'L_'+this.appId+"_"})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="标签值"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="标签值为一个由语言类型和值组成的JSON字符串"
        >{
          getFieldDecorator('tagValue', {
              rules: [{ required: true, message: '请输入标签值' }],initialValue:'{"CN":"中文","EN":"英文"}'})
          (<Input.TextArea  autosize />)
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

const NewLangTag = Form.create()(form);

export default NewLangTag;
