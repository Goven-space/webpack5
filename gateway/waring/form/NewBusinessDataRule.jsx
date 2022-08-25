import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon,Row,Col,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AceEditor from '../../../core/components/AceEditor';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';

//新增超时预警规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_WARING.save;
const loadDataUrl=URI.CORE_GATEWAY_WARING.getById;
const ListBeansByInterfaceUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;

class form extends React.Component{
  constructor(props){
    super(props);
    this.waringType=4;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
    this.beanUrl=ListBeansByInterfaceUrl+"?interface=cn.restcloud.gateway.base.IGatewayDataWaring";
    let text="API网关预警:${title}\\n请求URL:${requestUrl}\\n请求用户:${userId}\\n请求时间:${requestTime}\\nIP:${ip}\n业务字段:${key}\\ntraceId:${traceId}";
    this.body={"msgtype":"text","text":{"content":text}};
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.state.formData.condition=`//reqDoc为请求数据,resDoc为响应数据
public int run(Document reqDoc,Document resDoc){
  if(reqDoc.getInteger("count",0)>100){
  	return 1;
  }
  return 0;
}`;
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


      updateCode=(newCode)=>{
        let formData=this.state.formData;
        formData.condition=newCode; //断言代码
      }

      inserDemo2=()=>{
        let code=`//reqDoc为请求数据,resDoc为响应数据
public int run(Document reqDoc,Document resDoc){
  int total=DocumentUtil.getInteger(reqDoc,"total");
  String userId=DocumentUtil.getString(reqDoc,"userId");
  if(total>7 && userId.equals("admin")){
  	return 1;
  }
  return 0;
}`;
        this.props.form.setFieldsValue({"condition":code});
      }

      inserDemo3=()=>{
          let code=`//reqDoc为请求数据,resDoc为响应数据
public int run(Document reqDoc,Document resDoc){
  List<Document> rows=resDoc.getList("rows",Document.class);
  for(Document row:rows){
    PrintUtil.o("获得返回的数据列表:"+row);
    if(row.getString("appId").equals("core")){
  		return 1;
    }
  }
  return 0;
}`;
this.props.form.setFieldsValue({"condition":code});
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
              label="预警间隔(秒)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='在同一服务器上相同API在间隔时间内不重复计算和发送预警消息,0表示不限定'
            >{
              getFieldDecorator('intervalTime',{rules: [{ required: true}],initialValue:300})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="事件接收API"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="预警消息内容将通过API POST方式发送,用http://开头则表示外部API接收"
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
          <TabPane  tab="数据检测条件" key="dataRule"   >
            <FormItem
              label="绑定过滤插件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help="绑定一个数据检测预警插件实,插件必须继承IGatewayDataWaring接口(绑定插件后脚本将失效)"
            >{
              getFieldDecorator('filtersBeanId')
              (<AjaxSelect url={this.beanUrl} valueId='beanId' textId="beanName" defaultData={{"beanName":'无',"beanId":''}} />)
              }
            </FormItem>

            <FormItem
            label="检测逻辑:"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help={<span>
              返回1表示检测成立0表示不成立(标准JAVA语法):
              <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>数据检测示例1</a> <Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>数据检测示例2</a>
                 </span>}
          >
            {getFieldDecorator('condition', {
              rules: [{ required: false, message: '' }],
            })(<AceEditor
              mode='java'
              width='100%'
              height='300px'
            />)}
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
