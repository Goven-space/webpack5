import React from 'react';
import { Form, Select, Input, Button,Spin,notification,InputNumber,Radio} from 'antd';
import AppSelect from '../../../core/components/AppSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.ESB.DATAMAPPING_CATEGORY.save;
const loadDataUrl=URI.ESB.DATAMAPPING_CATEGORY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
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
        FormUtils.getSerialNumber(this.props.form,"categoryId",this.applicationId,"MAPPING");
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
          postData.appId=this.appId;
          postData.applicationId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="配置名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="指定任何有意义的且能描述本配置的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the tagName!' }]
            })
            (<Input/>)
          }
        </FormItem>

        <FormItem
          label="配置唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='保存后不可修改,加上应用id前缀可避免重复'
        >
          {
            getFieldDecorator('categoryId', {
              rules: [{ required: true, message: '请输入配置的id' }]})
            (<Input disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="保留旧字段"
          help='保留表示所有旧的字段在新数据中不存在时将被全部保留下来'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('extendsData',{rules: [{ required: true}],initialValue:0})
          (<RadioGroup  >
            <Radio value={0}>否</Radio>
            <Radio value={1}>保留</Radio>
          </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="输入JSON"
          help="请填写输入JSON示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('inputJson',{
            rules: [{ required: false}]
          })
          (<Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />)
          }
        </FormItem>
        <FormItem
          label="返回字段"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="空表示返回所有,指定要返回的字段可使用JsonPath指定如:$.data"
        >
          {
            getFieldDecorator('returnJsonPath', {
              rules: [{ required: false, message: '' }]
            })
            (<Input/>)
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

export default Form.create()(form);
