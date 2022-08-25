import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import DeleteTableDataNodeField from './components/DeleteTableDataNodeField';
import EditSQLCode from './components/EditSQLCode';

//对比并删除数据

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getSelectSQLUrl=URI.ETL.SQLREADNODE.getSelectSql;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.pNodeRole='target';
    this.state={
      mask:false,
      formData:{tableColumns:'[]'},
      filtersBeans:[],
      modelCol:[],
      deleteTableList:[],
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.key;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              if(JSON.stringify(data)!=='{}'){
                this.setState({formData:data});
                FormUtils.setFormFieldValues(this.props.form,data);
              }
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
          postData.pNodeType=this.nodeObj.nodeType;
          postData.processId=this.processId;
          postData.pNodeRole=this.pNodeRole;
          try{postData.sqlCode=this.refs.sqlCode.getCode();}catch(e){}
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
          if(postData.tableColumns!=='' && postData.tableColumns!=='[]' && postData.tableColumns!==undefined && postData.tableColumns.indexOf("\"primaryKey\":true")==-1){
            AjaxUtils.showError("警告:没有指定对比字段!");
            return;
          }
          let title=postData.pNodeId+"#"+postData.pNodeName;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,title); //返回数据模型id作为节点名称
                }
              }
          });
      }
    });
  }

  getTableColumns=()=>{
    return this.state.data;
  }

  //获取select sql语句
  getSelectSql=()=>{
      let formData=this.props.form.getFieldsValue();
      formData.dbConnId=formData.deleteConnId; //因为api里面只认dbConnId
      formData.tableName=formData.deleteTableName;//因为api里面只认tableName
      this.setState({mask:true});
      AjaxUtils.post(getSelectSQLUrl,formData,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.refs.sqlCode.setCode(data.code);
        }
      });
  }

  loadDatabaseTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
    let dbConnId=this.props.form.getFieldValue("dbConnId")||'';
    let schemaUserId=this.props.form.getFieldValue("schemaUserId")||'';
    let tableName=this.props.form.getFieldValue("tableName")||'';
    let url=listAllTables+"?filters="+tableName;
    this.setState({mask:true});
    AjaxUtils.post(url,{dbName:dbName,dbType:'R',dbConnId:dbConnId,schemaUserId:schemaUserId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("共载入("+data.length+")个数据库表!");
            this.setState({tableList:data,mask:false});
            this.props.form.setFieldsValue({tableName:''});
          }
    });
  }

  loadDeleteDatabaseTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
    let dbConnId=this.props.form.getFieldValue("deleteConnId")||'';
    let schemaUserId=this.props.form.getFieldValue("schemaUserId")||'';
    let tableName=this.props.form.getFieldValue("deleteTableName")||'';
    let url=listAllTables+"?filters="+tableName;
    this.setState({mask:true});
    AjaxUtils.post(url,{dbName:dbName,dbType:'R',dbConnId:dbConnId,schemaUserId:schemaUserId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("共载入("+data.length+")个数据库表!");
            this.setState({deleteTableList:data,mask:false});
            this.props.form.setFieldsValue({deleteTableName:''});
          }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    let deleteTableOptionsItem =[];
    if(this.state.deleteTableList instanceof Array){
     deleteTableOptionsItem=this.state.deleteTableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="基本属性" key="props"  >
              <FormItem
                label="节点名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本节点的说明"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: false}],
                    initialValue:this.nodeObj.text
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="节点id不能重复"
              >
                {
                  getFieldDecorator('pNodeId', {
                    rules: [{ required: true}],
                    initialValue:this.nodeObj.key
                  })
                  (<Input disabled={true} />)
                }
              </FormItem>
              <FormItem
                label="转义符号"
                help='如果表名、字段名等为关键或中文名时需要加上各数据库指定的符号格式为:[,] 或 "," 或 `,` 等，空表示不添加'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('symbol')
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="增量时间戳初始值"
                help='指定lastEndTime最后运行时间的初始值,格式:yyyy-MM-dd hh:mm:ss'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('initLastEndTime',{rules: [{ required:false}],initialValue:''})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="增量偏移时间(秒)"
                help='指定最后运行时间的往前偏移量(增量读取时使用)'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('forwardSecond',{rules: [{ required:false}],initialValue:10})
                (<InputNumber min={0}  />)
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
            <TabPane  tab="源除数据库表(删除)" key="deleteConfig"  >
              <FormItem
                label="指定数据源"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="经过对比后要删除的数据所在的数据源"
              >
                {
                  getFieldDecorator('deleteConnId',{rules: [{ required: true}],initialValue:''})
                  (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
                }
              </FormItem>
              <FormItem
                label="指定数据所在表"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='请选择或填写数据库表名,Oracle支持(用户.表名),mysql支持(库名.表名),mssql支持(库名.dbo.表名)'
              >
                <Row gutter={2}>
                  <Col span={16}>
                    {
                      getFieldDecorator('deleteTableName', {
                        rules: [{ required: true}],
                      })
                      (
                        <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
                        {deleteTableOptionsItem}
                        </AutoComplete>
                      )
                    }
                  </Col>
                  <Col span={8}>
                    <Button type="dashed" onClick={this.loadDeleteDatabaseTable}  >
                      载入数据库表
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="删除方式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='根据对比结果删除数据记录'
              >
                {getFieldDecorator('deleteType',{initialValue:'1'})
                (
                  (<Select  >
                    <Option value='1'>记录不存在时删除</Option>
                    <Option value='2'>记录已存在时删除</Option>
                    <Option value='3'>不删除,结果数据流入下一节点</Option>
                    <Option value='4'>标识为软删除</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem
                label="软删除语句"
                help='指定软删除的update语句如:set delete=1'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                 style={{display:this.props.form.getFieldValue("deleteType")==='4'?'':'none'}}
              >{
                getFieldDecorator('updateSql',{rules: [{ required:false}],initialValue:'set delete=1'})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="SQL语句"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                <EditSQLCode  code={this.state.formData.sqlCode} ref='sqlCode' getSelectSql={this.getSelectSql}  />
              </FormItem>
            </TabPane>
            <TabPane  tab="目标数据库表" key="targetTable"  >
              <FormItem
                label="目标数据源"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="请选择目标数据源"
              >
                {
                  getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:''})
                  (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
                }
              </FormItem>
              <FormItem
                label="目标数据库表"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='请选择或填写数据库表名,Oracle支持(用户.表名),mysql支持(库名.表名),mssql支持(库名.dbo.表名)'
              >
                <Row gutter={2}>
                  <Col span={16}>
                    {
                      getFieldDecorator('tableName', {
                        rules: [{ required: true}],
                      })
                      (
                        <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
                        {tableOptionsItem}
                        </AutoComplete>
                      )
                    }
                  </Col>
                  <Col span={8}>
                    <Button type="dashed" onClick={this.loadDatabaseTable}  >
                      载入数据库表
                    </Button>
                  </Col>
                </Row>
              </FormItem>
          </TabPane>
          <TabPane  tab="对比字段配置" key="fieldConfig"  >
            <DeleteTableDataNodeField form={this.props.form} applicationId={this.applicationId} processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns}  ref='tableColumns' />
          </TabPane>
          <TabPane  tab="事务设置" key="nodeTransactionFlag"  >
            <FormItem label="事务支持" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定本节点是否支持事务,默认与流程一致'
            >
              {getFieldDecorator('nodeTransactionFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='2'>不支持</Radio>
                  <Radio value='1'>支持</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="事务隔离级别"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定数据库事务的隔离级别'
              style={{display:this.props.form.getFieldValue("nodeTransactionFlag")==='1'?'':'none'}}
            >{
              getFieldDecorator('transactionIsolation',{rules: [{ required: false}],initialValue:'1'})
              (                  <Select>
                                  <Option value='1'>1.未提交读</Option>
                                  <Option value='2'>2.已提交读</Option>
                                  <Option value='3'>4.可重复读</Option>
                                  <Option value='8'>8.串行化</Option>
                                  <Option value='100'>缺省级别</Option>
                                </Select>)
              }
            </FormItem>
            <FormItem
              label="对比批大小"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定数据对比时每批数据量的大小'
            >{
              getFieldDecorator('batchCheckSize',{rules: [{ required: false}],initialValue:5000})
              (<InputNumber min={1}  />)
              }
            </FormItem>
            <FormItem
              label="分批提交数据"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='在事务支持下每更新一定的数据量后先提交数据,不支持事务时本设置无效,0表示由流程控制提交'
            >{
              getFieldDecorator('commitNum',{rules: [{ required: false}],initialValue:10000})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem label="关闭链接" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定本节点结束后是否立即关闭数据库链接,默认为关闭并提交所有数据'
            >
              {getFieldDecorator('closeConnection',{initialValue:'true'})
              (
                <RadioGroup>
                  <Radio value='true'>关闭(提交所有数据)</Radio>
                  <Radio value='false'>否(由后续节点关闭)</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>断言成功(忽略异常)</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="断言失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当断言失败时是否终止流程执行,如果不终止则交由后继路由线判断'
            >
              {getFieldDecorator('assertAction',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>终止流程</Radio>
                  <Radio value='0'>继续运行后继节点</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 4, offset: 20 }}>
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
