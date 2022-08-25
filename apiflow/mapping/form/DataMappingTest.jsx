import React from 'react';
import { Form, Select, Input, Button,Spin,notification,InputNumber,Radio} from 'antd';
import AppSelect from '../../../core/components/AppSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AceEditor from '../../../core/components/AceEditor';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.ESB.DATAMAPPING_CATEGORY.parserUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.data=this.props.data;
    this.appId=this.data.appId;
    this.closeButton=this.props.closeButton||'1'; //0表示不显示关闭按扭，1表示需要显示
    this.state={
      mask:false,
      formData:this.data,
    };
  }

  componentDidMount(){
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
          postData.categoryId=this.data.categoryId;
          this.props.form.setFieldsValue({outputJson:""});
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError("转换失败!");
              }else{
                AjaxUtils.showInfo("转换成功!");
              }
              this.props.form.setFieldsValue({outputJson:AjaxUtils.formatJson(JSON.stringify(data))});
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
              rules: [{ required: true}],initialValue:this.data.configName
            })
            (<Input/>)
          }
        </FormItem>
        <FormItem
          label="输入JSON"
          help="请填写要转换的输入JSON,可以在模板配置中配置输入JSON避免每次重新输入"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('inputJson',{
            rules: [{ required: true}],initialValue:this.data.inputJson
          })
          (<AceEditor mode='json' width='100%' height='400px'/>)
          }
        </FormItem>
        <FormItem
          label="转换结果"
          help="经过映射配置转换后的JSON结果"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('outputJson')
          (<AceEditor mode='json' width='100%' height='400px'/>)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            开始测试
          </Button>
          {' '}
          {this.closeButton=="1"?
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
          :""}
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
