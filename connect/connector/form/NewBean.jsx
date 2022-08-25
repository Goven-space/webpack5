import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.NEW_BEAN.load;
const saveDataUrl=URI.NEW_BEAN.save;
const validateBeanIdUrl=URI.NEW_BEAN.validate;
const leftMenuUrl=URI.CORE_APPMENU_ITEM.menuUrl+"?categoryId=gateway.plugin";

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.interface=this.props.interface;
    this.beanType=this.props.beanType||'plugin';
    this.state={
      mask:true,
      formData:{}
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state==='fail'){
            message.error("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
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
          postData.appId=this.appId;
          postData.beanType=this.beanType;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                message.error(data.msg);
              }else{
                message.info("保存成功!");
                this.props.closeTab();
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
          label="BeanId"
          {...formItemLayout4_16}
          hasFeedback
          help="唯一BeanId,英文大写字母开头可使用Class类名作为beanId"
        >
          {
            getFieldDecorator('beanId',{rules: [{ required: true}]})
            (<Input placeholder="Java Bean唯一id" />)
          }
        </FormItem>
        <FormItem
          label="Class Path类路径"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如:cn.restcloud.userapp.gateway.类名'
        >
          {
            getFieldDecorator('classPath', {
              rules: [{ required: true, message: 'Please input the class path!' }],
              initialValue:'cn.restcloud.userapp.gateway.'
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="实现的接口"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='必须实现的接口'
        >
          {
            getFieldDecorator('interfaces', {
              rules: [{ required: true}],
              initialValue:this.interface
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
          style={{display:'none'}}
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
          style={{display:'none'}}
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
          style={{display:'none'}}
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
