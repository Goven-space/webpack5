
import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import MongoDBWriteNodeColumns from './components/MongoDBWriteNodeColumns';
import MongoDBReadNodePreviewData from '../read/components/MongoDBReadNodePreviewData';

//mongodb写入节点


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
    this.pNodeRole="target";
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
            postData.sqlCode=this.refs.sqlCode.getCode();
          }catch(e){}
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
          if(postData.tableColumns!=='' && postData.tableColumns.indexOf("\"primaryKey\":true")==-1){
            AjaxUtils.showError("警告:输出字段中没有指定关键字段!");
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
              help="指定要写入的MongoDB的数据库名称，如果库不存在写入时将自动创建一个库"
            >
            <Row gutter={1}>
                <Col span={12}>
                {
                  getFieldDecorator('mongoDbName',{rules: [{ required: true}],initialValue:''})
                  (
                            <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
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
              help='请选择或指定一个数据库表,如果表不存在写入时将自动创建一个表,表名支持变量${变量}'
            >
              <Row gutter={2}>
                <Col span={12}>
                  {
                    getFieldDecorator('tableName', {
                      rules: [{ required: false}],
                    })
                    (
                      <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
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
            <FormItem label="结束时清空数据流" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='本节点结束时清空内存中的数据流,可以提升内存使用率,清空后数据流不再流入下一节点'
            >
              {getFieldDecorator('clearDataFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
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
          <TabPane  tab="输出选项" key="condition"  >
            <FormItem label="清空数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='更新数据之前先清空目标表中的数据'
            >
              {getFieldDecorator('targetDeleteAll',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="数据更新方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='数据量较大时可选择批量插入' >
              {getFieldDecorator('writeType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>逐条更新</Radio>
                  <Radio value='2'>批量插入</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="冲突处理"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("writeType")==='1'?'':'none'}}
              help='指定数据更新时的处理策略'
            >
              {getFieldDecorator('conflictFlag',{initialValue:'1'})
              (
                (<Select  >
                <Option value='1'>记录已存在时更新(不存在时插入)</Option>
                <Option value='2'>记录已存在时更新(不存在时跳过)</Option>
                </Select>)
              )}
            </FormItem>
            <FormItem label="忽略错误" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='写入时忽略错误,是表示更新失败或异常时跳过记录,否表示停止更新数据'
            >
              {getFieldDecorator('ignoreError',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="最大写入"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定最大数据写入量0表示不限制(可在测试阶段指定最大传输数量)'
            >{
              getFieldDecorator('maxWriteNum',{rules: [{ required: false}],initialValue:0})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="自动转换数据类型"
              labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='数据流中的字段值根据输出字段的类型自动转换数据类型后存入MongoDB'
            >{
              getFieldDecorator('transformationFieldType',{initialValue:'true'})
              (
                <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>
              )
              }
            </FormItem>
            <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='数据传输记录日志保存策略' >
              {getFieldDecorator('LogStrategy',{rules: [{ required: true}],initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>仅记录传输出错的记录</Radio>
                  <Radio value='2'>记录所有传输数据</Radio>
                  <Radio value='0'>不记录</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="输出字段" key="fieldConfig"  >
              <MongoDBWriteNodeColumns form={this.props.form}  processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns} getSqlCode={this.getSqlCode} ref='tableColumns' />
              注意:更新时必须选择关键字段作为更新判断条件，批量插入时不用选择
              <FormItem
                label=""
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 21 }}
              >{
                getFieldDecorator('deleteNotConfigField',{initialValue:'true'})
                (
                  <RadioGroup>
                    <Radio value='true'>未配置字段不输出</Radio>
                    <Radio value='false'>全部输出</Radio>
                  </RadioGroup>
                )
                }
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
            <FormItem label="数据传输失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当有数据输出失败时是否把本节点的执行结果标识为断言失败?'
            >
              {getFieldDecorator('writeErrorAssert',{initialValue:'1'})
                (
                  <Select  >
                    <Option value='1'>有(插入、删除、更新)失败数据时断言失败</Option>
                    <Option value='2'>有(插入、更新)失败数据时断言失败,忽略删除失败的数据</Option>
                    <Option value='3'>(忽略所有传输错误)断言成功</Option>
                  </Select>
                )
              }
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
