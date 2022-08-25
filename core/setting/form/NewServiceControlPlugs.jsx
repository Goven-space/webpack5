import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber} from 'antd';
import AjaxSelect from '../../components/AjaxSelect';
import DyAjaxSelect from '../../components/DyAjaxSelect';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.CORE_SERVICECONTROLPLUGS.listBeans;
const submitUrl=URI.CORE_SERVICECONTROLPLUGS.save;
const loadDataUrl=URI.CORE_SERVICECONTROLPLUGS.getById;
const getControllerCategorysUrl=URI.CORE_CATEGORYNODE.listAllNodes+"?categoryId=ControlStrategy";
const ListBeansByInterfaceUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.url=loadDataUrl.replace('{id}',this.id);
    this.appId=this.props.appId||'core';
    this.beanUrl=ListBeansByInterfaceUrl+"?interface=IBaseServiceControlStrategy";
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
        <FormItem  label="所属分类"   {...formItemLayout4_16}  >
          {
            getFieldDecorator('categoryId', {rules: [{ required: true, message:'请选择所属分类！'}]})
            (<AjaxSelect valueId='nodeId' textId='nodeText' url={getControllerCategorysUrl} />)
          }
        </FormItem>
        <FormItem
          label="配置说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
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
          label="唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='必须填写一个唯一Id'
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="控制点"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择本策略执行检查的控制点,请根据策略需求选择合适的执行时机(控制点按先后顺序依次检查)'
        >{
          getFieldDecorator('controlPoint',{rules: [{ required: true}]})
          (<Select>
              <Option value='RequestInit'>请求初始化时</Option>
              <Option value='BeforeServiceExecution'>服务或路由执行前(Bean方法被调用前)</Option>
              <Option value='BeforeConnectionUrl'>转发到后端服务前(不支持中断执行)</Option>
              <Option value='AfterServiceExecution'>服务或路由执行后(Bean方法调用成功后)</Option>
              <Option value='ServiceRunException'>服务或路由执行异常时(Bean方法执行异常时)</Option>
              <Option value='ServiceRunFinally'>请求Finally(服务执行成功与否都执行)</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="控制范围"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如果要按应用控制请填写应用appId多个用逗号分隔,*表示所有服务'
        >{
          getFieldDecorator('controlAppIds',{rules: [{ required: true}]})
          (<Select mode='combobox'>
              <Option value='*'>所有应用的服务</Option>
              <Option value='binding'>绑定本控制策略的服务</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="插件BeanId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="BeanId是指在容器中注册的类型为ControlStrategy,且继承了IBaseServiceControlStrategy接口的Bean"
        >
          {
            getFieldDecorator('beanId', {
              rules: [{ required: true }]
            })
            (<AjaxSelect url={this.beanUrl} valueId='beanId' textId="beanName" options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="执行顺序"
          {...formItemLayout4_16}
          help='数字越小越先执行'
        >
          {
            getFieldDecorator('sortNum', {
              rules: [{ required: true}],
              initialValue:'1',
            })
            (<InputNumber min={1}  />)
          }
        </FormItem>
        <FormItem
          label="状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('state',{initialValue:'1'})
          (<RadioGroup>
              <Radio value='1'>启用</Radio>
              <Radio value='0'>停止</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='备注信息会显示到策略的配置说明中'
        >{
          getFieldDecorator('remark')
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

const NewServiceControlPlugs = Form.create()(form);
export default NewServiceControlPlugs;
