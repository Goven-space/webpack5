import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Popover,Icon,AutoComplete,Steps,Card,Tabs} from 'antd';
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
import RegAPIHeaderConfig from './components/RegAPIHeaderConfig';
import RegAPIbusinessDataTag from './components/RegAPIbusinessDataTag';
import AceEditor from '../../../core/components/AceEditor';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectDataModels=URI.CORE_DATAMODELS.selectDataModels.replace('{modelType}','all');
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const listAllGatewayAppUrl=URI.CORE_GATEWAY_APPCONFIG.listAll;
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const backendServicesUrl=URI.CORE_GATEWAY_SERVICES.listAll;
const businessAreaTreeUrl=URI.CORE_BusinessDomain.treeOptData;
const Step = Steps.Step;

const steps = [{
  title: 'API发布配置',
}, {
  title: '后端API配置',
}, {
  title: '输入参数配置',
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
      requestBodyFlag:false,
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
            this.setState({formData:data,requestBodyFlag:data.requestBodyFlag,mask:false});

            this.refs.APIParams.setParamsJsonData(data.paramsDocs); //设置映射参数
            data.paramsDocs=[];
            //去除数据中不存在的表单控件中的数据
            FormUtils.setFormFieldValues(this.props.form,data);

            if(data.scsPlugConfig!==undefined && data.scsPlugConfig!==""  && data.scsPlugConfig!==null){
              this.refs.ServiceControlSel.setSelectedRows(JSON.parse(data.scsPlugConfig)); //设置服务控制策略
            }
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    let requestBodyFlag=this.props.form.getFieldValue("requestBodyFlag");
    let methodType=this.props.form.getFieldValue("methodType");
    if(requestBodyFlag && methodType==='GET'){
      AjaxUtils.showError("RequestBody请求必须选择Post方法!");
      return;
    }
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
          postData.configType='REG'; //标记注册的服务地址
          postData.beanId="ServiceRegisterRest";
          postData.beanMethodName="redirectUrl"; //执行的方法名
          postData.appId=this.appId;
          postData.registerFlag=1;
          postData.scsPlugConfig=this.refs.ServiceControlSel.getSelectedRows();
          if(this.refs.HeaderConfig!==undefined){
            postData.backendHeaderParams=this.refs.HeaderConfig.getData();//获取头配置信息
          }
          if(this.refs.RegAPIbusinessDataTag!==undefined){
            postData.businessDataTagConfigs=this.refs.RegAPIbusinessDataTag.getData();//业务标注数据
          }
          postData.apiParams=this.refs.APIParams.getParamsJsonData(); //输入参数配置
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.state.formData.id=data.id;
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

  next() {
     const current = this.state.current + 1;
     let requestBodyFlag=this.props.form.getFieldValue("requestBodyFlag");
     this.setState({ current,requestBodyFlag});
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
              <Option value="PATCH">PATCH</Option>
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
                label="API所属分类"
                {...formItemLayout4_16}
                help='指定本API所属的应用系统分类'
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
                label="服务唯一Id"
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
                  getFieldDecorator('version',{initialValue:"1.0"})
                  (<InputNumber min={0} step={0.1} placeholder="API版本"/>)
                }
              </FormItem>
              <FormItem label="参数请求类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='键值对参数表示使用Form表单模式提交,RequestBody一般为JSON格式提交'
              >
                {getFieldDecorator('requestBodyFlag',{initialValue:false})
                (
                  <RadioGroup>
                    <Radio value={false}>键值对Form参数</Radio>
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
                help="指定API返回的数据类型及Header"
              >{
                getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
                (<AutoComplete  mode='combobox' >
                    <Option value="*">透传注册服务的ContentType及Header</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
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
                (<AutoComplete   >
                    <Option value="">不限定</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
                    <Option value="multipart/form-data">multipart/form-data</Option>
                    <Option value="application/octet-stream">application/octet-stream</Option>
                    <Option value="application/xml;charset=utf-8">application/xml;charset=utf-8</Option>
                    <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
                    <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
                    <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
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
                    <Option value={2} >记录全部输入输出数据(适用于错误追踪和API审计)</Option>
                    <Option value={0} >不记录(并发量大的服务稳定后可不记录)</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="认证方式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='需要认证表示用户登录后如果有权则可调用,需要审批表示用户必须申请了API的调用权限才可以,匿名调用表示无需登录直接调用,appkey认证表示在url中传入appkey'
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
                  <RadioGroup >
                    <Radio value='1'>启用</Radio>
                    <Radio value='2'>调试</Radio>
                    <Radio value='3'>停止</Radio>
                    <Radio value='4'>模拟</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="绑定模拟数据"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='API处于模拟状态或者执行异常时输出本模拟数据给调用端'
              >{
                getFieldDecorator('mockResponseConfigId')
                (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
              }
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
                  label="后端API Method"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='建议与基本配置中发布的方法保持一致'
                >
                {
                  getFieldDecorator('backendMethod', {
                    rules: [{ required: true}],
                    initialValue:'*',
                  })
                  (<Select >
                        <Option value="GET">GET</Option>
                        <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                        <Option value="DELETE">DELETE</Option>
                        <Option value="*">透传</Option>
                      </Select>)
                }
                </FormItem>
                <FormItem
                  label="绑定后端服务"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='绑定后端服务配置(可以在网关配置中统一维护后端服务)'
                >{
                  getFieldDecorator('bindServicesConfigId')
                  (<AjaxSelect url={backendServicesUrl}  options={{showSearch:true}} />)
                }
                </FormItem>
                <FormItem
                  label="后端API URL"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='如果绑定了后端服务则不用重复指定主机名直接填写/path即可，如果未绑定则需指定全路径URL如:http://ip/api 支持微服务实例名http://serviceName/api多个时用逗号分隔或换行,
                  可用${变量}获取传入参数作为URL的组成部分如http://ip/${appid}/${appkey} 使用${$config.变量id}可获取配置变量'
                >
                  {
                    getFieldDecorator('backendUrl', {
                      rules: [{ required: true}],
                      initialValue:'http://${$config.server}/restapi',
                    })
                    (<Input.TextArea autoSize  />)
                  }
                </FormItem>
                <FormItem label="负载均衡策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help="当后端API有多个时选择负载均衡策略"
                >
                  {getFieldDecorator('loadBalanceId',{initialValue:'WeightRandomServer'})
                  (
                    <AjaxSelect url={listAllBlanceUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
                  )}
                </FormItem>
                <FormItem
                  label="请求超时时间"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='执行超时时间(默认30秒)单位毫秒'
                >{
                  getFieldDecorator('backendConnectTimeout',{rules: [{ required: true}],initialValue:"30000"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem
                  label="重试次数"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='调用后端服务失败后是否进行重试(默认0表示不重试)'
                >{
                  getFieldDecorator('retryNum',{rules: [{ required: true}],initialValue:"0"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem
                  label="重试间隔"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='每次重试时的间隔时间0表示立即重试(单位:毫秒)'
                >{
                  getFieldDecorator('retrySleep',{rules: [{ required: true}],initialValue:"0"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem label="参数传递类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='调用后端API时参数传入的类型,如果要进行参数映射则保存后在API的参数配置中进行参数映射配置'
                >
                  {getFieldDecorator('backendParamType',{initialValue:1})
                  (
                    <Select style={{width:400}}  >
                      <Option value={1}>透传(与发布的API保持一致)</Option>
                      <Option value={2}>后端为键值对参数</Option>
                      <Option value={3}>后端为RequestBody字符串参数</Option>
                      <Option value={4}>RequestBody按字节流透传到后端</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  label="自定义Body请求"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='如果为空则表示透传Body参数，自定义模板可以使用${变量}来获取HTTP参数,使用${requestBody}可取到请求body,如果是GET转Body请求请注意Content-Type要在Header中指定为application/json;charset=utf-8'
                  style={{display:this.props.form.getFieldValue("backendParamType")==3?'':'none'}}
                >{
                  getFieldDecorator('backendRequestBodyTemplate')
                  (<Input.TextArea  autoSize />)
                }
                </FormItem>
                <FormItem
                  label="字节流返回"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help="是否把后端服务的数据按字节流转发到前端(可以支持附件下载),否表示按字符串转发"
                >{
                  getFieldDecorator('backendResponseBodyStreamFlag',{initialValue:false})
                  (            <RadioGroup>
                                <Radio value={false}>否</Radio>
                                <Radio value={true}>是</Radio>
                              </RadioGroup>)
                  }
                </FormItem>
              </div>
              <div   style={{marginTop:'20px',marginBottom:'20px',display:current===2?'':'none'}}   >
                <Card>
                  <Tabs size="large">
                    <TabPane  tab="输入参数" key="acl"  >
                        <Card title="示例Body参数配置"  style={{display:this.state.requestBodyFlag?'':'none'}}>
                          <FormItem
                            label=""
                            labelCol={{ span: 2 }}
                            wrapperCol={{ span: 22 }}
                            help='指定RequestBody请求时的示例JSON或字符串,在API文档中查看或测试时提供参考'
                          >{
                            getFieldDecorator('requestBodySampleStr')
                            (<AceEditor mode='json' width='100%' height='460px'/>)
                            }
                          </FormItem>
                        </Card>
                        <div style={{display:this.state.requestBodyFlag?'none':''}} >
                        <EditAPIMapParams ref="APIParams" id={this.id} appId={this.appId}  />
                        </div>
                    </TabPane>
                    <TabPane  tab="Header参数" key="props"  >
                          <RegAPIHeaderConfig ref="HeaderConfig" backendHeaderParams={this.state.formData.backendHeaderParams} />
                          <FormItem
                            labelCol={{ span: 2 }}
                            wrapperCol={{ span: 16 }}
                          >{
                            getFieldDecorator('backendHaderTransparent',{initialValue:0})
                            (            <RadioGroup>
                                          <Radio value={1}>默认透传Header</Radio>
                                          <Radio value={0}>否</Radio>
                                        </RadioGroup>)
                            }
                          </FormItem>
                    </TabPane>
                    <TabPane  tab="数据标签" key="businessDataTag"  >
                          <RegAPIbusinessDataTag ref="RegAPIbusinessDataTag" backendHeaderParams={this.state.formData.businessDataTagConfigs}   />
                    </TabPane>
                  </Tabs>
                </Card>
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

export default Form.create()(form);
