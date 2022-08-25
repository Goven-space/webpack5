import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Popover,Icon,AutoComplete,Steps,Row,Col,Tag,Alert} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import ListClusterServiceName from '../../../core/components/ListClusterServiceName';
import TagsSelect from '../../components/FormComponents/TagsSelect';
import AppSelect from '../../../core/components/AppSelect';
import RolesSelect from '../../../core/components/RolesSelect';
import ServiceControlPlugsSelect from '../../components/FormComponents/ServiceControlPlugsSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditAPIMapParams from './components/EditAPIMapParams';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.NEW_SERVICE.listBeans;
const listMethodsUrl=URI.NEW_SERVICE.listMethods;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectDataModels=URI.CORE_DATAMODELS.selectDataModels.replace('{modelType}','all');
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const listAllGatewayAppUrl=URI.CORE_GATEWAY_APPCONFIG.listAll;
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const businessAreaTreeUrl=URI.CORE_BusinessDomain.treeOptData;
const Step = Steps.Step;

const steps = [{
  title: 'API发布配置',
}, {
  title: 'Dubbo配置',
}, {
  title: '参数配置',
}];

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.state={
      methodReLoadFlag:true,
      mask:true,
      formData:{},
      mockDisplay:'none',
      current: 0,
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"API");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.effectiveUser!==undefined && data.effectiveUser!==''  && data.effectiveUser!==null ){
              data.effectiveUser=data.effectiveUser.split(",");
            }else{
              data.effectiveUser=[];
            }
            if(data.tags!==undefined && data.tags!==''&& data.tags!==null){
              data.tags=data.tags.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.tags=[];
            }

            //把regServiceUrl中的值重新分出字段值
            this.setRegServiceUrlJson(data);

            // data.regServiceUrl=AjaxUtils.formatJson(data.regServiceUrl);
            this.setState({formData:data,mask:false});

            //设置输入参数
            this.refs.APIParams.setParamsJsonData(data.paramsDocs);

            //去除数据中不存在的表单控件中的数据
            FormUtils.setFormFieldValues(this.props.form,data);

            if(data.state==='4'){this.setState({mockDisplay:''});}
            if(data.scsPlugConfig!==undefined && data.scsPlugConfig!==""  && data.scsPlugConfig!==null){
              this.refs.ServiceControlSel.setSelectedRows(JSON.parse(data.scsPlugConfig)); //设置服务控制策略
            }
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    let paramsData=this.refs.APIParams.getParamsJsonData();
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
								if(key === 'version') {
									v=v.length<3?Number(v).toFixed(1):v
								}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.configType='DUBBO'; //标记注册的服务地址
          postData.beanId="DubboForwardRest";
          postData.beanMethodName="callDubboService"; //执行的方法名
          postData.appId=this.appId;
          postData.registerFlag=1;
          postData.scsPlugConfig=this.refs.ServiceControlSel.getSelectedRows();
          postData.regServiceUrl=this.getRegServiceUrlJson(); //根据配置值计算注册服务的url json对象
          if(postData.regServiceUrl===false){return;} //检测没有通过
          postData.apiParams=paramsData; //要提交的json参数
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
      }else{
        AjaxUtils.showError("请填写完整后再提交!");
      }
    });
  }

  //获得注册服务的json格式
  getRegServiceUrlJson=()=>{
    let jsonObj={};
    let form=this.props.form;
    jsonObj.applicationName=form.getFieldValue("applicationName");
    jsonObj.zookeeper=form.getFieldValue("zookeeper");
    jsonObj.timeout=form.getFieldValue("regConnectTimeout");
    jsonObj.interface=form.getFieldValue("interface");
    jsonObj.methodName=form.getFieldValue("methodName");
    jsonObj.paramsType=form.getFieldValue("paramsType");
    return JSON.stringify(jsonObj);
  }

  //获得注册服务的json格式
  setRegServiceUrlJson=(data)=>{
    let jsonStr=data.regServiceUrl;
    let jsonObj=JSON.parse(jsonStr);
    data.applicationName=jsonObj.applicationName;
    data.zookeeper=jsonObj.zookeeper;
    data.interface=jsonObj.interface;
    data.regConnectTimeout=jsonObj.timeout;
    data.methodName=jsonObj.methodName;
    data.paramsType=jsonObj.paramsType;
  }

  onServiceStateChange=(e)=>{
    let v=e.target.value;
    if(v==='4'){
      this.setState({mockDisplay:''});
    }else{
      this.setState({mockDisplay:'none'});
    }
  }

  next() {
     const current = this.state.current + 1;
     this.setState({ current });
   }

   prev() {
     const current = this.state.current - 1;
     this.setState({ current });
   }

  render() {
    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
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
              <div style={{margin:'30px'}} >
                <Steps current={current}  >
                  {steps.map(item => <Step key={item.title} title={item.title} />)}
                </Steps>
              </div>
              <div  style={{display:current===0?'':'none'}}  >
              <FormItem
                label="API分类"
                {...formItemLayout4_16}
                help='指定本API所属的应用分类(可以在API列表中的API分类中进行管理)'
              >
                {
                  getFieldDecorator('categoryId',
                    {
                      rules: [{ required: true}],
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
                label="API说明"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义的且能描述本API的名称"
              >
                {
                  getFieldDecorator('configName', {
                    rules: [{ required: true, message: 'Please input the configName!' }]
                  })
                  (<Input placeholder="配置名称" />)
                }
              </FormItem>
              <FormItem
                label="API公开URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定公开调用的URL可用{变量}表示为Path参数'
              >
                {
                  getFieldDecorator('mapUrl', {
                    rules: [{ required: true, message: 'Please input the service url!' }],
                    initialValue:'/'+(this.props.appId==='gateway' ? 'api':this.props.appId.toLowerCase())+'/v1/',
                  })
                  (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
                }
              </FormItem>
              <FormItem
                label="服务Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="建议配置唯一Id作为前端Ajax调用的常量"
              >
                {
                  getFieldDecorator('configId')
                  (<Input placeholder="API唯一Id" />)
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
                  (<InputNumber min={0} step={0.1} placeholder="API版本"/>)
                }
              </FormItem>
              <FormItem label="参数请求类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
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
              <FormItem
                label="Produces ContentType"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定服务返回的数据类型"
              >{
                getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
                (<AutoComplete  mode='combobox' >
                    <Option value="*">透传注册服务的ContentType</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
                    <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
                    <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
                    <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
                    <Option value="application/xml;charset=utf-8">application/xml;charset=utf-8</Option>
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
                (<AutoComplete   >
                    <Option value="">不限定</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
                    <Option value="multipart/form-data">multipart/form-data</Option>
                    <Option value="application/octet-stream">application/octet-stream</Option>
                    <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
                    <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
                    <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
                    <Option value="text/xml;charset=utf-8">text/xml;charset=utf-8</Option>
                    <Option value="application/xml;charset=utf-8">application/xml;charset=utf-8</Option>
                    <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
                  </AutoComplete >
                )}
              </FormItem>
              <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='只有数据转发策略才能记录请求和响应数据,地址查询服务只记录本服务的调用次数'
              >
                {getFieldDecorator('logType',{initialValue:2})
                (
                  <Select>
                    <Option value={1} >调用次数及请求地址记录(默认模式)</Option>
                    <Option value={2} >记录全部输入输出数据(适用于错误追踪)</Option>
                    <Option value={0} >不记录(并发量大的服务稳定后可不监控)</Option>
                  </Select>
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
              <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 8 }} >
                {getFieldDecorator('state', {initialValue:'1'})
                (
                  <RadioGroup onChange={this.onServiceStateChange}>
                    <Radio value='1'>启用</Radio>
                    <Radio value='2'>调试</Radio>
                    <Radio value='3'>停止</Radio>
                    <Radio value='4'>模拟</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="绑定模拟配置"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='API处于模拟状态或者执行异常时输出本模拟数据给调用端'
              >{
                getFieldDecorator('mockResponseConfigId')
                (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
              }
              </FormItem>
              <FormItem label="同步调用模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='设置本API是否为同步调用模式(默认为同步模式),异步模式时调用本服务的所有请求将会自动加入队列中'
              >
                {getFieldDecorator('syncFlag',{initialValue:true})
                (
                  <RadioGroup>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
               <FormItem
                label="服务控制策略"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='添加自定义控制策略'
              >{
                <ServiceControlPlugsSelect ref='ServiceControlSel' />
                }
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
                label="发布范围"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
              >{
                getFieldDecorator('effectiveUser')
                (<RolesSelect options={{showSearch:true,mode:'multiple'}} />)
              }
              </FormItem>
              <FormItem
                label="备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('remark')
                (<Input.TextArea autoSize />)
                }
              </FormItem>
          </div>
          <div  style={{display:current===1?'':'none'}}   >
              <FormItem
                label="Dubbo服务名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='请指定Dubbo的application.name的服务名,可以使用${#config.变量}获取配置值'
              >
                {
                  getFieldDecorator('dubboApplicationName', {
                    rules: [{ required: true}],
                    initialValue:'${#config.dubboprovider}',
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="zookeeper地址"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='请指定zookeeper注册中心的地址,可以使用${#config.变量}获取配置值'
              >
                {
                  getFieldDecorator('dubboZookeeper', {
                    rules: [{ required: true}],
                    initialValue:'${#config.zookeeper}',
                  })
                  (<Input  />)
                }
              </FormItem>
              <FormItem
                label="接口Class路径"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定Dubbo提供服务的接口类路径'
              >
                {
                  getFieldDecorator('dubboInterface', {
                    rules: [{ required: true}]
                  })
                  (
                    <Input />
                  )
                }
              </FormItem>
              <FormItem
                label="接口的方法"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定要调用接口的方法名称'
              >
                {
                  getFieldDecorator('dubboMethodName', {
                    rules: [{ required: true}]
                  })
                  (
                    <Input />
                  )
                }
              </FormItem>
              <FormItem
                label="方法的参数类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定接口方法中每个参数的类型多个用逗号分隔如：java.lang.String,int,java.util.List以及Class如：cn.user.userObj'
              >
                {
                  getFieldDecorator('dubboParamsType', {
                    rules: [{ required: false}]
                  })
                  (
                    <Input.TextArea autoSize />
                  )
                }
              </FormItem>
              <FormItem
                label="版本"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='没有版本可以指定为空值'
              >
                {
                  getFieldDecorator('dubboVersion', {
                    rules: [{ required: false}]
                  })
                  (
                    <Input />
                  )
                }
              </FormItem>
              <FormItem
                label="请求超时时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='执行超时时间(默认30秒)单位毫秒'
              >{
                getFieldDecorator('regConnectTimeout',{rules: [{ required: true}],initialValue:"30000"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              </div>
              <div   style={{marginTop:'20px',marginBottom:'20px',display:current===2?'':'none'}}   >
                <Alert
                    message="注意"
                    description="Dubbo接口必须根据接口中方法的输入参数依次指明参数Id并一一对应,如果是RequestBody且方法只有一个参数时可以不用配置输入参数"
                    type="warning"
                    closable
                  />
                <br/>
                <EditAPIMapParams ref="APIParams" id={this.id} appId={this.appId} ></EditAPIMapParams>
              </div>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          {
            current < steps.length - 1
            && <Button type="primary" onClick={() => this.next()}>下一步</Button>
          }
          {
            current > 0
            && (
            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
              上一步
            </Button>
            )
          }
          {
            current === steps.length - 1
            &&   <Button type="primary" style={{ marginLeft: 8 }} onClick={this.onSubmit.bind(this,true)}  >  保存并关闭</Button>
          }
          <Button onClick={this.onSubmit} style={{ marginLeft: 8 }}  >保存</Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

const RegWebService = Form.create()(form);

export default RegWebService;
