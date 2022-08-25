import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message,Divider,Steps} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditSQLCode from './components/EditSQLCode';
import EditSqlReadNodeColumns from '../read/components/SqlReadNodeColumns';
import PreviewSqlData from '../read/components/PreviewSqlReadNodeData';
import SgingleTableTargetData from './components/SgingleTableTargetData';
import SgingleTableTargetField from './components/SgingleTableUpdateTargetField';

//单表插入及更新

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getSelectSQLUrl=URI.ETL.SQLREADNODE.getSelectSql;
const Step = Steps.Step;

const steps = [{
  title: '基本属性',
}, {
  title: '源数据库表',
}, {
  title: '目标数据库表',
}];

const stepStyle = {
  marginBottom: 5,
  boxShadow: '0px -1px 0 0 #e8e8e8 inset',
};

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.pNodeRole="target";
    this.state={
      mask:false,
      formData:{tableColumns:'[]',pNodeTypeName:this.nodeObj.pNodeTypeName||this.nodeObj.text},
      filtersBeans:[],
      modelCol:[],
      current: 0,
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
          postData.sqlCode=this.getSqlCode();
          postData.tableColumns=this.getTableColumns();
          postData.tableColumns_target=this.getTableColumns_target();
          if(postData.tableColumns_target!=='' && postData.tableColumns_target!=='[]' && postData.tableColumns_target!==undefined && postData.tableColumns_target.indexOf("\"primaryKey\":true")==-1){
            AjaxUtils.showError("警告:目标表中没有指定关键字段!");
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
    let dbConnId=this.props.form.getFieldValue("dbConnId")||'';
    let tableName=this.props.form.getFieldValue("tableName")||'';
    let url=listAllTables+"?filters="+tableName;
    this.setState({mask:true});
    AjaxUtils.post(url,{dbName:dbName,dbType:'R',dbConnId:dbConnId},(data)=>{
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

  getParentSqlCode=()=>{
    return this.state.formData.sqlCode;
  }

 //获取源字段设置
  getTableColumns=()=>{
    let tableColumns;
    if(this.refs.tableColumns!==undefined){
      tableColumns= JSON.stringify(this.refs.tableColumns.getTableColumns());
    }else{
      tableColumns= this.state.formData.tableColumns;
    }
    return tableColumns;
  }

  //获取目标字段设置
   getTableColumns_target=()=>{
     let tableColumns;
     if(this.refs.tableColumns_target!==undefined){
       tableColumns= JSON.stringify(this.refs.tableColumns_target.getTableColumns());
     }else{
       tableColumns= this.state.formData.tableColumns_target;
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


  loadDatabaseTable_target=()=>{
    let dbConnId=this.props.form.getFieldValue("targetDataSourceId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:'SYSDB',dbType:"R",dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("数据库表载入成功!");
            this.setState({tableList_target:data,mask:false});
            this.props.form.setFieldsValue({targetTableName:''});
          }
    });
  }

  onChange = current => {
       this.setState({ current });
  };

  render() {
    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    let tableOptionsItem_target =[];
    if(this.state.tableList_target instanceof Array){
     tableOptionsItem_target=this.state.tableList_target.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
        <div>
          <Steps current={this.state.current} type="navigation" onChange={this.onChange}   style={stepStyle} >
            {steps.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>
        <Tabs size="large" style={{display:current===0?'':'none'}} >
        <TabPane  tab="基本属性" key="props"  >
          <FormItem
            label="节点类型"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            style={{display:'none'}}
          >
            {
              getFieldDecorator('pNodeTypeName', {
                rules: [{ required: false}],
                initialValue:this.nodeObj.text
              })
              (<Input />)
            }
          </FormItem>
          <FormItem
            label="节点名称"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='自定义节点名称'
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
            help={'节点类型:'+this.state.formData.pNodeTypeName}
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
                 help='读取到的数据量为0时标识为断言失败?'
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
          </Tabs>
          <Tabs size="large" style={{display:current===1?'':'none'}}  >
          <TabPane  tab="源数据库表" key="sourcetable"  >
            <FormItem
              label="指定数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              help="请选择一个数据源,允许通过P_MODEL_DATASRCID变量来动态改变数据源"
            >
              {
                getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:''})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="指定数据库表"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              help='请选择或指定一个数据库表(Oracle可填写用户id.表名来读取其他用户表的数据)'
            >
              <Row gutter={2}>
                <Col span={16}>
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
                <Col span={8}>
                  <Button type="dashed" onClick={this.loadDatabaseTable}  >
                    载入数据库表
                  </Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem
              label="SQL语句"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              <EditSQLCode  code={this.state.formData.sqlCode} ref='sqlCode' getSelectSql={this.getSelectSql}  getParentSqlCode={this.getParentSqlCode}   />
            </FormItem>
          </TabPane>
          <TabPane  tab="源表字段" key="fieldConfig"  >
              <EditSqlReadNodeColumns form={this.props.form} applicationId={this.applicationId} processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns} getSqlCode={this.getSqlCode} ref='tableColumns' />
              注意:可以使用事件或规则对源表字段的数据进行转换
          </TabPane>
          <TabPane  tab="预览源数据" key="dataPreview"  >
              <PreviewSqlData form={this.props.form} getSqlCode={this.getSqlCode} processId={this.processId} nodeId={this.nodeId} getTableColumns={this.getTableColumns} ref='sqlDataPreview' />
          </TabPane>
          </Tabs>
          <Tabs size="large" style={{display:current===2?'':'none'}} >
          <TabPane  tab="目标数据库表" key="targettable"  >
              <FormItem label="清空目标表" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='传输前先清空目标表中的数据'
              >
                {getFieldDecorator('targetDeleteAll',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="目标数据库链接"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指要对比的目标数据源Id"
              >
                {
                  getFieldDecorator('targetDataSourceId',{initialValue:''})
                  (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
                }
              </FormItem>
              <FormItem
                label="目标数据库表"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                help='指定目标数据库中要进行对比的数据库表'
              >
                <Row gutter={1}>
                  <Col span={12}>
                    {
                      getFieldDecorator('targetTableName', {
                        rules: [{ required: true}],
                      })
                      (
                        <AutoComplete filterOption={true} placeholder='选择数据库表' >
                        {tableOptionsItem_target}
                        </AutoComplete>
                      )
                    }
                  </Col>
                  <Col span={12}>
                    <Button  onClick={this.loadDatabaseTable_target}  >
                      <Icon type="search" />载入数据库表
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem
                label="提交数"
                help='每次读取和提交的数据量不要设置过大'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('commitCount',{rules: [{ required:false}],initialValue:5000})
                (<InputNumber min={0}  />)
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
                label="自定义Insert"
                help='自定义insert into语句如:insert delayed into tableName,insert /*+append*/ into tableName 等，默认为insert into'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
              >{
                getFieldDecorator('insertIntoSymbol')
                (<Input  />)
                }
              </FormItem>
              </TabPane>
              <TabPane  tab="目标表字段" key="targetfields"  >
                <SgingleTableTargetField form={this.props.form} applicationId={this.applicationId} processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns_target} getSourceTableColumns={this.getTableColumns} ref='tableColumns_target' />
                注意:未配置的字段不会写入目标表中,必须选择一个关键字段作为更新判断条件,自增量字段必须选择禁止更新
              </TabPane>
              <TabPane  tab="预览目标数据" key="targetDataPreview"  >
                  <SgingleTableTargetData form={this.props.form}  processId={this.processId} nodeId={this.nodeId} getTableColumns={this.getTableColumns_target} ref='targetDataPreview' />
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
