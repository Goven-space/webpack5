import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_MOCK_RULE.save;
const loadDataUrl=URI.CORE_MOCK_RULE.getById;
const listBeansUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.categoryUrl=URI.CORE_APPMENU_ITEM.menuUrl+"?categoryId=daas.mock";
    this.state={
      mask:true,
      formData:{columnConfig:"[]"},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"MOCK");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl+id;
      AjaxUtils.get(url,(data)=>{
          if(data.state==='false'){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.columnConfig!==undefined && data.columnConfig!=='' && data.columnConfig!==null){
              this.refs.editMockColumns.loadParentData(JSON.parse(data.columnConfig)); //调用子组件的方法
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
          label="唯一id"
          {...formItemLayout4_16}
          help='指定本配置的唯一id'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}]})
            (<Input disabled />)
          }
        </FormItem>
        <FormItem
          label="规则名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
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
          label="Class Path"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="空表示由系统自动生成,也可直接指定一个继承了IMockDataRulePlugin接口的Class类"
        >
          {
            getFieldDecorator('classPath', {
              rules: [{ required: false}]})
            (<Input />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存退出
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewMockRule = Form.create()(form);

export default NewMockRule;
