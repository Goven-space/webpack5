import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormActions from '../../utils/FormUtils';
import AppSelect from '../../components/AppSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_BUSINESSSYSTEM.save;
const loadDataUrl=URI.CORE_BUSINESSSYSTEM.getById;

class form extends React.Component{
  constructor(props){
    super(props);
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
            FormActions.setFormFieldValues(this.props.form,data);
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
          label="系统名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >
          {
            getFieldDecorator('systemName', {
              rules: [{ required: true, message: 'Please input the systemName!' }]
            })
            (<Input placeholder="系统名称" />)
          }
        </FormItem>

        <FormItem
          label="系统唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="系统id必须带在http的header的systemid中传入"
        >
          {
            getFieldDecorator('systemId', {
              rules: [{ required: true, message: '请输入系统id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="授权密码"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="授权密码必须带在http的header的systempwd中传入,填*号表示无需密码验证"
        >{
          getFieldDecorator('systemPassword', {
              rules: [{ required: true, message: '请输入密码' }]})
          (<Input type='password' />)
          }
        </FormItem>
        <FormItem
          label="状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('state',{initialValue:1})
          (<RadioGroup>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>停止</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
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

const NewBusinessSystem = Form.create()(form);

export default NewBusinessSystem;
