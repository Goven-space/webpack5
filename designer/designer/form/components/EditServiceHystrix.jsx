import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber} from 'antd';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

const FormItem = Form.Item;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    if(this.id===undefined || this.id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',this.id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.hystrixCommand===undefined){data.hystrixCommand=false;}
            if(data.hystrixCommand===undefined){data.hystrixCommand=false;}
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
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
          // postData=Object.assign({},this.state.formData,postData); 这里不能合并
          postData.id=this.id; //API的唯一id
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
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
      <Form onSubmit={this.onSubmit}  >
        <FormItem
          label="启用Hystrix保护"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='是表示启用Hystrix进行服务保护或降级功能,只有本服务需要调用外部API或者执行较长的业务逻辑时才建议开启'
        >{
          getFieldDecorator('hystrixCommand',{initialValue:false})
          (<RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="配置Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='在多个API中相同的Id会被隔离在同一个保护策略中'
        >{
          getFieldDecorator('commandKey',{rules: [{ required: false}],initialValue:""})
          (<Input  />)
          }
        </FormItem>
        <FormItem
          label="执行超时时间"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='执行超时时间(默认30秒)单位毫秒,建议根据执行的业务逻辑时间长度来进行设置'
        >{
          getFieldDecorator('executionTimeoutInMilliseconds',{rules: [{ required: true}],initialValue:"30000"})
          (<InputNumber min={0} />)
          }
        </FormItem>
        <FormItem
          label="最大并发数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
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
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button onClick={this.onSubmit} type="primary"  >
            保存配置
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
