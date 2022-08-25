import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import TableBatchReadColumns from './components/TableBatchReadColumns';

//sql表直接输入节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.pNodeRole="source";
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
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getData());
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


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
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
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="指定用户"
              help='如果表属于某一个用户指定用户的userId(注意:Oracle的用户id必须是全大写)'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('schemaUserId',{rules: [{ required:false}]})
              (<Input  />)
              }
            </FormItem>
            <FormItem label="分页读取" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='没有大数据表时可选一次读取,有大数据量表时请使用分页读取'
            >
              {getFieldDecorator('sqlPageFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>单表一次读取</Radio>
                  <Radio value='0'>分页读取</Radio>
                  <Radio value='2'>仅读取表结构</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="每页读取数"
              help='指定每次分页读取的数据量,0表示一次全部读取'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
               style={{display:this.props.form.getFieldValue("sqlPageFlag")==='0'?'':'none'}}
            >{
              getFieldDecorator('pageSize',{rules: [{ required:false}],initialValue:10000})
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
          <TabPane  tab="传输表配置" key="fieldConfig"  >
              <TableBatchReadColumns form={this.props.form}  processId={this.processId} nodeId={this.nodeId} data={this.state.formData.tableColumns}  ref='tableColumns' />
          </TabPane>
          <TabPane  tab="事务设置" key="nodeTransactionFlag"  >
            <FormItem label="事务支持" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定本节点是否支持事务,默认与流程一致'
            >
              {getFieldDecorator('nodeTransactionFlag',{initialValue:'2'})
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
              getFieldDecorator('transactionIsolation',{rules: [{ required: false}],initialValue:'1'})
              (                  <Select>
                                  <Option value='1'>1.未提交读</Option>
                                  <Option value='2'>2.已提交读</Option>
                                  <Option value='3'>4.可重复读</Option>
                                  <Option value='8'>8.串行化</Option>
                                  <Option value='100'>缺省级别</Option>
                                </Select>)
              }
            </FormItem>
            <FormItem label="关闭链接" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='本节点读取单个表后是否立即关闭数据库链接,默认为关闭'
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
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>成功</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="当有表传输失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当某一张表传输失败时是否断言失败?'
            >
              {getFieldDecorator('readTableAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
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

export default Form.create()(form);
