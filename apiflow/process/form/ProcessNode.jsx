import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import AceEditor from '../../../core/components/AceEditor';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//新增路由规则
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.ESB.CORE_ESB_CONFIG.getById;
const SubmitUrl=URI.ESB.CORE_ESB_CONFIG.save; //存盘地址
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
          postData.pNodeId='Process';
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="基本属性" key="props"  >
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
              <FormItem label="运行方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                {getFieldDecorator('state',{initialValue:'2'})
                (
                  <RadioGroup>
                    <Radio value='2'>需发布为API</Radio>
                    <Radio value='1'>定时自动调度</Radio>
                    <Radio value='0'>禁用</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="调度策略"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("state")==='1'?'':'none'}}
                help='注意:如果修改调度时间则必须要在所有集群服务器中重新启停本任务才能生效!'
              >
                {
                  getFieldDecorator('expression', {rules: [{ required: false}]})
                  (<AjaxSelect url={schedulerSelectUrl}  options={{showSearch:true,multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
                }
              </FormItem>
              <FormItem
                label="流程调度模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("state")==='1'?'':'none'}}
                help='集群时指定任务可运行的服务器,可以填写ServerId或IP来指定可运行的服务器多个用逗号分隔'
              >{
                getFieldDecorator('executeServer')
                (<AutoComplete  >
                    <Option value="Task">任务队列领取模式(推荐)</Option>
                    <Option value="AllServer">所有集群服务器均可同时运行</Option>
                    <Option value="SingleServer">只有主服务器可运行(主服务器失败时其他服务器接管)</Option>
                    <Option value="Dispatcher">由调度服务器统一调度</Option>
                    <Option value="random">所有集群服务器依次执行</Option>
                  </AutoComplete>)
                }
              </FormItem>
              <FormItem
                label="任务重要性"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='在任务队列模式下可以根据任务重要性来领取任务(10为最高)'
              >{
                getFieldDecorator('taskLevel',{initialValue:1})
                (<InputNumber min={1} max={10}  />)
                }
              </FormItem>
              <FormItem label="任务选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("executeServer")==='Task'?'':'none'}}
                help='如果任务还没有被执行完时是否重复生成任务?'
              >
                {getFieldDecorator('repeatGenerationTask',{initialValue:"1"})
                (
                  <RadioGroup>
                    <Radio value="1">始终生成</Radio>
                    <Radio value="0">不重复产生任务</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="调试模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='开启调试模式系统会输出详细的数据获取及校验等跟踪信息'
              >
                {getFieldDecorator('debug',{initialValue:1})
                (
                  <RadioGroup>
                    <Radio value={0}>否</Radio>
                    <Radio value={1}>流程级别调试跟踪</Radio>
                    <Radio value={2}>API级别调试跟踪</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </TabPane>
            <TabPane  tab="事件设置" key="message"  >
              <FormItem label="触发API事件" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='设定在流程结束时是否发送提醒消息或触发一个API'
              >
                {getFieldDecorator('eventType',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>不触发</Radio>
                    <Radio value='1'>流程结束后</Radio>
                    <Radio value='2'>流程运行失败时</Radio>
                    <Radio value='3'>任意节点断言失败时</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="API URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定一个接收消息的API地址,系统将以POST application/json;chartset=utf-8的方式调用可以发送邮件，钉钉消息等.'
              >{
                getFieldDecorator('eventUrl',{rules: [{ required: true}]})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="内容"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='使用${变量}可以获取变量值'

              >{
                getFieldDecorator('eventBody',{rules: [{ required: true}]})
                (<AceEditor mode='json' width='100%' height='300px'/>)
                }
              </FormItem>
            </TabPane>
            <TabPane  tab="更多属性" key="more"  >
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
              <FormItem label="实例持久化" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='流程实例持久化可支持流程及节点补偿功能，不持久化则不支持补偿功能但性能更好'
              >
                {getFieldDecorator('processTransaction',{initialValue:1})
                (
                  <RadioGroup>
                    <Radio value={1}>实时持久化</Radio>
                    <Radio value={2}>异步持久化</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="数据库事务" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='通过事件对数据库进行操作时是否支持事务'
              >
                {getFieldDecorator('transaction',{initialValue:true})
                (
                  <RadioGroup>
                    <Radio value={true}>支持</Radio>
                    <Radio value={false}>不支持</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="最大并发数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定流程的最大可同时运行的数量,0表示不限制1表示不允许同时并行运行本流程,其他数字表示最大并发数'
              >{
                getFieldDecorator('maxRunProcess',{rules: [{ required: false}],initialValue:0})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem label="并发数选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='最大并发数控制时是否把待补偿流程计算在内'
              >
                {getFieldDecorator('maxRunProcessOption',{initialValue:"0"})
                (
                  <RadioGroup>
                    <Radio value="0">不计算待补偿流程</Radio>
                    <Radio value="1">计算待补偿流程</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="补偿规则(分钟)"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定节点断言失败后的补偿策略指定每次补偿的间隔时间(多个用逗号分隔),所有指定时间均失败则停止补偿'
              >{
                getFieldDecorator('compensateRule',{initialValue:'5,15,30,60,120'})
                (<Input />)
                }
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
                label="备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('remark')
                (<Input.TextArea autosize />)
                }
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
