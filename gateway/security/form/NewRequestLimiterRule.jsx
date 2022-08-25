import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import NewRequestLimiterRule_dimension from './NewRequestLimiterRule_dimension';

//新增限流规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;
const timeReg = /^((20|21|22|23|[0-1]?\d):[0-5]\d(,(20|21|22|23|[0-1]?\d):[0-5]\d){0,})?$/g///^((20|21|22|23|[0-1]\d):[0-5]\d,?){0,}$/g; //调用时段规则  

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=4;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      mask:true,
      formData:{dimensionConfigs:'[]'},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.qpsUserId!==undefined && data.qpsUserId!==null && data.qpsUserId!==''){
              data.qpsUserId=data.qpsUserId.split(",");
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
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.securityType=this.securityType;
          postData.dimensionConfigs=this.getDimensionConfigs();
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功，可在规则前面的+号中设定作用范围!");
                this.props.close(true);
              }
          });
      }
    });
  }

  getDimensionConfigs=()=>{
    if(this.refs.NewRequestLimiterRule_dimension){
      return JSON.stringify(this.refs.NewRequestLimiterRule_dimension.getData());
    }else{
      return this.state.formData.dimensionConfigs;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const dimensionConfigsJson=JSON.parse(this.state.formData.dimensionConfigs);

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="基本属性" key="props"  >
            <FormItem
              label="规则名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('configName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="状态码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='拒绝时返回的HTTP状态码'
            >{
              getFieldDecorator('responseCode',{rules: [{ required: true}],initialValue:500})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='当有多个规则匹配到时，数字越小越优先,其他规则将失效!'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:100})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="绑定用户"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本规则适用的用户,空表示所有用户,只能选择用户Id不能选择部门'
            >{
              getFieldDecorator('qpsUserId',{rules: [{ required: false}],initialValue:""})
                (<UserAsynTreeSelect options={{treeCheckable:true}} />)
              }
            </FormItem>
            <FormItem
              label="绑定服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='绑定服务器后只有在指定的服务器上本规则才生效!'
            >{
              getFieldDecorator('bindingServerId')
              (<ListClusterServers options={{showSearch:true}} />)
            }
            </FormItem>
            <FormItem
              label="状态"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('state',{initialValue:"Y"})
              (            <RadioGroup>
                            <Radio value="Y">启用</Radio>
                            <Radio value="N">停用</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  autosize />)
              }
            </FormItem>
            <FormItem
              label="唯一Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{this.state.formData.id}
            </FormItem>
          </TabPane>
          <TabPane  tab="每秒并发限制" key="qps"  >
            <FormItem
              label="每秒最大QPS"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='设定每秒最大QPS请求数,0表示不限制'
            >{
              getFieldDecorator('maxqps',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="总QPS阀值"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='当本系统总QPS达到预定速率时，本规则自动降速到最小QPS值,0表示不限制'
            >{
              getFieldDecorator('totalqps',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="每秒最小QPS"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='当总QPS阀值满足条件时本规则自动降速到最小QPS数,可实现动态自动降速'
            >{
              getFieldDecorator('minqps',{rules: [{ required: true}],initialValue:1})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="超速选项"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择超过最大限速后系统的处理策略'
            >{
              getFieldDecorator('acquire',{initialValue:false})
              (            <RadioGroup>
                            <Radio value={false}>快速返回提示</Radio>
                            <Radio value={true}>进入等待队列</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='超过QPS时的提示消息'
            >{
              getFieldDecorator('message',{rules: [{ required: true}],initialValue:"系统正忙，请稍后再试!"})
              (<Input.TextArea  autosize  />)
              }
            </FormItem>
            <FormItem
              label="QPS分配策略"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              <NewRequestLimiterRule_dimension ref='NewRequestLimiterRule_dimension' dimensionConfigs={dimensionConfigsJson} />
            </FormItem>
          </TabPane>
          <TabPane  tab="调用次数限制" key="number"  >
            <FormItem
              label="时间单位"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择在一个时间单位内用户可以调用API的最大次数'
            >{
              getFieldDecorator('maxCountUnit',{initialValue:"yyyyMMdd"})
              (            <RadioGroup>
                            <Radio value="yyyyMM">每月</Radio>
                            <Radio value="yyyyMMdd">每日</Radio>
                            <Radio value="yyyyMMddHH">每小时</Radio>
                            <Radio value="yyyyMMddHHmm">每分钟</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="最大调用次数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='表示适用本规则的每一个API的最大调用次数,0表示不限制'
            >{
              getFieldDecorator('maxcount',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='超过最大调用数的提示消息'
            >{
              getFieldDecorator('maxCountMessage',{rules: [{ required: true}],initialValue:"您对本API的请求已达最大调用次数!"})
              (<Input.TextArea  autosize  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="最大链接数限制" key="connect"  >
            <FormItem
              label="超过链接数后"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='针对每一个API超过最大链接数后网关是否拒绝后面API的请求'
            >{
              getFieldDecorator('maxConnectInterruptType',{initialValue:0})
              (            <RadioGroup>
                            <Radio value={0}>拒绝</Radio>
                            <Radio value={1}>自动降速</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="最大链接数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='表示每个API可以同时链接到后端API的最大链接数(API耗时越久需要同时链接的后端API数就越大)'
            >{
              getFieldDecorator('maxApiConnectCount',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="降速(每秒qps)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("maxConnectInterruptType")===1?'':'none'}}
              help='超过最大链接数后系统自动把API的并发数降级，当链接数下降后自动恢复速度'
            >{
              getFieldDecorator('maxApiConnectMinQps',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='超过最大链接数的提示消息'
            >{
              getFieldDecorator('maxApiConnectCountMessage',{rules: [{ required: true}],initialValue:"本API已超过最大链接数!"})
              (<Input.TextArea  autosize  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="调用时段限制" key="datetime"  >
            <FormItem
              label="开始时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='可以调用的开始时间如(08:30),空表示不限制,多个用逗号分隔'
            >{
              getFieldDecorator('startDate',{rules: [{ required: false},{pattern:timeReg}],initialValue:''})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="结束时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='可以调用的结束时间如(12:00),空表示不限制,多个用逗号分隔与开始时间一一对应'
            >{
              getFieldDecorator('endDate',{rules: [{ required: false},{pattern:timeReg}],initialValue:''})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='不在时间段内的提示消息'
            >{
              getFieldDecorator('dateMessage',{rules: [{ required: true}],initialValue:"此时间段内禁止调用此API!"})
              (<Input.TextArea  autosize  />)
              }
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
