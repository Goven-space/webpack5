import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TagsSelect from '../../components/FormComponents/TagsSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import RolesSelect from '../../../core/components/RolesSelect';
import ServiceControlPlugsSelect from '../../components/FormComponents/ServiceControlPlugsSelect';
import DataModelSelect from '../../datamodel/form/DataModelSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.NEW_SERVICE.listBeans;
const listMethodsUrl=URI.NEW_SERVICE.listMethods;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const listTemplateForSelectUrl=URI.CORE_VIEWTEMPLATE.listTemplateForSelect;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.listBeansUrlByAppId=listBeansUrl+"&appId="+this.props.appId;
    this.listTemplateForSelectUrl=listTemplateForSelectUrl+"?appId=base,"+this.props.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=本应用服务分类";
    this.categoryId=this.props.categoryId;
    if(this.categoryId==='AllAPIs'){this.categoryId='';}
    this.state={
      methodReLoadFlag:true,
      mask:true,
      formData:{},
      filtersDisplay:'none',
      mockDisplay:'none',
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"API");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.tags!==undefined && data.tags!=='' && data.tags!==null){
              data.tags=data.tags.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.tags=[];
            }
            if(data.categoryId!==undefined && data.categoryId!=='' && data.categoryId!==null){
              data.categoryId=data.categoryId.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.categoryId=[];
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
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }
    });
  }

  onServiceStateChange=(e)=>{
    let v=e.target.value;
    if(v==='4'){
      this.setState({mockDisplay:''});
    }else{
      this.setState({mockDisplay:'none'});
    }
  }

  onMethodReLoad=(v)=>{
      this.state.methodReLoadFlag=false;
  }

  loadModelFiltersConfig=(jsonStr)=>{
    if(jsonStr!==undefined && jsonStr!==''){
      jsonStr="["+jsonStr+"]";
      let jsonObj=JSON.parse(jsonStr);
      this.refs.modelFiltersConfig.loadParentData(jsonObj);
    }
  }

  onModelFiltersChange=(data)=>{
    this.state.formData.filters=JSON.stringify(data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const beanId=this.state.formData.beanId;
    let ListBeanMethodsUrl="";
    if(beanId!==undefined){
      ListBeanMethodsUrl=listMethodsUrl.replace("{beanid}",beanId);
    }

    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="*">所有</Option>
      </Select>)
      );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem label="服务状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('configType',{initialValue:'MODEL'})
          (
            <Select>
              <Option value='MODEL'>设计模式</Option>
              <Option value='REST'>开发模式</Option>
              <Option value="REG">注册服务</Option>
              <Option value="JOIN">聚合服务</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定本服务所属的分类或功能点(可以在应用中的服务分类中进行分类定义)'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.appServiceCategroyUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="服务说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本服务的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="配置名称" />)
          }
        </FormItem>
        <FormItem
          label="服务URL"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='尽量符合Restful风格,{变量}为Path参数,/rest/目录为必须'
        >
          {
            getFieldDecorator('mapUrl', {
              rules: [{ required: true, message: 'Please input the service url!' }],
              initialValue:'/rest/'+this.props.appId+'/',
            })
            (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="服务Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="唯一Id如果已被引用修改会引起引用错误"
        >
          {
            getFieldDecorator('configId')
            (<Input placeholder="服务唯一Id" />)
          }
        </FormItem>
        <FormItem
          label="API版本"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="注册API的版本,在header中传入version可以调用指定版本API"
        >
          {
            getFieldDecorator('version',{initialValue:'1.0'})
            (<Input placeholder="API版本" />)
          }
        </FormItem>
        <FormItem
          label="Produces ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定服务返回的数据类型"
        >{
          getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
          (<AutoComplete>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
              <Option value="application/x-msdownload;charset=utf-8">application/x-msdownload;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem
          label="Consumes ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定传入参数的数据类型,如果有文件上传时请选择multipart/form-data"
        >{
          getFieldDecorator('consumes',{initialValue:'*'})
          (<AutoComplete>
              <Option value="">不限定</Option>
              <Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Option>
              <Option value="multipart/form-data">multipart/form-data</Option>
              <Option value="application/octet-stream">application/octet-stream</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="参数类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='调用本服务时参数传入的可选类型'
        >
          {getFieldDecorator('requestBodyFlag',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>键值对参数</Radio>
              <Radio value={true}>RequestBody字符串参数</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="认证方式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='需要认证表示用户登录后如果有权则可调用,需要审批表示用户必须申请了API的调用权限才可以,匿名调用表示无需登录直接调用'
        >{getFieldDecorator('authType',{initialValue:URI.apiDefaultAuthType})
          (
            <RadioGroup>
              <Radio value={1}>需要认证(token)</Radio>
              <Radio value={3}>需要认证(appkey)</Radio>
              <Radio value={2}>需要审批</Radio>
              <Radio value={0}>匿名调用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 8 }} help='调试状会系统会输出调试信息,模拟状态需要选择模拟输出配置' >
          {getFieldDecorator('state', {initialValue:'1'})
          (
            <RadioGroup onChange={this.onServiceStateChange}>
              <Radio value='1'>启用</Radio>
              <Radio value='4'>模拟</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="绑定模拟数据"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.state.mockDisplay}}
        >{
          getFieldDecorator('mockResponseConfigId')
          (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
        }
        </FormItem>
        <FormItem
          label="标签"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='可给API打上多个标签'
        >
          {
            getFieldDecorator('tags')
            (<TagsSelect appId={this.appId}  />)
          }
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
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button onClick={this.onSubmit}  >
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

const NewServiceModel = Form.create()(form);

export default NewServiceModel;
