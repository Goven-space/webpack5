import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,Checkbox} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//新增关系数据库数据模型
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_DATAMODELS.batchSave;
const connectionsUrl=URI.CORE_DATAMODELS.connections;
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";

//批量新增实体数据模型

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.categoryUrl=URI.CORE_APPMENU_ITEM.menuUrl+"?categoryId=daas.datamodel";
    this.state={
      mask:false,
      formData:{},
      tableList:[],
    };
  }

  componentDidMount(){

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
          postData.modelType='E';
          postData.dbType='R';
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                this.setState({mask:false});
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.closeTab();
              }
          });
      }
    });
  }

  loadDatabaseTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
    let dbType='R';
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    let filters=this.props.form.getFieldValue("filters");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:dbName,dbType:dbType,dbConnId:dbConnId,filters:filters},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("数据库表载入成功!");
            this.setState({tableList:data,mask:false});
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
          label="指定数据源"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="选择本数据模型所在的数据源"
        >
          {
            getFieldDecorator('dbConnId',{initialValue:'default'})
            (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="过滤条件"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定要载入表的关键字，空表示载入所有数据库表'
        >{
          getFieldDecorator('filters')
          (<Input  />)
          }
        </FormItem>
        <FormItem
          label="选择数据库表"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
        {
          getFieldDecorator('tableName', {
            rules: [{ required: true}],
          })
          (
            <Select mode='tags' allowClear={true} placeholder='选择要导入的数据库表' >
            {tableOptionsItem}
            </Select>
          )
        }
        <Button type="ghost" onClick={this.loadDatabaseTable}  >
          载入数据库表
        </Button>
        </FormItem>
        <FormItem
          label="生成别名"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='字段Id下划线自动转为驼峰结构的别名Id'
        >{
          getFieldDecorator('toCamelCase',{
            valuePropName: 'checked',
            initialValue: true,
          })
          (<Checkbox  >是</Checkbox>)
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
            开始导入
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

const NewBatchDataModel = Form.create()(form);

export default NewBatchDataModel;
