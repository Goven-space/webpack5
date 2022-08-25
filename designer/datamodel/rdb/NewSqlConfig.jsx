import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import DataModelSelect from '../form/DataModelSelect';
import PermissionSelect from '../../../core/components/PermissionSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_SQLCONFIG.GetById;
const SubmitUrl=URI.CORE_SQLCONFIG.Save;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.modelId=this.props.modelId||[];
    if(this.modelId==='AllSql'){this.modelId=[];}
    this.categoryId=this.props.categoryId==='AllSql'?'':this.props.categoryId;
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".SqlCategory&rootName=SQL分类";
    this.dbType="R";
    this.state={
      mask:false,
      formData:{},
      tableList:[],
    };
  }

  componentDidMount(){
      if(this.props.id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"SQL");
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
            if(data.modelId!='' && data.modelId!==undefined && data.modelId!==null){
              data.modelId=data.modelId.split(",");
            }else{
              data.modelId=[];
            }
            FormUtils.setFormFieldValues(this.props.form,data);
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
          postData.codeType="sql";
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功,可以点击SQL代码编写SQL语句!");
                if(closeFlag){
                  this.props.close(true);
                }
              }
              this.setState({mask:false});
          });
      }
    });
  }

  getConfigId=()=>{
    let modelId=this.props.form.getFieldValue("modelId");
    if(modelId===undefined || modelId.length===0){return "";}
    let configId=this.props.form.getFieldValue("configId");
    if(configId==='' || configId===undefined || configId===null){
      if(modelId instanceof Array){
        this.props.form.setFieldsValue({configId:modelId[0]+"."});
      }else{
        this.props.form.setFieldsValue({configId:modelId+"."});
      }
    }
  }

  loadDatabaseTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
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
        <FormItem
          label="SQL名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本SQL的说明"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the title!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help='可在Java脚本中使用RdbMapperUtil类引用本SQL'
        >
          {
            getFieldDecorator('configId', {
              rules: [{required: true}]
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="指定数据库链接"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="执行本SQL时所使用的数据库链接"
        >
          {
            getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:''})
            (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="绑定数据库表"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          help='绑定一张数据库表或视图可自动生成SQL同时方便选择字段'
        >
          <Row gutter={1}>
            <Col span={12}>
              {
                getFieldDecorator('tableName', {
                  rules: [{ required: false}],
                })
                (
                  <AutoComplete filterOption={true} placeholder='选择数据库表或视图' >
                  {tableOptionsItem}
                  </AutoComplete>
                )
              }
            </Col>
            <Col span={12}>
              <Button  onClick={this.loadDatabaseTable}  >
                <Icon type="search" />载入表或视图
              </Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem
          label="适用数据库类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='系统可根据数据库类型自动匹配相同id的sql配置'
        >
          {
            getFieldDecorator('type', {rules: [{ required: true}],initialValue:"*"})
            (<Select placeholder="数据库类型">
              <Option value="sqlserver">SQL SERVER</Option>
              <Option value="mysql">MYSQL</Option>
              <Option value="oracle">ORACLE</Option>
              <Option value="posrtgresql">POSTGRESQL</Option>
              <Option value="db2">DB2</Option>
              <Option value="hive">HIVE</Option>
              <Option value="*">所有</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定SQL所属分类,可以在应用配置的分类管理中进行分类管理'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId,
              }
            )
            (<TreeNodeSelect  url={this.menuUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="所属数据模型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="选择SQL代码中使用到的数据模型(可在数据模型修改时评估影响的SQL语句)"
        >
          {
            getFieldDecorator('modelId',{initialValue:this.modelId})
            (<DataModelSelect appId={this.appId} dbType="R" modelType="E,R" options={{combobox:true,mode:'multiple'}}   />)
          }
        </FormItem>
        <FormItem label="动态SQL" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='是否允许使用JavaScript语法动态返回SQL语句'
        >
          {getFieldDecorator('dynamicFlag',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
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

const NewPermission = Form.create()(form);

export default NewPermission;
