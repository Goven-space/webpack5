import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,AutoComplete} from 'antd';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';
import AceEditor from '../../components/AceEditor';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = AutoComplete.Option;
const submitUrl=URI.CORE_PLATFORMTEMLATE.save;
const loadDataUrl=URI.CORE_PLATFORMTEMLATE.getById;

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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

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
          label="模板名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本设置的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="设置说明" />)
          }
        </FormItem>

        <FormItem
          label="模板唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='唯一id'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true, message: '请输入唯一id' }]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="模板类型Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='可以直接填写类型id'
        >
          {
            getFieldDecorator('templateType', {rules: [{ required: true}]})
            (<AutoComplete >
              <Option value="SqlConfig">SQL配置代码模板</Option>
              <Option value="ModelEvent">业务模型事件代码</Option>
              <Option value="Controller">Controller(提供Rest服务)</Option>
              <Option value="Service">Service(业务逻辑层)</Option>
              <Option value="Dao">DaoBean(数据持久层)</Option>
              <Option value="Model">ModelBean(数据模型)</Option>
              <Option value="View">ViewBean(视图展示)</Option>
              <Option value="Validate">ValidateBean(Rest服务参数较验)</Option>
              <Option value="Event">EventBean(被触发的事件)</Option>
              <Option value="ControlStrategy">ControlStrategy(服务控制策略)</Option>
              <Option value="LoadBalance">LoadBalance(负载均衡策略)</Option>
              <Option value="Scheduler">SchedulerBean(定时作业)</Option>
              <Option value="ViewTemplate">视图模板</Option>
            </AutoComplete>)
          }
        </FormItem>
        <FormItem
          label="模板代码"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='填写模板的代码'
        >
          {getFieldDecorator('configValue', {
              rules: [{ required: true, message: '请输入配置值' }]})
            (<AceEditor mode='java' width='100%' height='500px'/>)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea  autosize style={{maxHeight:'450px'}} />)
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

const NewPlatformTemplateCode = Form.create()(form);

export default NewPlatformTemplateCode;
