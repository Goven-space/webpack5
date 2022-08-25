import React from 'react';
import { Form, Input, Button, Spin,Icon,Col,Row,Select,AutoComplete,Tabs,Radio,InputNumber} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxSelect from '../../../../core/components/AjaxSelect';

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.ETL.DATAQUALITY_PROCESSSTATUS.getById;
const saveDataUrl=URI.ETL.DATAQUALITY_PROCESSSTATUS.save;
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;
const SelectProcessUrl=URI.ETL.CONFIG.selectProcess;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.SelectSubProcessUrl=SelectProcessUrl+"?applicationId="+this.applicationId;
    this.state={
      mask:false,
      basePath:'',
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        let jsonStr='{\n"msgtype": "text",\n"text": {\n"content": "\n流程超时预警:${ruleName}\n监测结果:${remark}\n"}}'
        this.state.formData.eventBody=jsonStr;
        this.state.formData.state='1';
        this.state.formData.checkType='1';
        this.state.formData.timenumber='360';
        FormUtils.setFormFieldValues(this.props.form,this.state.formData);
    }else{
      this.setState({mask:true});
      //载入表单数据
      let url=loadDataUrl+"?id="+id;
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


  onSubmit = () => {
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
          postData.applicationId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                this.props.close(true);
              }
          });
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}  >
        <Tabs size="large">
          <TabPane  tab="规则配置" key="props"  >
            <FormItem  label="规则名称"  help='数据量对比描述' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
              {
                getFieldDecorator('ruleName',{rules: [{ required: true}]})
                (<Input  />)
              }
            </FormItem>
            <FormItem label="检测类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('checkType',{rules: [{ required: true}],initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>流程运行超过指定时间</Radio>
                  <Radio value='2'>流程调度间隔大于指定时间</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="超时时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='时间单位为秒'
            >{
              getFieldDecorator('timenumber',{rules: [{ required: true}],initialValue:"0"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="检测时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择本数据监测规则执行的时间点'
            >
              {
                getFieldDecorator('expression', {rules: [{ required: true}]})
                (<AjaxSelect  url={schedulerSelectUrl}  options={{showSearch:true,multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
              }
            </FormItem>
            <FormItem
              label="运行服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='集群时指定任务可运行的服务器,可以填写ServerId或IP来指定可运行的服务器多个用逗号分隔'
            >{
              getFieldDecorator('executeServer')
              (<AutoComplete  >
                  <Option value="AllServer">所有集群服务器均可同时运行</Option>
                  <Option value="SingleServer">只有主服务器可运行(主服务器失败时其他服务器接管)</Option>
                </AutoComplete>)
              }
            </FormItem>
            <FormItem
              label="指定检测流程"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请选择要检测的流程"
            >
              {
                getFieldDecorator('processIds',{rules: [{ required: true}],initialValue:''})
                (<TreeNodeSelect url={this.SelectSubProcessUrl} options={{showSearch:true,multiple:true,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('state',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>启用</Radio>
                  <Radio value='0'>停用</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem  label="备注"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
              {
                getFieldDecorator('remark',{
                 rules: [{ required: false,message:'文件夹备注'}],
                })
                (<Input  />)
              }
            </FormItem>
        </TabPane>
        <TabPane  tab="告警设置" key="acl"  >
          <FormItem label="发送通知" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
            help='设定在对比结束后是否发送提醒消息'
          >
            {getFieldDecorator('eventType',{initialValue:'0'})
            (
              <Select>
                <Option value='0'>不发送通知</Option>
                <Option value='2'>检测到超时流程时发送通知</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            label="API URL"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='指定一个接收消息的API地址,系统将以POST application/json;chartset=utf-8的方式调用可以发送邮件，钉钉消息等.'
          >{
            getFieldDecorator('eventUrl',{rules: [{ required: false}]})
            (<Input  />)
            }
          </FormItem>
          <FormItem
            label="内容"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='使用${变量}可以获取变量值'
          >{
            getFieldDecorator('eventBody',{rules: [{ required: false}]})
            (<Input.TextArea autoSize style={{minHeight:'160px'}} />)
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
