import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,Modal,Tag,Icon,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TagsSelect from '../../components/FormComponents/TagsSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//新增websocket api

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const businessAreaTreeUrl=URI.CORE_BusinessDomain.treeOptData;
const backendServicesUrl=URI.CORE_GATEWAY_SERVICES.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.categoryId=this.props.categoryId;
    this.state={
      mask:true,
      formData:{},
      visible:false,
      action:'',
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
            if(data.state==='4'){this.setState({mockDisplay:''});}
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
          let pos=postData.mapUrl.lastIndexOf("/");
          if(postData.mapUrl.substring(0,pos+1)!=='/websocket/'){
            AjaxUtils.showError("WebSocket的公开URL必须以/websocket/开头，且只支持一层目录!");
            return;
          }
          postData=Object.assign({},this.state.formData,postData);
          postData.configType='WEBSOCKET'; //标记为websocket
          postData.appId=this.appId;
          postData.requestBodyFlag=true;
          postData.registerFlag=1;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'WS'})
        (<Select style={{width:70}} >
              <Option value="WS">WS</Option>
      </Select>)
      );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="API分类"
          {...formItemLayout4_16}
          help='指定本API所属的分类(可以在应用中的API分类中进行管理)'
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
          label="公开Websocket URI"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='公开的websocket uri必以/websocket/根路径开头且只支持一层目录'
        >
          {
            getFieldDecorator('mapUrl', {
              rules: [{ required: true, message: 'Please input the service url!' }],
              initialValue:'/websocket/testws',
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
            (<Input placeholder="服务Id" />)
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
          label="后端WebSocket URL"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='如果绑定了后端服务则不用重复指定主机名直接填写/path即可，如果未绑定则需指定全路径URL如:http://ip/api 支持微服务实例名http://serviceName/api多个时用逗号分隔或换行,
          可用${变量}获取传入参数作为URL的组成部分如http://ip/${appid}/${appkey} 使用${$config.变量id}可获取配置变量'
        >
          {
            getFieldDecorator('backendUrl', {
              rules: [{ required: true}],
              initialValue:'ws://${$config.server}/ws',
            })
            (<Input.TextArea autoSize  />)
          }
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
          style={{display:this.props.form.getFieldValue("state")=='4'?'':'none'}}
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

export default Form.create()(form);
