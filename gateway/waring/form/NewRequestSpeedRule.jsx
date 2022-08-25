import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AceEditor from '../../../core/components/AceEditor';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';

//新增预警规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_WARING.save;
const loadDataUrl=URI.CORE_GATEWAY_WARING.getById;
const LIST_SECURITY_URL=URI.CORE_GATEWAY_SECURITY.listForSelect;

class form extends React.Component{
  constructor(props){
    super(props);
    this.waringType=3;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
    this.securityUrl=LIST_SECURITY_URL+"?securityType=4";
    let text="API网关预警:${title}\\n请求URL:${requestUrl}\\n请求用户:${userId}\\n请求时间:${requestTime}\\nIP:${ip}\n备注:${remark}\\ntraceId:${traceId}";
    this.body={"msgtype":"text","text":{"content":text}};
    this.state={
      mask:true,
      formData:{},
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
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.waringType=this.waringType;
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
          <TabPane  tab="预警规则基本属性" key="props"  >
            <FormItem
              label="规则名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('waringName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="速率维度"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要进行速率预警的维度'
            >{
              getFieldDecorator('condition',{rules: [{ required: true}],initialValue:"ip"})
              (<RadioGroup>
                  <Radio value="ip">同一IP</Radio>
                  <Radio value="userId">同一用户</Radio>
                  <Radio value="requestUrl">同一API</Radio>
                  <Radio value="second">每秒QPS</Radio>
                </RadioGroup>
              )
              }
            </FormItem>
            <FormItem
              label="总请求次数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("condition")==='second'?'none':''}}
              help='指定所有API累计总请求次数范围1-10000,可以用api.reqeuest.queue.max.all设定最大值'
            >{
              getFieldDecorator('totalRequestCount',{rules: [{ required: true}],initialValue:6000})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="累计次数达到"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定在总请求次数中累计达到多少次后发送预警消息'
            >{
              getFieldDecorator('thresholdCount',{rules: [{ required: true}],initialValue:1000})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="预警间隔(秒)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='在同一服务器上相同API在间隔时间内不重复发送预警消息,可避免同时收到大量消息,0表示不限定'
            >{
              getFieldDecorator('intervalTime',{rules: [{ required: true}],initialValue:300})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="事件接收API"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="预警消息内容将通过API POST方式发送,用http://开头则表示外部API接收,空表示不触发API"
            >{
              getFieldDecorator('apiUrl',{initialValue:''})
              (
                <Input />
              )
            }
            </FormItem>
            <FormItem
              label="消息内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='发送消息的内容建议JSON格式'
            >
              {getFieldDecorator('body', {rules: [{ required: true}],initialValue:AjaxUtils.formatJson(JSON.stringify(this.body))})
                (<AceEditor mode='json' width='100%' height='200px'/>)
              }
            </FormItem>
            <FormItem
              label="自动加入黑名单"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='触发本预警规则后自动把用户的IP加入黑名单中'
            >{
              getFieldDecorator('addToBlackIP',{initialValue:"N"})
              (            <RadioGroup>
                            <Radio value="N">否</Radio>
                            <Radio value="Y">是</Radio>
                          </RadioGroup>)
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
