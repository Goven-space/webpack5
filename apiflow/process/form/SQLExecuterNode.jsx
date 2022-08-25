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
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';
import ApiExportParamsConfig from './components/ApiExportParamsConfig';

//sql执行节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const selectExportParams=URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.fieldSelectUrl=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.nodeId;
    this.state={
      mask:false,
      formData:{tableColumns:'[]',sqlCode:"update table set userid='${userId}' where id=${id}"},
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
          postData.exportParams=JSON.stringify(this.getExportParamsConfig()); //输出参数转换为字符串
          try{
            postData.sqlCode=this.refs.sqlCode.getCode();
          }catch(e){}
          let title=postData.pNodeName;
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

  //获得规则的输出参数配置
  getExportParamsConfig=()=>{
    if(this.refs.exportParams){
      return this.refs.exportParams.getData();
    }else{
      return JSON.parse(this.state.formData.exportParams||'[]');
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    let exportParamsJson=this.state.formData.exportParams==undefined?[]:JSON.parse(this.state.formData.exportParams);

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
            <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="SQL执行结果数据是否输出给本流程发布的API的调用端"
            >
              {getFieldDecorator('responseData',{initialValue:'1'})
              (
                <Select  >
                  <Option value='1'>输出SQL执行结果给调用端</Option>
                  <Option value='0'>不输出SQL执行结果</Option>
                  <Option value='2'>多次循环调用时累加结果并输出</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="运行方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='仅执行一次表示把节点输入参数作为变量传入SQL中执行一次，逐行执行表示把输入参数中的数组记录逐行作为变量传入sql中并执行一次'
            >
              {getFieldDecorator('executerType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>仅执行一次</Radio>
                  <Radio value='2'>对输入的JSON数组逐行执行SQL</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="JSON数据路径"
              help="指定json数组所在的json层次路径如：$.data"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("executerType")==='2'?'':'none'}}
            >{
              getFieldDecorator('dataJsonPath',{initialValue:''})
              (<AjaxEditSelect  url={this.fieldSelectUrl}   />)
              }
            </FormItem>
            <FormItem
              label="SQL执行选项"
              help='请根据SQL中的insert,update,select选择相应的执行方法'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('methodType',{initialValue:'update'})
                (<Select  >
                      <Option value="select">select(读取单条或多条数据)</Option>
                      <Option value="update">update(执行更新、插入、删除数据的SQL语句)</Option>
                      <Option value="batchsql">批量执行SQL语句(多条SQL用分号进行分隔)</Option>
              </Select>)
              }
            </FormItem>
            <FormItem label="数据流选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='读取到的数据流是替换当前数据流还是追加到数据流或变量中?'
            >
              {getFieldDecorator('appendFlag',{initialValue:'1'})
              (
                <Select>
                  <Option value='1'>替换当前数据流</Option>
                  <Option value='2'>追加到indoc.data数据流中</Option>
                  <Option value='3'>追加到indoc变量中</Option>
                  <Option value='4'>追加到全局变量中</Option>
                </Select>
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
          <TabPane  tab="SQL语句" key="sqlCode"  >
            <div style={{maxHeight:'550px',overflowY:'scroll'}}>
                <EditSQLCode  code={this.state.formData.sqlCode} ref='sqlCode'  getSelectSql={this.getSelectSql}  />
                {'提示:执行一次时使用${变量}可以获取上一节点传入的变量，逐行执行时${字段}可获取行数据的字段值'}
            </div>
          </TabPane>
          <TabPane  tab="输出参数" key="exportParamsTag"  >
            <ApiExportParamsConfig ref='exportParams' exportParams={exportParamsJson} />
            把本节点输出的数据进行设置，方便后继节点选择输入参数
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
            <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当断言失败时是否跳过节点或者进行补偿运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>正向补偿(定时正向补偿)</Radio>
                  <Radio value='0'>跳过(无需补偿)</Radio>
                  <Radio value='2'>终止流程</Radio>
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
