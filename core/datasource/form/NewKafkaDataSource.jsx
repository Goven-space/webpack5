import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';
import AceEditor from '../../../core/components/AceEditor';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_DATASOURCE.getById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_DATASOURCE.save; //存盘地址
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.categoryId=this.props.categoryId;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.appId+".dataSourceCategory&rootName=数据源分类";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){return;}
      let url=GetById.replace("{id}",this.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = (closeFlag,testConn='') => {
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
          postData.testConn=testConn;
          postData.configType='Kafka';
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                if(closeFlag){
                  this.props.close(true);
                }
              }
          });
      }
    });
  }


  insertProducer=()=>{
//         let code=`bootstrap.servers=127.0.0.1:9092
// max.block.ms=30000
// ssl.truststore.location=
// java.security.auth.login.config=
// ssl.truststore.password=KafkaOnsClient
// security.protocol=SASL_SSL
// sasl.mechanism=PLAIN
// key.serializer=org.apache.kafka.common.serialization.StringSerializer
// value.serializer=org.apache.kafka.common.serialization.StringSerializer`;
    let code = 
    `bootstrap.servers=192.168.1.22:9092
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=org.apache.kafka.common.serialization.StringSerializer`
      this.props.form.setFieldsValue({props:code})
      this.state.formData.props=code;
    }

  insertConsumer=()=>{
//           let code=`bootstrap.servers=127.0.0.1:9092
// ssl.truststore.location=/kafka.client.truststore.jks
// ssl.truststore.password=KafkaOnsClient
// security.protocol=SASL_SSL
// sasl.mechanism=PLAIN
// session.timeout.ms=25000
// max.poll.records=30
// key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
// value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
// java.security.auth.login.config=/kafka_client_jaas.conf
// group.id=test`;
    let code = 
    `bootstrap.servers=192.168.1.22:9092
sasl.mechanism=PLAIN
session.timeout.ms=25000
max.poll.records=30
key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
group.id=RestCloud`
        this.props.form.setFieldsValue({props:code})
        this.state.formData.props=code;
      }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定本数据源所属的分类'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId=='all'?'':this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.categoryUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="数据源名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本数据源的说明"
        >
          {
            getFieldDecorator('configName', {rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据源唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定一个唯一Id在获取数据库链接时使用(默认kafka的id为kafka)"
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}],initialValue:'kafka'
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="Kafka属性配置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help={<span><a style={{cursor:'pointer'}} onClick={this.insertProducer}>生产者</a> <Divider type="vertical" />
          <a style={{cursor:'pointer'}} onClick={this.insertConsumer}>消费者</a></span>}
        >{
          getFieldDecorator('props',{initialValue:``})
          (<AceEditor mode='ini' width='100%' height='300px'/>)
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
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存退出</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
