import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import TableRelationshipConfig from './TableRelationshipConfig';

//新增路由规则
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.ETL.CONFIG.getById;
const SubmitUrl=URI.ETL.CONFIG.save; //存盘地址
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const SelectProcessUrl=URI.ETL.CONFIG.selectProcess;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.modelId=this.props.modelId;
    this.applicationId=this.props.applicationId;
    this.userId=AjaxUtils.getCookie("userId");
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.applicationId+".processCategory&rootName=流程分类";
    this.SelectSubProcessUrl=SelectProcessUrl+"?applicationId="+this.applicationId;
    this.state={
      mask:false,
      beanModels:[],
      filtersBeans:[],
      formData:{relationshipColumns:'[]'},
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
          if(data.eventType){
            data.eventType=data.eventType.split(",");
          }
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
					const relationshipData = this.refs.tableRelationshipConfig?this.refs.tableRelationshipConfig.getData():[]
					if(relationshipData&&relationshipData.length){
						if(this.checkData(relationshipData)){
							AjaxUtils.showError('血缘关系的源数据库表及目标数据库表为必填项，请填写完整！')
							return
						}
					}
          try{postData.relationshipColumns=JSON.stringify(this.refs.tableRelationshipConfig.getData());}catch(e){}
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

	checkData = (arr=[]) => {
		return arr.some(item => {
			if(!item.srcTableName || !item.targetTableName){
				return true
			}
		})
	}

  formatTestParamsJsonStr=()=>{
    let value=this.props.form.getFieldValue("testParams");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"testParams":value.trim()});
  }

  formatEventBodyJsonStr=()=>{
    let value=this.props.form.getFieldValue("eventBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"eventBody":value.trim()});
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
                    <Radio value='2'>手动触发</Radio>
                    <Radio value='1'>定时自动调度</Radio>
                    <Radio value='3'>依赖上级流程</Radio>
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
                label="任务调度模式"
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
                  </AutoComplete>)
                }
              </FormItem>
              <FormItem
                label="指定依赖流程"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="请选择一个要依赖的上级流程,上级流程执行成后立即启动本流程,上级流程失败时不会执行本流程"
                style={{display:this.props.form.getFieldValue("state")==='3'?'':'none'}}
              >
                {
                  getFieldDecorator('parentProcessId',{rules: [{ required: false}],initialValue:''})
                  (<TreeNodeSelect url={this.SelectSubProcessUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
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
                    <Radio value={2}>SQL级别调试跟踪</Radio>
                    <Radio value={3}>单步调试</Radio>
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
                  <Select mode='tags' >
                    <Option value='0'>不触发</Option>
                    <Option value='1'>流程结束后</Option>
                    <Option value='2'>流程运行失败时</Option>
                    <Option value='3'>任意节点断言失败时</Option>
                    <Option value='4'>有部分数据传输失败时</Option>
                    <Option value='5'>上一任务还没有结束时</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="API URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定一个接收消息的API地址,系统将以POST application/json;chartset=utf-8的方式调用,支持获取配置${$config.变量}获取'
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
                (<Input.TextArea autoSize style={{minHeight:'160px'}} onClick={this.formatEventBodyJsonStr} />)
                }
              </FormItem>
            </TabPane>
            <TabPane  tab="重跑设置" key="Compensate"  >
              <FormItem label="失败重跑" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='指定在流程失败时是否进行重跑，断点处重跑只适用于关系数据库且必须是分页读取的情况下'
              >
                {getFieldDecorator('compensateFlag',{initialValue:0})
                (
                  <Select>
                    <Option value={0}>否(不重跑)</Option>
                    <Option value={1}>失败后重开始节点重跑实例</Option>
                    <Option value={3}>失败后从出错节点开始重跑</Option>
                    <Option value={2}>失败后启动一个新的任务</Option>
                    <Option value={4}>失败后立即在任务队列中创建一个新的任务</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="最大重跑次数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(this.props.form.getFieldValue("compensateFlag")===1 || this.props.form.getFieldValue("compensateFlag")===3)?'':'none'}}
                help='重跑失败后可以偿试的最大次数'
              >{
                getFieldDecorator('maxReRunCount',{rules: [{ required: false}],initialValue:1})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="间隔时间(秒)"
                style={{display:(this.props.form.getFieldValue("compensateFlag")===0 || this.props.form.getFieldValue("compensateFlag")===4)?'none':''}}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定失败后每次重跑的间隔时间'
              >{
                getFieldDecorator('compensateRule',{initialValue:'300'})
                (<InputNumber min={10}  />)
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
              <FormItem label="流程运行记录" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='是否记录流程的运行历史数据，如果不记录则不会生成流程的运行历史日志'
              >
                {getFieldDecorator('processTransaction',{initialValue:1})
                (
                  <RadioGroup>
                    <Radio value={1}>保存</Radio>
                    <Radio value={0}>不保存</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="最大并发数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定流程的最大可同时运行的数量,0表示不限制1表示不允许同时并行运行本流程,其他数字表示最大并发数'
              >{
                getFieldDecorator('maxRunProcess',{rules: [{ required: false}],initialValue:1})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="最大循环次数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定流程循环执行时可以最大执行的节点次数,0表示不限制'
              >{
                getFieldDecorator('maxNodeCount',{rules: [{ required: false}],initialValue:20000})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="最大内存使用率"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定本最大内存使用率(0表示不限制)，当系统内存达到最大值时禁止启动本流程，如果正在读取数据时停止读取(仅对关系数库生效)'
              >{
                getFieldDecorator('maxMemoryUseRate',{rules: [{ required: false}],initialValue:80})
                (<InputNumber min={0}  />)
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
            <TabPane  tab="血缘配置" key="relationship"  >
                <TableRelationshipConfig  relationshipColumns={this.state.formData.relationshipColumns} applicationId={this.applicationId} form={this.props.form} ref="tableRelationshipConfig" />
            </TabPane>
            <TabPane  tab="默认参数" key="testparams"  >
              <FormItem
                label="入参JSON"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help={<span>在手动运行或者在任务运行时作为默认的全局变量参数传入任务中,<a onClick={this.formatTestParamsJsonStr} >格式化JSON</a>{' '}</span>}
              >{
                getFieldDecorator('testParams',{rules: [{ required: false}]})
                (<Input.TextArea autoSize style={{minHeight:'160px'}} />)
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
