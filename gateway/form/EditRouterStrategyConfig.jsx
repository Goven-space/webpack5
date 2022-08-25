import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

//新增路由控制策略

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;
const submitUrl=URI.CORE_GATEWAY_PLUGIN.save;
const loadDataUrl=URI.CORE_GATEWAY_PLUGIN.getById;

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
        FormUtils.getSerialNumber(this.props.form,"configId",'GATEWAY',"PLUG");
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
                AjaxUtils.showInfo(data.msg);
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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="控制策略说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          <span>{this.state.formData.configName}</span>
        </FormItem>
        <FormItem
          label="策略配置参数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help={this.state.formData.remark}
        >
          {
            getFieldDecorator('defaultParamsValue')
            (<Input.TextArea  autosize={{ minRows: 4, maxRows: 20 }} />)
          }
        </FormItem>
        <FormItem
          label="提示信息"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='当控制策略检查失败时输出此提示给调用端,可以策略中获取此消息!'
        >{
          getFieldDecorator('returnStr')
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

const EditRouterStrategyConfig = Form.create()(form);
export default EditRouterStrategyConfig;
