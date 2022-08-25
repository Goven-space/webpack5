import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,Tooltip,Divider,AutoComplete,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//RDB业务模型

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_DATAMODELS.load;
const saveDataUrl=URI.CORE_DATAMODELS.save;
const validateBeanIdUrl=URI.CORE_DATAMODELS.validate;
const mongodbsUrl=URI.CORE_DATAMODELS.mongodbs;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getColumnsByTableName=URI.CORE_DATAMODELS.getColumnsByTableName;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.dbType="R";
    let filters=`select * from tableName`;
    this.state={
      mask:true,
      formData:{filters:filters},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
        FormUtils.getSerialNumber(this.props.form,"modelId",this.appId,"BM");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          let codeMirror=this.refs.codeMirror.getCodeMirror();
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.keyId!=='' && data.keyId!==undefined){
              data.keyId=data.keyId.split(",");
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
            codeMirror.setValue(data.filters);
          }
      });
    }
  }


  onSubmit = (closeFlag) => {
    let dynamicfilters=this.props.form.getFieldValue("dynamicfilters");
    let sqlCode=this.state.formData.filters;
    if(dynamicfilters){
      if(sqlCode.indexOf("var sql")===-1){
        AjaxUtils.showError("动态SQL必须指定返回sql变量,可以点击动态SQL示例生成!");
        return;
      }
    }else if(sqlCode.indexOf("var sql")!==-1){
        AjaxUtils.showError("简单SQL不支持返回动态SQL语句,请选择动态SQL或去掉var sql变量!");
        return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
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
          postData.modelType="R";
          postData.dbType=this.dbType;
          postData.dynamicfilters=false;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }
    });
  }

  //检测configId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateBeanIdUrl,callback);
  }


  loadDatabaseTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:dbName,dbType:this.dbType,dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("数据库表载入成功!");
            this.setState({tableList:data,mask:false});
            this.props.form.setFieldsValue({tableName:''});
          }
    });
  }

  loadTableColumns=()=>{
    //载入数据库表
    let tableName=this.props.form.getFieldValue("tableName");
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    if(tableName===''){message.error("请先指定数据库表名再执行本操作!");return;}
    this.setState({mask:true});
    AjaxUtils.post(getColumnsByTableName,{tableName:tableName,dbType:this.dbType,connId:dbConnId,dbName:''},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("字段载入成功!");
            this.setState({tableColumns:data,mask:false});
            //this.props.form.setFieldsValue({keyId:''});
          }
    });
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.filters=newCode; //sqlcode 存在业务模型的filters字段中
    this.setState({
      formData: formData,
    });
  }

  insertSQL1=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`SELECT a.name, b.count, b.date FROM a LEFT JOIN b ON a.id=b.id`;
      codeMirror.setValue(code);
      this.state.formData.filters=code;
  }

  insertSQL2=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`SELECT a.name, b.count, b.date FROM a INNER JOIN b ON a.id=b.id`;
      codeMirror.setValue(code);
      this.state.formData.filters=code;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    let tableColumnsOptionsItem=[];
    if(this.state.tableColumns instanceof Array){
      tableColumnsOptionsItem = this.state.tableColumns.map(item => <Option key={item.colId}>{item.colId}</Option>);
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {initialValue:this.props.appId})
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="模型名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本业务模型的文字"
        >
          {getFieldDecorator('modelName',{
              rules: [{ required: true, message: '请输入模型名称!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据模型唯一id"
          {...formItemLayout4_16}
          hasFeedback
          help="唯一id如果已被引用修改id会引起其他设计的引用错误"
        >
          {
            getFieldDecorator('modelId', {rules: [{required: true}]})
            (<Input placeholder="数据模型id"  />)
          }
        </FormItem>
        <FormItem
          label="指定数据库链接"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="数据库链接可以在系统设置中的数据源管理中进行配置"
        >
          {
            getFieldDecorator('dbConnId',{initialValue:'default'})
            (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="绑定数据库表"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          help='指定数据持久化时的表名称(如果不指定则表示本模型不支持持久化)'
        >
          <Row gutter={1}>
            <Col span={12}>
              {
                getFieldDecorator('tableName', {
                  rules: [{ required: false}],
                })
                (
                  <AutoComplete filterOption={true} placeholder='选择本数据模型要持久化的数据库表' >
                  {tableOptionsItem}
                  </AutoComplete>
                )
              }
            </Col>
            <Col span={12}>
              <Button  onClick={this.loadDatabaseTable}  >
                <Icon type="search" />载入数据库表
              </Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem
          label="数据库表主键id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          help='指定数据持久化时的表主键(如果不指定则表示本模型不支持持久化)'
        >
          <Row gutter={1}>
            <Col span={12}>
                {
                  getFieldDecorator('keyId',{rules: [{ required: false}]})
                  (<Select mode='multiple' >
                    {tableColumnsOptionsItem}
                  </Select>)
                }
            </Col>
            <Col span={12}>
              <Button  onClick={this.loadTableColumns}  >
                <Icon type="search" />载入表字段
              </Button>
            </Col>
          </Row>
        </FormItem>
        <Row>
          <Col span={4}></Col>
          <Col span={16}>
            <div style={{border:'1px #cccccc solid',minHeight:'150px',margin:'2px',borderRadius:'0px'}}>
              <CodeMirror ref='codeMirror'
              value={this.state.formData.filters}
              onChange={this.updateCode}
              options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
              />
          </div>定义业务模型的数据来源,
          SQL示例:<a style={{cursor:'pointer'}} onClick={this.insertSQL1}>示例1</a> <Divider type="vertical" />
        <a style={{cursor:'pointer'}} onClick={this.insertSQL2}>示例2</a> <Divider type="vertical" />
          </Col>
        </Row>
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
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button onClick={this.onSubmit.bind(this,false)}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewBusinessModel = Form.create()(form);

export default NewBusinessModel;
