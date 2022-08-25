import React from 'react';
import { Form, Select, Input, Button,Spin,} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const submitUrl=URI.CORE_MOCK_RESPONSE.save;
const loadDataUrl=URI.CORE_MOCK_RESPONSE.getById;
const listMockConfig=URI.CORE_MOCK_MGR.listAllSelect;
const listViewBeansUrl=URI.CORE_MOCK_RESPONSE.listViewBeans;

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
          postData.appId='gateway';
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

  formatMockData=()=>{
    let value=this.props.form.getFieldValue("responseBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"responseBody":value});
  }
  
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="配置名称"
          {...formItemLayout4_16}
          hasFeedback
          help="指定任何有意义的且能描述本配置的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="配置名称" />)
          }
        </FormItem>
        <FormItem
          label="模拟数据"
          {...formItemLayout4_16}
          style={{display:this.state.bodyDisplay}}
          help={<span>指定绑定了本模拟配置的服务在模拟状态时输出的JSON <a onClick={this.formatMockData} >格式化JSON</a></span>}
        >
          {
            getFieldDecorator('responseBody',{initialValue:'{"state":true,"msg":"This is a mock message"}'})
            (<Input.TextArea style={{minHeight:'280px',maxHeight:'450px'}} />)
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

const NewMockResponseConfig = Form.create()(form);

export default NewMockResponseConfig;
