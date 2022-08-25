import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_CATEGORYTYPE.save;
const loadDataUrl=URI.CORE_CATEGORYTYPE.getById;

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
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="分类名"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="指定任何有意义的且能描述本分类的名称"
        >
          {
            getFieldDecorator('categoryName', {
              rules: [{ required: true, message: 'Please input the tagName!' }]
            })
            (<Input placeholder="分类名" />)
          }
        </FormItem>

        <FormItem
          label="分类唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >
          {
            getFieldDecorator('categoryId', {
              rules: [{ required: true, message: '请输入分类的id' }]})
            (<Input />)
          }
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

const NewCategoryType = Form.create()(form);

export default NewCategoryType;
