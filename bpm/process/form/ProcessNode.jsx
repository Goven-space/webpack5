import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import FieldItemConfig from './components/FieldItemConfig';

//新增路由规则
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.BPM.CORE_BPM_CONFIG.getById;
const SubmitUrl=URI.BPM.CORE_BPM_CONFIG.save; //存盘地址
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.modelId=this.props.modelId;
    this.userId=AjaxUtils.getUserId();
    this.applicationId=this.props.applicationId;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.applicationId+".processCategory&rootName=流程分类";
    this.state={
      mask:false,
      beanModels:[],
      filtersBeans:[],
      formData:{},
    };
  }

  componentDidMount(){
    if(this.props.id!==''){
      this.loadData();
    }
  }

  loadData=()=>{
    let url=GetById.replace("{id}",this.id);
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          data.processOwners=(data.processOwners||this.userId).split(",");
          data.processStartUserIds=(data.processStartUserIds||'').split(",");
          this.setState({formData:data,sourceType:data.sourceType,targetType:data.targetType});
          FormUtils.setFormFieldValues(this.props.form,data);
        }
    });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          postData.pNodeId='process';
          postData.fieldConfigs=this.getFieldConfigs();
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true);
                }
              }
          });
      }
    });
  }


  //获得字段配置
  getFieldConfigs = () => {
    if (this.refs.FieldItemConfig) {
      return JSON.stringify(this.refs.FieldItemConfig.getData());
    } else {
      return this.state.formData.fieldConfigs;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let fieldConfigs=this.state.formData.fieldConfigs||"[]";
    if(fieldConfigs==''){fieldConfigs="[]";}
    fieldConfigs =JSON.parse(fieldConfigs);

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="基本属性" key="props"  >
              <FormItem
                label="所属分类"
                {...formItemLayout4_16}
                help='指定本服务所属的分类或功能点(可以在应用中的服务分类中进行分类定义)'
              >
                {
                  getFieldDecorator('categoryId',
                    {
                      rules: [{ required: true}],
                      initialValue:this.categoryId
                    }
                  )
                  (<TreeNodeSelect defaultData={[{title:'缺省分类',value:'all'}]}  url={this.categoryUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
                }
              </FormItem>
              <FormItem
                label="流程名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本流程的说明"
              >
                {
                  getFieldDecorator('configName', {
                    rules: [{ required: true}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="流程Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="系统自动产生"
              >
                {
                  getFieldDecorator('processId', {
                    rules: [{ required: true}]
                  })
                  (<Input disabled={true} />)
                }
              </FormItem>
              <FormItem
                label="流程编号"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定流程的唯一编号,所有传输日记数据将以此id作为表名存储"
              >
                {
                  getFieldDecorator('configId', {
                    rules: [{ required: true}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="流程管理员"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="流程管理员可以查看所有办理中的单据,超时时会收到告警通知"
              >
                {getFieldDecorator('processOwners',{initialValue:this.userId})
                  (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                }
              </FormItem>
              <FormItem
                label="流程启动者"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="可以发起本流程的用户,空表示所有用户均可启动"
              >
                {getFieldDecorator('processStartUserIds')
                  (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                }
              </FormItem>
              <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                {getFieldDecorator('state',{initialValue:'2'})
                (
                  <RadioGroup>
                    <Radio value='1'>启用</Radio>
                    <Radio value='2'>发布</Radio>
                    <Radio value='0'>禁用</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="版本"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('version')
                (<Input />)
                }
              </FormItem>
              <FormItem
                label="流程说明"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('remark')
                (<Input.TextArea autosize />)
                }
              </FormItem>
            </TabPane>
            <TabPane  tab="表单设置" key="formConfig"  >
            <FormItem
              label="PC端表单ID"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('pcFormId')
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="移动端表单ID"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('mobileFormId')
              (<Input  />)
              }
            </FormItem>
            </TabPane>
            <TabPane  tab="字段设置" key="fieldConfig"  >
              <FieldItemConfig  ref='FieldItemConfig' fieldConfigs={fieldConfigs} nodeId={this.nodeId} processId={this.processId} applicationId={this.applicationId}  />
            </TabPane>
            <TabPane  tab="办理时限" key="timeConfig"  >
              <FormItem
                label="限制完成时间(小时)"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='必须在限制时间内完成处理，从流程启动开始'
              >{
                getFieldDecorator('exceedTime',{rules: [{ required: true}],initialValue:"48"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="提前告警时间(分钟)"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定提前多少分钟之前进行告警,告警消息将发给流程管理员'
              >{
                getFieldDecorator('tirstTriggerTime',{rules: [{ required: true}],initialValue:"30"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="最大告警次数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定最大告警次数'
              >{
                getFieldDecorator('maxTriggerCount',{rules: [{ required: true}],initialValue:"3"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem label="告警方式" help='指定告警通知的方式' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                {getFieldDecorator('warningType',{initialValue:'SendMail'})
                (
                  <Select  >
                    <Option value='SendMail'>邮件</Option>
                    <Option value='SendSms'>手机短信</Option>
                    <Option value='SendDingDing'>发送钉钉消息</Option>
                    <Option value='SendWeiXin'>发送企业微信消息</Option>
                  </Select>
                )}
              </FormItem>
            </TabPane>
          </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
              保存
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
