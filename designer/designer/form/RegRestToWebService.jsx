import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Popover,Icon,AutoComplete,Steps,Row,Col,Card,Tabs,Drawer} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AceEditor from '../../../core/components/AceEditor';
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
import JsonToWsdl from './components/JsonToWsdl';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectDataModels=URI.CORE_DATAMODELS.selectDataModels.replace('{modelType}','all');
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const backendServicesUrl=URI.CORE_GATEWAY_SERVICES.listAll;
const businessAreaTreeUrl=URI.CORE_BusinessDomain.treeOptData;
const Step = Steps.Step;

const steps = [{
  title: 'WebService配置',
},{
  title: '后端API配置',
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
      formData:{backendHeaderParams:'[{"headerId":"Content-Type","headerValue":"application/json;charset=utf-8","headerType":"OVER"}]'},
      apiType:'rest',
      current: 0,
      visible:false,
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

            //设置输入参数
            this.setState({formData:data,mask:false});

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
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
          postData.configType='RestToWebService'; //标记注册的服务地址
          postData.beanId="RestToWebServiceRest";
          postData.beanMethodName="callWebService"; //执行的方法名
          postData.requestBodyFlag=true;
          postData.registerFlag=1;
          postData.requestBodyDataType='STRING'; //允许传任意字符串的数据
          postData.appId=this.appId;
          if(this.refs.HeaderConfig!==undefined){
            postData.backendHeaderParams=this.refs.HeaderConfig.getData();//获取头配置信息
          }
          if(this.refs.RegAPIbusinessDataTag!==undefined){
            postData.businessDataTagConfigs=this.refs.RegAPIbusinessDataTag.getData();//业务标注数据
          }
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

  getDefaultJson=()=>{
    let xmlCode="{\n\"field1\":\"//data/field1\",\n\"field2\":\"//data/field2\"\n}";
    return xmlCode;
  }

  getDefaultXml=()=>{
    let bodyStr="${xmlbody}";
    let xmlCode=`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <ns2:runResponse xmlns:ns2="http://webservice.example.restcloud.cn/">
         ${bodyStr}
      </ns2:runResponse>
   </soap:Body>
</soap:Envelope>`;
    return xmlCode;
  }

  getWsdlDocument=()=>{
    return `<?xml version='1.0' encoding='UTF-8'?><wsdl:definitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://webservice.restcloud.cn/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:ns2="http://schemas.xmlsoap.org/soap/http" xmlns:ns1="http://webservice.restcloud.cn/" name="WebServiceEntryService" targetNamespace="http://webservice.restcloud.cn/">
  <wsdl:types>
	<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tns="http://webservice.restcloud.cn/" elementFormDefault="unqualified" targetNamespace="http://webservice.restcloud.cn/" version="1.0">
	  <xs:element name="run" type="tns:run"/>
	  <xs:element name="runResponse" type="tns:runResponse"/>
	  <xs:complexType name="run">
		<xs:sequence>
		  <xs:element minOccurs="0" name="requestParamsBean" type="tns:requestParamsItem"/>
		</xs:sequence>
	  </xs:complexType>
	  <xs:complexType name="runResponse">
		<xs:sequence>
		  <xs:element minOccurs="0" name="return" type="tns:responseParamsItem"/>
		</xs:sequence>
	  </xs:complexType>
	</xs:schema>
  </wsdl:types>
  <wsdl:message name="run">
    <wsdl:part element="ns1:run" name="parameters">
    </wsdl:part>
  </wsdl:message>
  <wsdl:message name="runResponse">
    <wsdl:part element="ns1:runResponse" name="parameters">
    </wsdl:part>
  </wsdl:message>
  <wsdl:portType name="WebServiceEntryService">
    <wsdl:operation name="run">
      <wsdl:input message="ns1:run" name="run">
    </wsdl:input>
      <wsdl:output message="ns1:runResponse" name="runResponse">
    </wsdl:output>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="WebServiceEntryServiceSoapBinding" type="ns1:WebServiceEntryService">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="run">
      <soap:operation soapAction="" style="document"/>
      <wsdl:input name="run">
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output name="runResponse">
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="WebServiceEntryService">
    <wsdl:port binding="tns:WebServiceEntryServiceSoapBinding" name="WebServiceEntryServiceImplPort">
      <soap:address location="http://127.0.0.1:8080/restcloud/webservice"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>
`;
  }

  next() {
     const current = this.state.current + 1;
     let requestBodyFlag=this.props.form.getFieldValue("requestBodyFlag");
     this.setState({ current,requestBodyFlag});
   }

   prev() {
     const current = this.state.current - 1;
     this.setState({ current});
   }


   formatRequestBodyJsonStr=()=>{
     let value=this.props.form.getFieldValue("webServiceRequestBody");
     value=AjaxUtils.formatJson(value);
     this.props.form.setFieldsValue({"webServiceRequestBody":value.trim()});
   }

   handleCancel = (e) => {
     this.setState({ visible: false, });
   }

   closeModal=(data)=>{
     this.props.form.setFieldsValue({"webServiceWsdlDocument":data.xmlBody,"requestBodySampleStr":data.requestSampleXml})
     this.setState({visible:false})
   }

   showImportWsdl=()=>{
     this.setState({visible:true,action:"importWsdl"});
   }

  render() {
    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const selectMethod = (
        getFieldDecorator('backendMethod',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="*">所有</Option>
      </Select>)
      );

      const selectRequestMethod = (
          getFieldDecorator('methodType',{ initialValue:'*'})
          (<Select style={{width:80}} >
                <Option value="POST">POST</Option>
                <Option value="*">所有</Option>
        </Select>)
        );

        let content, title;
        if (this.state.action == 'importWsdl') {
          title = '从JSON生成WSDL';
          content = (<JsonToWsdl closeModal={this.closeModal} webserviceUrl={this.props.form.getFieldValue("mapUrl")} />);
        }

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Drawer key={Math.random()}
        title={title}
        placement="right"
        width='960px'
        closable={false}
        onClose={this.handleCancel}
        visible={this.state.visible}
      >
        {content}
      </Drawer>
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
                help='指定本API所属的分类(可以在API列表中的API分类中进行管理)'
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
                label="WebService说明"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义的且能描述本WebService的名称"
              >
                {
                  getFieldDecorator('configName', {
                    rules: [{ required: true, message: 'Please input the configName!' }]
                  })
                  (<Input placeholder="配置名称" />)
                }
              </FormItem>
              <FormItem
                label="WebService公开URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定公开调用WebServices的URL攻取wsdl在后面添加?wsdl'
              >
                {
                  getFieldDecorator('mapUrl', {
                    rules: [{ required: true, message: 'Please input the service url!' }],
                    initialValue:'/'+(this.props.appId==='gateway' ? 'api':this.props.appId.toLowerCase())+'/v1/',
                  })
                  (<Input  addonBefore={selectRequestMethod} style={{width:'100%'}} />)
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
              <FormItem
                label="Produces ContentType"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定服务返回的数据类型"
              >{
                getFieldDecorator('produces',{initialValue:'text/xml;charset=utf-8'})
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
                getFieldDecorator('consumes',{initialValue:'text/xml;charset=utf-8'})
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
                  <RadioGroup>
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
                  label="后端Rest API地址"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='如果绑定了后端服务只需填写路径即可/api，如果未绑定则需填写全路径如:http://192.168.1.2/api'
                >
                  {
                    getFieldDecorator('backendUrl', {
                      rules: [{ required: true}],
                      initialValue:'/api/test',
                    })
                    (<Input addonBefore={selectMethod} />)
                  }
                </FormItem>
                <FormItem label="后端API参数请求类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='键值对参数表示使用Form表单模式提交,RequestBody一般为JSON格式提交'
                >
                  {getFieldDecorator('webServiceRequestBodyFlag',{initialValue:true})
                  (
                    <RadioGroup>
                      <Radio value={false}>键值对Form参数</Radio>
                      <Radio value={true}>RequestBody字符串参数</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="输入JSON填充方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='选择Json输入参数模板中的数据填充方式'
                >
                  {getFieldDecorator('webServiceRequestXmlFillType',{initialValue:0})
                  (
                    <Select>
                      <Option value={0} >SOAP XML输入自动转为JSON传给后端Restful API</Option>
                      <Option value={1} >使用XML Path取值填充JSON模板</Option>
                      <Option value={2} >使用Velocity模板语法生成JSON</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  label="后端API请求JSON参数"
                  help='${xml2body}表示系统自动转换,自定义取XML节点值:从任意节点开始${//data/userid},从根节点开始${/data/userid},velocity取值用:$xmldoc.selectSingleNode("/xml/data/test").getStringValue(),取全部xml使用${requestBody},自动xml转json使用${jsonBody.//data}'
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.props.form.getFieldValue("webServiceRequestXmlFillType")==0?"none":""}}
                >
                  {getFieldDecorator('webServiceRequestBody',{initialValue:this.getDefaultJson()})
                    (<AceEditor mode='json' width='100%' height='260px'/>)
                  }
                </FormItem>
                <FormItem label="输出XML填充方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='选择XML输出参数模板中的数据填充方式'
                >
                  {getFieldDecorator('webServiceResponseXmlFillType',{initialValue:0})
                  (
                    <Select>
                      <Option value={0} >后端JSON自动转为SOAP XML输出给WebServcie调用端</Option>
                      <Option value={1} >使用Json Path取值填充XML模板</Option>
                      <Option value={2} >使用Velocity模板语法生成XML</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  label="输出XML内容"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.props.form.getFieldValue("webServiceResponseXmlFillType")==0?"none":""}}
                  help='${变量}通过JsonPath取值填充到xml模板中，${body}表示全部json,${xmlbody}表示json自动转为xml'
                >
                  {getFieldDecorator('webServiceResponseBody', {rules: [{ required: false, message: '' }],initialValue:this.getDefaultXml()})
                    (<AceEditor mode='xml' width='100%' height='260px'/>)
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
              </div>
              <div   style={{marginTop:'20px',marginBottom:'20px',display:current===2?'':'none'}}   >
              <Card>
                <Tabs size="large">
                  <TabPane  tab="WSDL文档" key="wsdl"  >
                      <Card title="WSDL描述文档" >
                        <div style={{marginBottom:'5px'}}><Button type="primary" onClick={this.showImportWsdl}>从JSON自动生成WSDL</Button></div>
                        <FormItem
                          labelCol={{ span: 2 }}
                          wrapperCol={{ span: 22 }}
                          help='指定描述WebService的WSDL文档(通过在API后面带上?wsdl来获取wsdl的描述文档)'
                        >
                          {getFieldDecorator('webServiceWsdlDocument', {
                            rules: [{ required: false}],
                            initialValue:'',
                          })
                            (<AceEditor mode='xml' width='100%' height='650px'/>)
                          }
                        </FormItem>
                    </Card>
                   </TabPane>
                  <TabPane  tab="输入参数" key="acl"  >
                    <Card title="示例XML参数配置" >
                      <FormItem
                        label=""
                        labelCol={{ span: 2 }}
                        wrapperCol={{ span: 22 }}
                        help='指定本WebService测试时传入的xml报文'
                      >
                        {getFieldDecorator('requestBodySampleStr', {rules: [{ required: false, message: '' }]})
                          (<AceEditor mode='xml' width='100%' height='460px'/>)
                        }
                      </FormItem>
                    </Card>
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
