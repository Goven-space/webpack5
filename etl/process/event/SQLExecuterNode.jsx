import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditSQLCode from './components/EditSQLCode';
import DataFiltersFieldConfig from '../compute/components/DataFiltersFieldConfig';

//sql执行节点

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
    this.pNodeRole="target";
    this.state={
      mask:false,
      formData:{tableColumns:'[]',filtersTableColumns:'[]',sqlCode:"update table set userid='${userId}' where id=${id}"},
      filtersBeans:[],
      modelCol:[],
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
    let dbName="SYSDB";
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:dbName,dbType:'R',dbConnId:dbConnId},(data)=>{
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

//获取sql语句
  getSqlCode=()=>{
    if(this.refs.sqlCode!==undefined){
      return this.refs.sqlCode.getCode();
    }else{
      return this.state.formData.sqlCode;
    }
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

  //获取select sql语句
  getSelectSql=()=>{
      let formData=this.props.form.getFieldsValue();
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

  updateFiltersMapConfigs=(data)=>{
    this.state.formData.filtersTableColumns=JSON.stringify(data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
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
              label="指定数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请指定要执行SQL的数据源"
            >
              {
                getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:'default'})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem label="运行方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='仅执行一次表示把节点变量传入SQL中执行一次，逐行执行表示把数据流中的记录逐行作为变量传入sql中并执行一次'
            >
              {getFieldDecorator('executerType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>仅执行一次</Radio>
                  <Radio value='2'>对数据记录逐行执行SQL</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="SQL执行选项"
              help='请根据SQL中的insert,update,select选择相应的执行方法'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('methodType',{initialValue:'update'})
                (<Select  >
                      <Option value="select_replace">select(Select的结果集作为Data数据流流入后续节点)</Option>
                      <Option value="select_append">select(逐行执行SQL并把返回的字段值赋值给每一行数据字段中,运行方式必须选择逐行执行)</Option>
                      <Option value="select_variant">select(返回的数据结果作为变量及全局变量输入后继节点,只能返回一行数据,运行方式必须选择仅执行一次)</Option>
                      <Option value="insert">insert(执行插入数据的SQL语句)</Option>
                      <Option value="insert_batch">insert(使用批量执行SQL模式插入所有数据)</Option>
                      <Option value="update">update(执行更新数据的SQL语句)</Option>
                      <Option value="update_batch">update(使用批量执行SQL模式更新所有数据)</Option>
                      <Option value="delete">delete(执行删除数据的SQL语句)</Option>
                      <Option value="batchsql">批量执行多条SQL语句(多条不同的SQL语句用分号分隔)</Option>
                      <Option value="eachsql">逐条执行多条SQL语句(多条不同的SQL语句用分号分隔)</Option>
              </Select>)
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
          <TabPane  tab="过滤条件" key="condition" >
            <div>
              <DataFiltersFieldConfig
                data={this.state.formData.filtersTableColumns}
                parentForm={this.props.form}
                processId={this.processId}
                pNodeId={this.nodeObj.key}
                updateFieldMapConfigs={this.updateFiltersMapConfigs}
                />
            </div>
            <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 16 }}
              help='只有符合条件的记录会执行SQL'
              >
              {getFieldDecorator('andFlag',{initialValue:'and'})
              (
                <RadioGroup>
                  <Radio value='and'>AND</Radio>
                  <Radio value='or'>OR</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="SQL语句" key="sqlCode"  >
            <div style={{maxHeight:'550px',overflowY:'scroll'}}>
                <EditSQLCode  code={this.state.formData.sqlCode} ref='sqlCode' getSelectSql={this.getSelectSql}  />
                {'提示:执行一次时使用${变量}可以获取上一节点传入的变量及全局变量，逐行执行时${字段}可获取行数据和全局变量的值'}
            </div>
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

const SQLNode = Form.create()(form);

export default SQLNode;
