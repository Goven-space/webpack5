import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete,Tabs} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import AceEditor from '../../../core/components/AceEditor';

const TabPane = Tabs.TabPane;
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
      RdbDisplay:'',
      DriverDisplay:'none',
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        this.state.formData.id=AjaxUtils.getId(22); //给一个默认值
        return;
      }
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
          postData.configType="Driver";
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

  insertCode3=()=>{
        let code=`public Object conn() throws Exception{
    //认证文件设置
    System.setProperty("java.security.krb5.conf", "conf文件路径");
    System.setProperty("sun.security.krb5.debug", "true");
    // Kerberos认证
    org.apache.hadoop.conf.Configuration configuration = new org.apache.hadoop.conf.Configuration();
    configuration.set("hadoop.security.authentication", "Kerberos");
    configuration.set("keytab.file", "keytab文件路径");
    configuration.set("kerberos.principal", "认证主体(用户名)");
    org.apache.hadoop.security.UserGroupInformation.setConfiguration(configuration);
    org.apache.hadoop.security.UserGroupInformation.loginUserFromKeytab("userName", "keytab文件路径");
    return null; //也可以直接返回Connection对像
}`;
  this.props.form.setFieldsValue({connectionEventCode:code})
  this.state.formData.connectionEventCode=code;
    }

    insertCode4=()=>{
          let code=`public Object conn() throws Exception{
    //直接返回connection对像即可
    java.lang.Class.forName("com.mysql.jdbc.Driver");
    java.util.Properties props =new Properties();
	props.put("user", username);
	props.put("password", password);
    return java.sql.DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/db",props);
}`;
    this.props.form.setFieldsValue({connectionEventCode:code})
    this.state.formData.connectionEventCode=code;
      }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
      <Tabs size="large">
        <TabPane  tab="链接属性配置" key="props"  >
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
                (<TreeNodeSelect   url={this.categoryUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
              }
            </FormItem>
            <FormItem
              label="配置说明"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="指定任何有意义且能描述本数据源的说明"
            >
              {
                getFieldDecorator('configName', {
                  rules: [{ required: true}]
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="数据源唯一Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="指定一个唯一Id在获取数据库链接时使用(至少要有一个默认为default的数据源)"
            >
              {
                getFieldDecorator('configId', {
                  rules: [{ required: true}],initialValue:''
                })
                (<Input />)
              }
            </FormItem>
            <FormItem label="用户Id" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='指定链接数据源的用户Id，没有可以为空值'
            >
              {getFieldDecorator('userId',{initialValue:'root'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='指定链接数据源的密码,没有可以为空值'
            >
              {getFieldDecorator('password',{initialValue:''})
              (
                (<Input type='password' />)
              )}
            </FormItem>
            <FormItem label="加密密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='选择是表示保存时对密码进行一次加密'
            >
              {getFieldDecorator('changePassword',{initialValue:false})
              (
                <RadioGroup>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="数据库驱动Class" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='指定数据源所需要的驱动类JDBC或者ODBC驱动Class(支持手动填写)'
            >
              {getFieldDecorator('driverClass',{rules: [{ required: true}],initialValue:''})
              (
                (<AutoComplete filterOption={true} >
                  <Option value='com.mysql.cj.jdbc.Driver'>com.mysql.cj.jdbc.Driver</Option>
                  <Option value='oracle.jdbc.OracleDriver'>oracle.jdbc.OracleDriver</Option>
                  <Option value='com.microsoft.sqlserver.jdbc.SQLServerDriver'>com.microsoft.sqlserver.jdbc.SQLServerDriver</Option>
                  <Option value='org.postgresql.Driver'>org.postgresql.Driver</Option>
                  <Option value="sun.jdbc.odbc.JdbcOdbcDriver">sun.jdbc.odbc.JdbcOdbcDriver</Option>
                  <Option value="org.apache.hive.jdbc.HiveDriver">org.apache.hive.jdbc.HiveDriver</Option>
                  <Option value="com.sap.db.jdbc.Driver">com.sap.db.jdbc.Driver</Option>
                  <Option value="org.elasticsearch.xpack.sql.jdbc.jdbc.JdbcDriver">org.elasticsearch.xpack.sql.jdbc.jdbc.JdbcDriver</Option>
                  <Option value="org.apache.phoenix.jdbc.PhoenixDriver">org.apache.phoenix.jdbc.PhoenixDriver</Option>
                  <Option value="com.pivotal.jdbc.GreenplumDriver">com.pivotal.jdbc.GreenplumDriver</Option>
                  <Option value="net.sourceforge.jtds.jdbc.Driver">net.sourceforge.jtds.jdbc.Driver</Option>
                  <Option value="com.cloudera.impala.jdbc41.Driver">com.cloudera.impala.jdbc41.Driver</Option>
                  <Option value="com.huawei.gauss200.jdbc.Driver">com.huawei.gauss200.jdbc.Driver</Option>
                  <Option value="ru.yandex.clickhouse.ClickHouseDriver">ru.yandex.clickhouse.ClickHouseDriver</Option>
                  <Option value="org.apache.kylin.jdbc.Driver">org.apache.kylin.jdbc.Driver</Option>
                  <Option value="com.alipay.oceanbase.jdbc.Driver">com.alipay.oceanbase.jdbc.Driver</Option>
                </AutoComplete>)
              )}
            </FormItem>
            <FormItem label="链接数据源URL" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='指定链接数据源的jdbc Url配置(支持手动填写)'
            >
              {getFieldDecorator('jdbcUrl',{rules: [{ required: true}],initialValue:''})
              (
                (<AutoComplete filterOption={true} >
                  <Option value='jdbc:mysql://localhost:3306/dbname?useUnicode=true&serverTimezone=Asia/Shanghai'>jdbc:mysql://localhost:3306/dbname?useUnicode=true&serverTimezone=Asia/Shanghai</Option>
                  <Option value='jdbc:sqlserver://127.0.0.1;databasename=dbname'>jdbc:sqlserver://127.0.0.1;databasename=testdb</Option>
                  <Option value='jdbc:oracle:thin:@127.0.0.1:1521:orcl'>jdbc:oracle:thin:@127.0.0.1:1521:orcl</Option>
                  <Option value='jdbc:postgresql://127.0.0.1:5432/dbname'>jdbc:postgresql://127.0.0.1:5432/dbname</Option>
                  <Option value="jdbc:odbc:dbname">jdbc:odbc:dbname</Option>
                  <Option value="jdbc:hive2://127.0.0.1:10000/default">jdbc:hive2://127.0.0.1:10000/default</Option>
                  <Option value="jdbc:sap://127.0.0.1:30015?reconnect=true">jdbc:sap://127.0.0.1:30015?reconnect=true</Option>
                  <Option value="jdbc:es://127.0.0.1:9200">jdbc:es://127.0.0.1:9200</Option>
                  <Option value="jdbc:dm://127.0.0.1:Port/Database">jdbc:dm://127.0.0.1:Port/Database</Option>
                  <Option value="jdbc:phoenix:server1,server2:3333">jdbc:phoenix:server1,server2:3333</Option>
                  <Option value="jdbc:pivotal:greenplum://host:port;DatabaseName=">jdbc:pivotal:greenplum://host:port;DatabaseName=</Option>
                  <Option value="jdbc:jtds:sybase://127.0.0.1:5000/dbname">jdbc:jtds:sybase://127.0.0.1:5000/dbname</Option>
                  <Option value="jdbc:impala://127.0.0.1:21050">jdbc:impala://127.0.0.1:21050/dbname</Option>
                  <Option value="jdbc:gaussdb://127.0.0.1:25308">jdbc:gaussdb://127.0.0.1:25308</Option>
                  <Option value="jdbc:clickhouse://127.0.0.1:3280/dbname">jdbc:clickhouse://127.0.0.1:3280/dbname</Option>
                  <Option value="jdbc:kylin://ip:port/projectName">jdbc:kylin://ip:port/projectName</Option>
                  <Option value="jdbc:oceanbase://test.oceanbase.aliyuncs.com:1521/dbname">jdbc:oceanbase://test.oceanbase.aliyuncs.com:1521/dbname</Option>
                </AutoComplete>)
              )}
            </FormItem>
            <FormItem
              label="驱动包所在路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定驱动包jar文件所在的路径或目录，空表示使用默认的驱动包及版本'
            >{
              getFieldDecorator('driverJarPath')
              (<Input.TextArea autosize />)
              }
            </FormItem>
            <FormItem
              label="其他链接属性"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.state.RdbDisplay}}
              help='指定数据库的其他链接配置属性(每行一个如:remarksReporting=true)'
            >{
              getFieldDecorator('props')
              (<Input.TextArea autosize />)
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
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='注意:当类型为数据库链接池时一旦数据库链池链接上后，再修改属性必须重启tomcat才能生效'
            >{
              getFieldDecorator('remark')
              (<Input.TextArea autosize />)
              }
            </FormItem>
            </TabPane>
            <TabPane  tab="自定义链接" key="conn"  >
              <FormItem
                label=""
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 22 }}
                help={<span>
                <a style={{cursor:'pointer'}} onClick={this.insertCode3}>Hive认证</a>
                <Divider type="vertical" />
                <a style={{cursor:'pointer'}} onClick={this.insertCode4}>自定义JDBC</a>
                </span>}
              >
                {getFieldDecorator('connectionEventCode', {rules: [{ required: false, message: '' }]})
                  (<AceEditor mode='java' width='100%' height='400px' />)
                }
              </FormItem>
            </TabPane>
          </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存退出</Button>{' '}
            <Button type="ghost" onClick={this.onSubmit.bind(this,false,'testConn')}  >保存并测试链接</Button>{' '}
            <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
          </FormItem>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
