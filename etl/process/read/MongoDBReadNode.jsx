import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,Checkbox} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import MongoDBReadNodeColumns from './components/MongoDBReadNodeColumns';
import MongoDBReadNodePreviewData from './components/MongoDBReadNodePreviewData';

//mongodb 数据读取

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const connectionsUrl=URI.CORE_DATASOURCE.listAll+"?configType=MongoDB";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getSelectSQLUrl=URI.ETL.SQLREADNODE.getSelectSql;
const mongodbsUrl=URI.CORE_DATAMODELS.mongodbs;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.pNodeRole="source";
    this.dbType="M";
    this.state={
      mask:false,
      formData:{tableColumns:'[]'},
      modelCol:[],
      DbList:[],
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
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
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

  dataSourceChange=(value, label, extra)=>{
    let parentNodeId=extra.triggerNode.props.parentNodeId;
    if(parentNodeId==='home'){
      AjaxUtils.showError("请选择一个数据源!");
      return false;
    }
  }

  loadDatabaseTable=()=>{
    //载入数据库表
    let dbName=this.props.form.getFieldValue("mongoDbName");
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:dbName,dbType:this.dbType,dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("数据库表载入成功!");
            this.setState({tableList:data,mask:false});
            this.props.form.setFieldsValue({tableName:''});
          }
    });
  }

  loadDatabase=()=>{
    //载入指定链接的数据库
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    let url=mongodbsUrl+"?configId="+dbConnId;
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("数据库载入成功!");
            this.setState({DbList:data,mask:false});
            this.props.form.setFieldsValue({dbName:''});
          }
    });
  }

 //获取字段设置
  getTableColumns=()=>{
    let tableColumns;
    if(this.refs.tableColumns!==undefined){
      tableColumns= JSON.stringify(this.refs.tableColumns.getTableColumns());
    }else{
      tableColumns= this.state.formData.tableColumns;
    }
    return tableColumns;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    const DbOptionsItem = this.state.DbList.map(item => <Option key={item.value}>{item.text}</Option>);
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
              label="指定数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请选择一个数据源"
            >
              {
                getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:'default'})
                (<AjaxSelect url={connectionsUrl} textId="configName" valueId="configId" options={{showSearch:true}} />)
              }
            </FormItem>
            <FormItem
              label="指定MongoDB数据库"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="指定要读取的MongoDB的数据库名称"
            >
            <Row gutter={1}>
                <Col span={12}>
                {
                  getFieldDecorator('mongoDbName',{rules: [{ required: true}],initialValue:''})
                  (
                            <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}  >
                            {DbOptionsItem}
                            </AutoComplete>
                  )
                }
              </Col>
              <Col span={12}>
                <Button  onClick={this.loadDatabase}  >
                  载入数据库
                </Button>
              </Col>
            </Row>
            </FormItem>
            <FormItem
              label="指定数据库表"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请选择或指定一个数据库表,表名支持变量${变量}'
            >
              <Row gutter={2}>
                <Col span={12}>
                  {
                    getFieldDecorator('tableName', {
                      rules: [{ required: false}],
                    })
                    (
                      <AutoComplete
                        filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                      >
                      {tableOptionsItem}
                      </AutoComplete>
                    )
                  }
                </Col>
                <Col span={12}>
                  <Button onClick={this.loadDatabaseTable}  >
                    载入数据库表
                  </Button>
                </Col>
              </Row>
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
              (<Input.TextArea autoSize />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="查询条件" key="condition"  >
            <FormItem
              label="Query查询条件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定mongodb的数据查询条件如：{userId:"admin"},${lastEndTime}获取本流程最后一次结束时间,时间格式为:yyyy-MM-dd HH:mm:ss,使用${变量}可以接收上一节点设置的变量,空表示所有数据'
            >{
              getFieldDecorator('queryFilters',{initialValue:''})
              (<Input.TextArea autoSize placeholder='{userId:"admin"}' />)
              }
            </FormItem>
            <FormItem
              label="Projection字段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要查询的字段*号表示所有字段格式{userId:1,userName:1}'
            >{
              getFieldDecorator('projection',{initialValue:'*'})
              (<Input.TextArea autoSize />)
              }
            </FormItem>
            <FormItem
              label="Order排序字段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="指定要排序的字段如：{creatTime:-1}"
            >{
              getFieldDecorator('sortField',{initialValue:"{id:1}"})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="Limit"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 10 }}
              help="指定最大查询数,0表示不限定,可以接收上一节点设置的limit变量"
            >{
              getFieldDecorator('limit',{initialValue:'0'})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="skip"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 10 }}
              help="指定跳过的记录数,0表示从0开始,可以接收上一节点设置的skip变量"
            >{
              getFieldDecorator('skip',{initialValue:'0'})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem label="分页读取" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='不分页表示一次性全部读取适用于少批量数据'
            >
              {getFieldDecorator('sqlPageFlag',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>分页读取</Radio>
                  <Radio value='2'>不分页</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="每页读取数"
              help='指定每次分页读取的数据量,0表示一次全部读取'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
               style={{display:this.props.form.getFieldValue("sqlPageFlag")==='2'?'none':''}}
            >{
              getFieldDecorator('pageSize',{rules: [{ required:false}],initialValue:50000})
              (<InputNumber min={0}  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="输入字段" key="fieldConfig"  >
              <MongoDBReadNodeColumns form={this.props.form} applicationId={this.applicationId}  processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns} getSqlCode={this.getSqlCode} ref='tableColumns' />
              注意:未配置的字段值会被删除
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>失败</Radio>
                  <Radio value='1'>成功</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="未读取到数据时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当有读取到的数据量为0时标识为失败?'
            >
              {getFieldDecorator('readCountAssert',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='0'>失败</Radio>
                  <Radio value='1'>成功</Radio>
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
          <TabPane  tab="预览数据" key="dataPreview"  >
              <MongoDBReadNodePreviewData form={this.props.form}  processId={this.processId} nodeId={this.nodeId} getTableColumns={this.getTableColumns} ref='sqlDataPreview' />
              提示：数据列只显示3个字段点击+号可显示所有JSON字段
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
