import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';
import TagsSelect from '../../components/FormComponents/TagsSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import RolesSelect from '../../../core/components/RolesSelect';
import ServiceControlPlugsSelect from '../../components/FormComponents/ServiceControlPlugsSelect';
import DataModelSelect from '../../datamodel/form/DataModelSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ListClusterServiceName from '../../../core/components/ListClusterServiceName';

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
const ListSqlForSelect=URI.CORE_SQLCONFIG.ListForSelect;
const businessAreaTreeUrl=URI.CORE_BusinessDomain.treeOptData;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.listBeansUrlByAppId=listBeansUrl+"&appId="+this.appId;
    this.listTemplateForSelectUrl=listTemplateForSelectUrl+"?appId=base,"+this.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.categoryId=this.props.categoryId;
    if(this.categoryId==='all' || this.categoryId==='AllAPIs'){this.categoryId=[];}
    this.ListSqlForSelectUrl=ListSqlForSelect+"?appId="+this.appId;
    this.state={
      methodReLoadFlag:true,
      mask:true,
      formData:{},
      mockDisplay:'none',
      sqlConfigDisplay:'none',
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
            AjaxUtils.showError(data.msg);
          }else{
            //设置标签
            if(data.tags!==undefined && data.tags!=='' && data.tags!==null){
              data.tags=data.tags.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.tags=[];
            }
            //设置分类
            if(data.categoryId!==undefined && data.categoryId!=='' && data.categoryId!==null){
              data.categoryId=data.categoryId.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.categoryId=[];
            }
            //高置日记类型
            if(data.logType==='' || data.logType===undefined || data.logType===null){data.logType=1;}
            this.setState({formData:data,mask:false});

            //去除数据中不存在的表单控件中的数据
            let allFormFieldsValue=this.props.form.getFieldsValue();
            for(var itemName in allFormFieldsValue){
              allFormFieldsValue[itemName]=data[itemName];
            }
            this.props.form.setFieldsValue(allFormFieldsValue);

            //是否是RdbSqlMapperRest引警服务
            if(data.beanId==='RdbSqlMapperRest'){
                this.setState({sqlConfigDisplay:''}); //显示sql配置id
            }

            //服务处于模拟状态时
            if(data.state==='4'){this.setState({mockDisplay:''});}

          }
      });
    }
  }


  onSubmit = (closeFlag) => {
    //检测选择条件是否符合要求
    //是否是MongoDataModelRest引警服务
    let beanId=this.props.form.getFieldValue("beanId");
    let method=this.props.form.getFieldValue("beanMethodName");
    let modelId=this.props.form.getFieldValue("modelId");
    let sqlConfigId=this.props.form.getFieldValue("sqlConfigId");

    // console.log(modelId);
    // console.log(beanId);
    // console.log(method);
    if((beanId==='MongoDataModelRest' || beanId==='RdbDataModelRest') && method!=='showView'){
      if(modelId===''){
        AjaxUtils.showError("请选择一个数据模型!");
        return;
      }
    }
    if(beanId==='RdbSqlMapperRest'){
      if(sqlConfigId===''){
        AjaxUtils.showError("请选择SQL配置id!");
        return;
      }
    }

    //是否是RdbDataModelRest引警服务
    if(beanId==='RdbDataModelRest'){
      if(method==='selectListByPage'){
        if(modelId===''){
          AjaxUtils.showError("绑定数据模型不能为空!");
          return;
        }
      }
    }

    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
								if(key === 'version') {
									v=v.length<3?Number(v).toFixed(1):v
								}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.configType='REST'; //标记直接发布的服务地址
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
             this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }
    });
  }

  beanSelectChange=(beanId)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=beanId;
    //Rdb服务解析引擎
    if(beanId==='RdbDataModelRest'){
        this.setState({sqlConfigDisplay:'none'}); //sql配置隐藏
    }
    if(beanId==='RdbSqlMapperRest'){
        this.setState({sqlConfigDisplay:''}); //sql配置显示
    }
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

    //是否显示过虑条件中的选持字段属性
    let showSelectField=false;
    if(this.state.formData.beanId==='RdbDataModelRest'){
      showSelectField=true;
    }

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定本服务所属的分类(请在应用配置中定义API分类)'
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
        <FormItem  label="API所属业务域" {...formItemLayout4_16} help='指定API所属业务域的分类(从业务角度对API进行分类)' >
        {
          getFieldDecorator('businessClassIds',{rules: [{ required: false}]})
          (<TreeNodeSelect url={businessAreaTreeUrl} options={{multiple:true,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
        }
        </FormItem>
        <FormItem
          label="API名称"
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
          help='尽量符合Restful风格,{变量}为Path参数'
        >
          {
            getFieldDecorator('mapUrl', {
              rules: [{ required: true, message: 'Please input the service url!' }],
              initialValue:'/'+this.props.appId.toLowerCase()+'/',
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
            getFieldDecorator('version',{initialValue:"1.0"})
            ((<InputNumber min={0} step={0.1} placeholder="API版本"/>))
          }
        </FormItem>
        <FormItem
          label="Controller BeanId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="Controller Bean是指在本系统容器中注册且类型为Controller的Java Bean."
        >
          {
            getFieldDecorator('beanId', {
              rules: [{ required: true}],initialValue:'DefaultControllerRest'
            })
            (<AjaxSelect url={this.listBeansUrlByAppId} style={{ width: '30%' }}  onChange={this.beanSelectChange} options={{showSearch:true}} />)
          }
        </FormItem>

        <FormItem
          label="指定Bean的方法"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="请指定本服务需要调用的方法名称"
        >
          {
            getFieldDecorator('beanMethodName', {
              rules: [{ required: true}],initialValue:'queryData'})
            (<DyAjaxSelect url={ListBeanMethodsUrl} reLoadFlag={this.state.methodReLoadFlag}  options={{showSearch:true,combobox:false,filterOption:false }} />)
          }
        </FormItem>
        <FormItem
          label="绑定SQL配置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.state.sqlConfigDisplay}}
          help="选择要绑定执行的SQL配置Id"
        >
          {
            getFieldDecorator('sqlConfigId')
            (<AjaxSelect url={this.ListSqlForSelectUrl} style={{ width: '30%' }} defaultData={{value:'',text:'无'}} options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="绑定数据模型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="选择本服务需要操作的数据模型，使用*DataModelRest服务时可根据方法说明进行选择"
        >
          {
            getFieldDecorator('modelId',{initialValue:''})
            (<DataModelSelect appId={this.appId} modelType="E,R" options={{combobox:true}}  />)
          }
        </FormItem>
        <FormItem
          label="绑定输出视图"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="通过绑定输出视图可以把服务返回的数据交由视图进行解析再输出到调用端"
        >
          {
            getFieldDecorator('viewId',{initialValue:''})
            (<AjaxEditSelect url={this.listTemplateForSelectUrl}  options={{showSearch:true,combobox:false}} />)
          }
        </FormItem>
        <FormItem
          label="Produces ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定服务返回的数据类型"
        >{
          getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
          (<AutoComplete  >
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
              <Option value="application/xml;charset=utf-8">application/xml;charset=utf-8</Option>
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
              <Option value="application/x-www-form-urlencoded;charset=utf-8">application/x-www-form-urlencoded;charset=utf-8</Option>
              <Option value="multipart/form-data">multipart/form-data</Option>
              <Option value="application/octet-stream">application/octet-stream</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/xml;charset=utf-8">application/xml;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('logType',{initialValue:1})
          (
            <Select>
              <Option value={1}>调用次数及请求地址记录(默认模式)</Option>
              <Option value={2}>记录全部输入输出数据(适用于错误追踪)</Option>
              <Option value={0}>不记录(并发量大的服务稳定后可不监控)</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="参数类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='调用本服务时参数传入的可选类型'
        >
          {getFieldDecorator('requestBodyFlag',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>键值对参数(Form Query)</Radio>
              <Radio value={true}>RequestBody字符串参数</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="兼容选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定form参数和body参数是否相互兼容'
        >
          {getFieldDecorator('requestCompatibleFlag',{initialValue:1})
          (
            <Select>
              <Option value={1} >form键值对兼容body提交</Option>
              <Option value={2} >body兼容form提交,form自动转为body json(不支持附件传输)</Option>
              <Option value={0} >不进行兼容处理</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="事务支持" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='只有关系数据库才支持事务功能'
        >
          {getFieldDecorator('transaction',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
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
              <Radio value='2'>调试</Radio>
              <Radio value='3'>停用</Radio>
              <Radio value='4'>模拟</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="绑定模拟数据"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("state")==="4"?"":"none"}}
        >{
          getFieldDecorator('mockResponseConfigId')
          (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
        }
        </FormItem>
        <FormItem label="注解同步" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          style={{display:'none'}}
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
        <FormItem
          label="绑定服务器"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='绑定服务器后只有在指定的服务器上才能运行本API，在其他服务器上运行将返回错误!'
        >{
          getFieldDecorator('regServerId')
          (<ListClusterServiceName options={{showSearch:true}} />)
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
          label="自定义属性"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:'none'}}
          help='可以通过AppContext.getServiceConfig().getFilters()获取属性来构建通用API Bean,在RdbDataModelRest和MongoDataModelRest中用来指定自定义条件'
        >{
          getFieldDecorator('filters')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem
          label="扩展属性"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='可以通过AppContext.getServiceConfig().getExtAttribute()获取'
        >{
          getFieldDecorator('extAttribute')
          (<Input />)
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

export default Form.create()(form);
