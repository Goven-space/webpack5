import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.NEW_BEAN.load;
const saveDataUrl=URI.NEW_BEAN.save;
const validateBeanIdUrl=URI.NEW_BEAN.validate;
const listClassesUrl=URI.NEW_BEAN.listClassesUrl;
const SerailNumberUrl=URI.CORE_SERIALNUMBER.getNewSerialNumber;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.beanType=this.props.beanType||'Controller';
    this.state={
      mask:true,
      formData:{}
    };
  }

  componentDidMount(){
    if(this.id===undefined || this.id===''){
        this.getSerialNumber(this.props.form,"beanId",this.appId,"BEAN");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',this.id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  //获取一个新的流水号
   getSerialNumber=(form,fieldName,appId,type)=>{
    let url=SerailNumberUrl+"?appId="+appId+"&type="+type;
    AjaxUtils.get(url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let fdData={};
          fdData[fieldName]=data.serialNumber;
          let classPath="cn.restcloud.userapp."+this.appId+"."+this.beanType+".";
          fdData['classPath']=classPath.toLowerCase()+data.serialNumber;
          form.setFieldsValue(fdData);
        }
    });
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state==='fail'){
                message.error("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                message.info("保存成功!");
                this.props.closeTab();
              }
          });
      }
    });
  }

  //检测configId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateBeanIdUrl,callback);
  }

  changeBeanType=(value)=>{
    let path=("cn.restcloud.userapp."+this.appId+"."+value+".").toLowerCase()+this.props.form.getFieldValue("beanId");
    let data={"classPath":path};
    this.props.form.setFieldsValue(data);
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
            getFieldDecorator('appId', {rules: [{ required: true}],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="BeanId"
          {...formItemLayout4_16}
          hasFeedback
          help="唯一BeanId,建议以appId.开头避免重复也可以使用类的全路径作为beanId"
        >
          {
            getFieldDecorator('beanId', {
              rules: [{required: true, validator:this.checkExist}],
              validateTrigger:['onBlur'], //这里是数组
            })
            (<Input placeholder="Java Bean唯一id" />)
          }
        </FormItem>
        <FormItem
          label="Bean名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本Java Bean的文字"
        >
          {getFieldDecorator('beanName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="Bean类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {
            getFieldDecorator('beanType', {rules: [{ required: true}],initialValue:this.beanType})
            (<Select placeholder="Java Bean类型" onChange={this.changeBeanType}>
              <Option value="Controller">Controller(提供Rest服务)</Option>
              <Option value="Service">Service(业务逻辑层)</Option>
              <Option value="Dao">DaoBean(数据持久层)</Option>
              <Option value="Model">ModelBean(数据模型)</Option>
              <Option value="View">ViewBean(视图展示)</Option>
              <Option value="Validate">ValidateBean(API输入参数校验)</Option>
              <Option value="Event">EventBean(被触发的事件)</Option>
              <Option value="ControlStrategy">ControlStrategy(服务控制策略)</Option>
              <Option value="Plugin">Plugin(插件)</Option>
              <Option value="LoadBalance">LoadBalance(负载均衡策略)</Option>
              <Option value="Scheduler">SchedulerBean(定时作业)</Option>
              <Option value="Component">其他JavaBean</Option>
            </Select>)
          }
        </FormItem>

        <FormItem
          label="Class Path类路径"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如:cn.restcloud.userapp.hello.DemoDao'
        >
          {
            getFieldDecorator('classPath', {
              rules: [{ required: true, message: 'Please input the class path!' }],
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="继承的接口"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如果有接口请填写接口的类路径多个用逗号分隔,空表示系统自动获取,示例值:cn.restcloud.userapp.hello.IDemoDao'
        >
          {
            getFieldDecorator('interfaces', {
              rules: [{ required: false}],
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem label="依赖注入" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='自动进行依赖注入时beanId与接口名去掉I字母一至(如果有重名时可以用appId.开头来区分)'
        >
          {getFieldDecorator('autowired',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="单例模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='多例模式的类不会被容器缓存实例对象，而是每次由容器创建一个新实例并返回'
        >
          {getFieldDecorator('singleton',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem label="热加载" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='热加载模式的类修改后系统会自动重新加载(如果修改了接口则接口不会被热加载)'
         >
          {getFieldDecorator('useClassLoader',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem label="延迟加载" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='表示类在使用时才会被加载到容器中'
         >
          {getFieldDecorator('lazyInit',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false} >否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="注解同步" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='自动同步JavaBean中的@RestConfig,@Params,@ErrorCodes注解信息,禁用后则以Web界面为准'
        >
          {getFieldDecorator('syncAnnotation',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>自动同步</Radio>
              <Radio value={false}>禁用同步</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="代码同步" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='当Java源文件修改时自动同步代码到仓库中'
        >
          {getFieldDecorator('syncCodeRepository',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={true}>自动同步</Radio>
              <Radio value={false}>禁止同步</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewBean = Form.create()(form);

export default NewBean;
