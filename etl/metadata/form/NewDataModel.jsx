import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,AutoComplete,Icon,Checkbox,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';


//新增关系数据库数据模型
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_DATAMODELS.load;
const saveDataUrl=URI.CORE_DATAMODELS.save;
const validateBeanIdUrl=URI.CORE_DATAMODELS.validate;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getColumnsByTableName=URI.CORE_DATAMODELS.getColumnsByTableName;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;


//新增实体数据模型

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.categoryId=this.props.categoryId||"";
    this.dbType="R";
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.applicationId+".metadataCategory&rootName=元数据分类";
    this.state={
      mask:true,
      formData:{},
      tableList:[],
      tableColumns:[],
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
        FormUtils.getSerialNumber(this.props.form,"modelId",this.appId,"EM");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.ShowError(data.msg);
          }else{
            if(data.keyId!=='' && data.keyId!==undefined){
              data.keyId=data.keyId.split(",");
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }


  onSubmit = () => {
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
          postData.dbType=this.dbType;
          postData.appId=this.appId;
          postData.applicationId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                message.info("保存成功!");
                this.props.closeTab();
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
          label="所属分类"
          {...formItemLayout4_16}
          help='指定所属的分类,分类可以平台设置中管理'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.categoryUrl} defaultData={[{title:'缺省分类',value:'all'}]}  options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="模型类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:'none'}}
        >
          {getFieldDecorator('modelType',{initialValue:'E'})
          (<Select disabled={true} >
              <Option value="E">实体数据模型</Option>
              <Option value="R">关系数据模型</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="元模型名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本元数据模型的文字"
        >
          {getFieldDecorator('modelName',{
              rules: [{ required: true, message: '请输入元数据名称!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="元模型唯一id"
          {...formItemLayout4_16}
          hasFeedback
          help="唯一id如果已被引用修改id会引起其他设计的引用错误"
        >
          {
            getFieldDecorator('modelId', {rules: [{required: true}]})
            (<Input placeholder="元数据模型id"  />)
          }
        </FormItem>
        <FormItem
          label="指定数据库链接"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="数据库链接可以在系统设置中的数据源管理中进行配置,只支持关系数据库"
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
          help='指定数据库中的物理表名称'
        >
          <Row gutter={1}>
            <Col span={12}>
              {
                getFieldDecorator('tableName', {
                  rules: [{ required: true}],
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
          help='第一个字段为主键多个后继字段为联合主键'
        >
          <Row gutter={1}>
            <Col span={12}>
                {
                  getFieldDecorator('keyId',{rules: [{ required: true}]})
                  (<Select mode='tags' >
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
        <FormItem
          label="读取所有列"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='自动读取表中的所有字段到元数据模型的列配置中'
        >{
          getFieldDecorator('readColumn',{
            valuePropName: 'checked',
            initialValue: true,
          })
          (<Checkbox  >是</Checkbox>)
          }
        </FormItem>
        <FormItem
          label="数据层级"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='用来指定数据模型在数仓中的层级(ods,dwd,dws,ads...),在血缘关系显示时有用'
        >{
          getFieldDecorator('modelLevel',{rules: [{ required: true}],initialValue:1})
          (<InputNumber min={1} />)
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
          <Button type="primary" onClick={this.onSubmit}  >
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

export default Form.create()(form);
