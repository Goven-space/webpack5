import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById   = host+"/rest/cdc/producer/getById"; //获取数据接口地址
const SubmitUrl = host+"/rest/cdc/producer/save"; //保存数据接口地址
const SelectTopicUrl= host+"/rest/cdc/topic/select";


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.code="";
    this.codeUrl=webappsProjectName+"/res/ace/eventcode.html?codeType=properties";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){return;}
      let url=GetById+"?id="+this.id;
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data});
            FormUtils.setFormFieldValues(this.props.form,data);
            this.code = data.code;
            // this.setCode(data.code); // 等待iframe onload
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
          postData.code = this.getCode(); //获取编辑代码
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

  setCode=(code)=>{
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(code||this.code);
  }
  getCode=()=>{
    let mframe = this.refs.myframe;
    return mframe.contentWindow.editor.getValue();
  }

  insertProducer=(type)=>{
    let code='';
    if(type==="mysql"){
      code=`# 数据库配置
database.server.name=cdc-server
database.server.id=223344
database.hostname=localhost
database.port=3306
database.user=root
database.password=123456
# 不可与一起使用 database.blacklist。白名单中未包括的任何数据库名称都将从监控中排除。默认情况下，将监控所有数据库。
#database.whitelist=
# 不可与一起使用 database.whitelist。黑名单中未包括的任何数据库名称都将受到监控。
#database.blacklist=
# 不可与一起使用 table.blacklist。白名单中未包含的任何表都将从监控中排除。格式为database.schema.table。
#table.whitelist=
# 不可与一起使用 table.whitelist。黑名单中未包含的任何表都将受到监控。格式为database.schema.table。
#table.blacklist=
# 偏移量设置，保存connector运行中offset到topic的频率
#offset.flush.interval.ms=1000`;
    }else if(type==="mongodb"){
      code=`# 数据库配置
mongodb.hosts=restcloud/127.0.0.1:27017
mongodb.name=mongo
mongodb.user=admin
mongodb.password=pass

# 不可与一起使用 database.blacklist。白名单中未包括的任何数据库名称都将从监控中排除。默认情况下，将监控所有数据库。
database.whitelist=mydb
# 不可与一起使用 database.whitelist。黑名单中未包括的任何数据库名称都将受到监控。
#database.blacklist=
# 不可与一起使用 table.blacklist。白名单中未包含的任何表都将从监控中排除。格式为database.schema.table。
table.whitelist=mycol
# 不可与一起使用 table.whitelist。黑名单中未包含的任何表都将受到监控。格式为database.schema.table。
#table.blacklist=
# 偏移量设置，保存connector运行中offset到topic的频率
#offset.flush.interval.ms=1000`;
    }else if(type==="postgre"){
      code=`# 数据库配置
database.server.name=cdc-server
database.hostname=localhost
database.port=5432
database.user=postgres
database.password=123456
database.dbname=etl
plugin.name=pgoutput
# 不可与一起使用 database.blacklist。白名单中未包括的任何数据库名称都将从监控中排除。默认情况下，将监控所有数据库。
#database.whitelist=
# 不可与一起使用 database.whitelist。黑名单中未包括的任何数据库名称都将受到监控。
#database.blacklist=
# 不可与一起使用 table.blacklist。白名单中未包含的任何表都将从监控中排除。格式为database.schema.table。
#table.whitelist=
# 不可与一起使用 table.whitelist。黑名单中未包含的任何表都将受到监控。格式为database.schema.table。
#table.blacklist=
# 偏移量设置，保存connector运行中offset到topic的频率
#offset.flush.interval.ms=1000`;
    }else if(type==="oracle"){
      code=`# 数据库配置
database.server.name=ora-server
database.hostname=localhost
database.port=1521
database.user=c##dbzuser
database.password=123456
database.dbname=orcl
database.pdb.name=pdborcl
schema.include.list=DEMO
#table.include.list=DEMO.USER_INFO
#heartbeat.interval.ms=0
#poll.interval.ms=1000
#offset.flush.interval.ms=1000`;
    }else if(type==="sqlserver"){
      code=`# 数据库配置
database.server.name=sql-server
database.hostname=localhost
database.port=1433
database.user=sa
database.password=123456
database.dbname=demo
# 不可与一起使用 database.blacklist。白名单中未包括的任何数据库名称都将从监控中排除。默认情况下，将监控所有数据库。
#database.whitelist=
# 不可与一起使用 database.whitelist。黑名单中未包括的任何数据库名称都将受到监控。
#database.blacklist=
# 不可与一起使用 table.blacklist。白名单中未包含的任何表都将从监控中排除。格式为database.schema.table。
table.whitelist=dbo.user_info
# 不可与一起使用 table.whitelist。黑名单中未包含的任何表都将受到监控。格式为database.schema.table。
#table.blacklist=
# 偏移量设置，保存connector运行中offset到topic的频率
#offset.flush.interval.ms=1000`;
    }

  this.setCode(code);
}

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
        <Form onSubmit={this.onSubmit}>
          <FormItem
            label="连接器名称"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="唯一名称，如：mysql-connector"
          >
            {getFieldDecorator("docName", {
              rules: [{ required: true }],
              initialValue: "mysql-connector"
            })(<Input />)}
          </FormItem>
          <FormItem
            label="数据库类型"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="请选择一个数据库类型"
          >
            {getFieldDecorator("docType", {
              rules: [{ required: true }]
            })(
              <Select>
                <Option value="MySQL">MySQL</Option>
                <Option value="MongoDB">MongoDB</Option>
                <Option value="PostgreSQL">PostgreSQL</Option>
                <Option value="Oracle">Oracle</Option>
                <Option value="SQLServer">SQLServer</Option>
                <Option value="Cassandra">Cassandra</Option>
                <Option value="Db2">Db2</Option>
                <Option value="Vitess">Vitess</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            label="kafka.bootstrap.servers"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            hasFeedback
            help="kafka集群地址(写集群中某一个可用的broker的地址即可)，如127.0.0.1:9092"
          >
            {getFieldDecorator("bootstrapServers", {
              rules: [{ required: true }],
              initialValue: "127.0.0.1:9092"
            })(<Input />)}
          </FormItem>
          <FormItem
          label="主题"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="kafka topic"
        >
          {
            getFieldDecorator('topic', {rules: [{ required: true}],initialValue:'cdc-record'})
            (<AjaxSelect url={SelectTopicUrl}  />)
          }
        </FormItem>
        <FormItem
          label="自动启动"
          help='应用服务器启动时自动启动监听任务'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('autoStart',{initialValue:0})
            (<RadioGroup >
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="注入增删改标识"
          help='P_TAG_IUD字段会加入到每条数据当中'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('tagIUD',{initialValue:'true'})
            (<RadioGroup >
              <Radio value='true'>是</Radio>
              <Radio value='false'>否</Radio>
            </RadioGroup>)
          }
        </FormItem>

          <FormItem
            label="properties参数配置"
            help={<span><a style={{cursor:'pointer'}} onClick={this.insertProducer.bind(this,"mysql")}>示例mysql</a>
            <Divider type="vertical" /><a style={{cursor:'pointer'}} onClick={this.insertProducer.bind(this,"mongodb")}>示例mongodb</a>
            <Divider type="vertical" /><a style={{cursor:'pointer'}} onClick={this.insertProducer.bind(this,"postgre")}>示例postgre</a>
            <Divider type="vertical" /><a style={{cursor:'pointer'}} onClick={this.insertProducer.bind(this,"oracle")}>示例oracle</a>
            <Divider type="vertical" /><a style={{cursor:'pointer'}} onClick={this.insertProducer.bind(this,"sqlserver")}>示例sqlserver</a>
            </span>}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator("code")(<Input.TextArea hidden />)}
            <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
              <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'300px',width:'100%',border:'none'}}/>
            </div>
          </FormItem>

          <FormItem
            label="备注"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator("remark")(<Input.TextArea autoSize />)}
          </FormItem>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this, true, "")}>
              保存
            </Button>{" "}
            <Button onClick={this.props.close.bind(this, false)}>关闭</Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
