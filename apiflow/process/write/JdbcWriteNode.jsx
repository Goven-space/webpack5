import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditDataNodeColumns from './components/JdbcWriteNodeColumns';
import PreviewTableData from './components/JdbcWriteNodePreviewData';

//根据数据库表进行数据写入

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;

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
          try{postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());}catch(e){}
          if(postData.tableColumns!=='' && postData.tableColumns!=='[]' && postData.tableColumns!==undefined && postData.tableColumns.indexOf("\"primaryKey\":true")==-1){
            AjaxUtils.showError("警告:输出字段中没有指定关键字段!");
            return;
          }
          if(postData.writeType!=='1' && postData.tableColumns!=='[]' && postData.tableColumns!==undefined && (postData.tableColumns.indexOf("\"conflictMode\":3")!=-1  || postData.tableColumns.indexOf("\"conflictMode\":4")!=-1)){
            AjaxUtils.showError("错语:流有值时更新和流非空时更新只能用在逐条更新模式!");
            return;
          }
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
                help="请选择一个数据源,允许通过P_MODEL_DATASRCID变量来动态改变数据源"
              >
                {
                  getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:'default'})
                  (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
                }
              </FormItem>
              <FormItem
                label="指定数据库表"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='请选择或填写数据库表名,Oracle支持(用户.表名),mysql支持(库名.表名),mssql支持(库名.dbo.表名),pg(schema.表名)'
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
                label="数据来源字段Id"
                help='指定上一节点要输出到数据库表中的数据字段如:$.data,空表示整体作为一条记录'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('dataJsonPath')
                (<Input  />)
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
          <TabPane  tab="输出选项" key="outConfig"  >
            <FormItem label="清空表数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='第一次执时表示仅启动时清空一次(适用于分页传输),每次执行时表示只要运行一次就先清空目标表'
            >
              {getFieldDecorator('targetDeleteAll',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>第一次执时</Radio>
                  <Radio value='2'>每次执行时</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="自动创建表" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='如果表不存在则自动根据输出字段的配置创建一张表'
            >
              {getFieldDecorator('createTableFlag',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="数据更新方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='数据量较大时可选择批量插入或更新' >
              {getFieldDecorator('writeType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>逐条(更新、插入、删除)操作</Radio>
                  <Radio value='3'>合并后批量(更新、插入、删除)操作</Radio>
                  <Radio value='2'>批量插入</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="检查选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("writeType")==='3'?'':'none'}}
               help='写入前检测记录是否存在,如果记录已存在则根据冲突规则决定是否更新或插入,不检测一般用在增量运算节点之后'
            >
              {getFieldDecorator('skipExistsCheck',{initialValue:'2'})
              (
                <RadioGroup>
                  <Radio value='2'>更新前批量检测记录是否存在</Radio>
                  <Radio value='0'>更新前逐条检测记录是否存在</Radio>
                  <Radio value='1'>不检测</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="批大小"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定批量检测时的每批数量'
              style={{display:(this.props.form.getFieldValue("skipExistsCheck")==='2' && this.props.form.getFieldValue("writeType")=='3')?'':'none'}}
            >{
              getFieldDecorator('batchCheckSize',{rules: [{ required: false}],initialValue:1000})
              (<InputNumber min={1}  />)
              }
            </FormItem>
            <FormItem label="冲突处理"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("writeType")==='1'?'':'none'}}
              help='指定数据更新时的处理策略,如果更新选项中为不检测则冲突规则不可用'
            >
              {getFieldDecorator('conflictFlag',{initialValue:'1'})
              (
                (<Select  >
                <Option value='1'>记录已存在时更新(不存在时插入)</Option>
                <Option value='2'>记录已存在时更新(不存在时跳过)</Option>
                <Option value='3'>记录已存在时跳过(不存在时插入)</Option>
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
              getFieldDecorator('transactionIsolation',{rules: [{ required: false}],initialValue:'100'})
              (                  <Select>
                                  <Option value='1'>1.未提交读(oracle不支持)</Option>
                                  <Option value='2'>2.已提交读</Option>
                                  <Option value='3'>4.可重复读(oracle不支持)</Option>
                                  <Option value='8'>8.串行化</Option>
                                  <Option value='100'>缺省级别</Option>
                                </Select>)
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
          <TabPane  tab="输出字段" key="fieldConfig"  >
              <EditDataNodeColumns form={this.props.form} data={this.state.formData.tableColumns}  ref='tableColumns' />
                注意:关键字段作为更新判断条件(批量插入时无效),未配置的字段不会输出到目标表中,如果是自增量字段请选择禁止更新字段,缺省值中支持取全局变量
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
          <TabPane  tab="预览数据" key="dataPreview"  >
              <PreviewTableData form={this.props.form} ref='previewTableData' />
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
