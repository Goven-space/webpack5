import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_DATAMODELS.generateJavaCode;
const ProjectSrcPathUrl=URI.CORE_DATAMODELS.projectSrcPath;

//生成数据模型的代码

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.tableName=this.props.tableName||this.modelId;
    this.state={
      mask:false,
      projectSrcPath:'',
      templateType:'MVC',
      priviewCode:'',
      visible:false
    };
  }


  componentDidMount(){
      this.setState({mask:true});
      AjaxUtils.get(ProjectSrcPathUrl,(data)=>{
          if(data.state===false){
            this.showInfo("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({projectSrcPath:data.msg,mask:false});
          }
      });
  }

  onSubmit = (closeFlag=true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
          postData.modelId=this.modelId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: '代码生失败',content:data.msg,width:600});
              }else{
                Modal.info({title: '代码生成结果',content:data.msg,width:600});
                this.props.close();
              }
          });
      }
    });
  }

  priviewCode = (codeType) => {
    let url=SubmitUrl+"/priviewcode?codeType="+codeType;
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
          postData.modelId=this.modelId;
          this.setState({mask:true});
          AjaxUtils.post(url,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: '代码生失败',content:data.msg,width:600});
              }else{
                this.setState({priviewCode:data.code,visible:true});
              }
          });
      }
    });
  }

  onTemplateChange=(v,o)=>{
    if(v==='DataModel'){
      this.setState({templateType:'DataModel'});
    }else if(v==='MVC'){
      this.setState({templateType:'MVC'});
    }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    let spos=this.modelId.lastIndexOf(".");
    let tmpModelId=this.tableName;   //this.modelId.substring(spos+1,this.modelId.length);
    //首字母要转为大写
    tmpModelId = tmpModelId.replace(/\b\w+\b/g, function(word){
      return word.substring(0,1).toUpperCase()+word.substring(1);
    });
    const packagePath="cn.restcloud.userapp."+this.appId.toLowerCase();
    const controllerClassPath="controller."+tmpModelId+"Rest";
    const daoInterfaceClassPath="dao.I"+tmpModelId+"Dao";
    const daoImplClassPath="dao.impl."+tmpModelId+"DaoImpl";
    const modelBeanClassPath="model."+tmpModelId+"Entry";

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title='预览代码' maskClosable={false}
          visible={this.state.visible}
          width='1024px'
          footer=''
          style={{top:'20px'}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <Input.TextArea autosize={{ minRows: 10, maxRows: 30 }} value={this.state.priviewCode}/>
      </Modal>
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="代码生成路径"
          {...formItemLayout4_16}
          help=""
        >
        {this.state.projectSrcPath}
        </FormItem>
        <FormItem
          label="代码模板"
          {...formItemLayout4_16}
          help=""
        >{
           getFieldDecorator('templateId',{ initialValue:'MVC'})
           (<Select onSelect={this.onTemplateChange} >
                  <Option value="DataModel">基于数据模型的通用服务模板</Option>
                  <Option value="MVC">Java标准MVC模板</Option>
           </Select>)
          }
        </FormItem>
        <FormItem
          label="包路径"
          {...formItemLayout4_16}
          help="代码生成所在的基础包路径"
        >
          {
            getFieldDecorator('packagePath',{initialValue:packagePath,rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="Controller服务类"
          {...formItemLayout4_16}
          help={<div>Class的类或称,空表示不生成 <a onClick={this.priviewCode.bind(this,'controllerbean')}>点击预览代码</a></div>}
        >
          {
            getFieldDecorator('controllerClassPath',{initialValue:controllerClassPath})
            (<Input />)
          }
        </FormItem>
         <FormItem
          label="Dao接口类"
          style={{display:this.state.templateType==='MVC'?'':'none'}}
          {...formItemLayout4_16}
          help={<div>Interface的全路径(接口实现类自动产生),空表示不生成 <a onClick={this.priviewCode.bind(this,'daointerface')}>点击预览代码</a></div>}
        >
          {
            getFieldDecorator('daoInterfaceClassPath',{initialValue:daoInterfaceClassPath})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="Dao接口实现类"
          {...formItemLayout4_16}
          style={{display:this.state.templateType==='MVC'?'':'none'}}
          help={<div>接口实现类路径,空表示不生成 <a onClick={this.priviewCode.bind(this,'daoimpl')}>点击预览代码</a></div>}
        >
          {
            getFieldDecorator('daoImplClassPath',{initialValue:daoImplClassPath})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据模型类"
          {...formItemLayout4_16}
          style={{display:this.state.templateType==='MVC'?'':'none'}}
          help={<div>Model数据模型的全路径,空表示不生成 <a onClick={this.priviewCode.bind(this,'modelbean')}>点击预览代码</a></div>}
        >
          {
            getFieldDecorator('modelBeanClassPath',{initialValue:modelBeanClassPath})
            (<Input />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
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

export default Form.create()(form);
