import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber} from 'antd';
import AjaxSelect from '../../components/AjaxSelect';
import DyAjaxSelect from '../../components/DyAjaxSelect';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

//修改服务控制参数

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.CORE_SERVICECONTROLPLUGS.listBeans;
const submitUrl=URI.CORE_SERVICECONTROLPLUGS.save;
const loadDataUrl=URI.CORE_SERVICECONTROLPLUGS.getById;
const getControllerCategorysUrl=URI.CORE_CATEGORYNODE.listAllNodes+"?categoryId=ControlStrategy";

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
        FormUtils.getSerialNumber(this.props.form,"configId","API","STRATEGY");
        this.setState({mask:false});
    }else{
      AjaxUtils.get(this.url,(data)=>{
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
                AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
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
          label="配置说明"
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

const EditServiceControlParams = Form.create()(form);
export default EditServiceControlParams;
