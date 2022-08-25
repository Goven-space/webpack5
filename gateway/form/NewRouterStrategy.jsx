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
          hasFeedback
          help="指定任何有意义的且能描述本插件的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input />)
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
          label="控制范围"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如果要按应用控制请填写网关应用appId多个用逗号分隔,*表示所有路由,PART表示在路由中绑定'
        >{
          getFieldDecorator('controlType',{rules: [{ required: true}],initialValue:'*'})
          (<AutoComplete mode='combobox' >
              <Option value='*'>所有路由配置规则</Option>
              <Option value='PART'>在路由转发规则中绑定本策略</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem
          label="控制点"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择控制策略执行时机'
        >{
          getFieldDecorator('controlPoint',{rules: [{ required: true}],initialValue:'BeforeServiceExecution'})
          (<Select>
              <Option value='RequestInit'>请求初始化时(只支持全局范围)</Option>
              <Option value='BeforeServiceExecution'>后端服务调用前</Option>
              <Option value='AfterServiceExecution'>后端服务调用后</Option>
              <Option value='ServiceRunException'>服务调用执行异常时</Option>
              <Option value='ServiceRunFinally'>请求Finally(服务执行成功与否都执行)</Option>
              <Option value='UserContextInit'>用户验证初始化时(只支持全局范围)</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="BeanId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="BeanId是指在容器中注册且继承了IRouterControllerPlugin接口的Bean"
        >
          {
            getFieldDecorator('beanId', {
              rules: [{ required: true }]
            })
            (<AjaxSelect url={listBeansUrl+"?interface=IRouterControllerPlugin"} valueId='beanId' textId='beanName' options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('state',{initialValue:'Y'})
          (<RadioGroup>
              <Radio value='Y'>启用</Radio>
              <Radio value='N'>停止</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="执行顺序"
          {...formItemLayout4_16}
          help='相同控制范围和相同控制点的情况下数字越小越先执行'
        >
          {
            getFieldDecorator('sortNum', {
              rules: [{ required: true}],
              initialValue:1001,
            })
            (<InputNumber min={1}  />)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
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

const NewRouterStrategy = Form.create()(form);
export default NewRouterStrategy;
