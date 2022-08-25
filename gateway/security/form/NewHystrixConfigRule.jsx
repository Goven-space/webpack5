import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//新增熔断配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=8;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"commandKey",this.appId,"HY");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="熔断规则基本属性" key="props"  >
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
              label="配置Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='在多个规则中相同的Id会被隔离在同一个保护策略中(建议填写应用appId即按应用进行隔离)'
            >{
              getFieldDecorator('commandKey',{rules: [{ required: false}],initialValue:""})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="Hystrix保护模式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('executionIsolationStrategy',{initialValue:false})
              (<RadioGroup>
                  <Radio value={false}>信号量隔离模式(推荐)</Radio>
                  <Radio value={true}>线程隔离模式</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="执行超时时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='执行超时时间(默认30秒)单位毫秒,建议与基本属性中的服务调用超时时间保持一至或取更小值'
            >{
              getFieldDecorator('executionTimeoutInMilliseconds',{rules: [{ required: true}],initialValue:"30000"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="线程池大小"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("executionIsolationStrategy")?'':'none'}}
              help='线程隔离模式下的线程池大小(默认值10个)'
            >{
              getFieldDecorator('threadPoolCoreSize',{rules: [{ required: true}],initialValue:"10"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="信号量隔离最大并发"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("executionIsolationStrategy")?'none':''}}
              help='使用信号量隔离时的最大并发数(默认10)'
            >{
              getFieldDecorator('executionIsolationSemaphoreMaxConcurrentRequests',{rules: [{ required: true}],initialValue:"10"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="熔断器开启阀值"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='达到一定的请求量后熔断器才能开始工作(默认20个请求,测试时可设为1)'
            >{
              getFieldDecorator('circuitBreakerRequestVolumeThreshold',{rules: [{ required: true}],initialValue:"20"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="出错百分比阈值"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='默认:50,表示当出错率超过50%后熔断器启动'
            >{
              getFieldDecorator('circuitBreakerErrorThresholdPercentage',{rules: [{ required: true}],initialValue:"50"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="熔断器工作时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='熔断器中断60秒后会进入半打开状态,部分流量可通过重试(毫秒)'
            >{
              getFieldDecorator('circuitBreakerSleepWindowInMilliseconds',{rules: [{ required: true}],initialValue:"60000"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='数字越小越先执行,如果检测不通过则不再检测后续规则'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:100})
              (<InputNumber min={1} />)
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
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='熔断后的提示消息'
            >{
              getFieldDecorator('message',{rules: [{ required: true}],initialValue:"此API已被熔断,请稍后再试!"})
              (<Input.TextArea  autosize  />)
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
