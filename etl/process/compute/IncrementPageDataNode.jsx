import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditIncrNodeColumns from './components/EditPageIncrNodeColumns';

//分批增量运算节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.pNodeRole='compute';
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.state={
      mask:false,
      formData:{},
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
              if(JSON.stringify(data)==='{}'){
                data={
                  pNodeName:this.nodeObj.text,
                  pNodeId:this.nodeObj.key,
                  processId:this.processId,
                  pNodeType:this.nodeObj.nodeType,
                  noDeletedData:'Y',
                };
              }
              this.setState({formData:data});
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
          postData.appId=this.appId;
          postData.processId=this.processId;
          postData.pNodeRole=this.pNodeRole;
          try{
            //判断是否选择了关键字段
            let p=0;
            let columnsData=this.refs.tableColumns.getTableColumns();
            for(let i=0;i<columnsData.length;i++){
              // console.log(columnsData[i].primaryKey);
              if(columnsData[i].primaryKey){
                p++;
              }
            }
            if(p===0){
              AjaxUtils.showError("警告:增量运算节点必须至少选择一个关键字段!");
            }
            postData.tableColumns=JSON.stringify(columnsData);
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
                  this.props.close(true,title);
                }
              }
          });
      }
    });
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
                  rules: [{ required: true}]
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
                  rules: [{ required: true}]
                })
                (<Input disabled />)
              }
            </FormItem>
            <FormItem
              label="节点类型"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:'none'}}
            >
              {
                getFieldDecorator('pNodeType', {
                  rules: [{ required: true}]
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="目标数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请指定目标表所在数据源"
            >
              {
                getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:'default'})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="目标数据库表"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请选择或指定目标数据库表'
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
              label="过滤条件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="指定目标表的过虑条件支持变量获取如:a=1 and b='${变量}',空表示所有数据"
            >{
              getFieldDecorator('sqlWhere')
              (<Input  />)
              }
            </FormItem>
            <FormItem label="删除数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='是否计算目标数据中多于源表的数据(删除目标数据多于源表的数据)' >
              {getFieldDecorator('noDeletedData',{initialValue:"Y",rules: [{ required: true}]})
              (
                <RadioGroup>
                  <Radio value="Y">计算并删除</Radio>
                  <Radio value="N">不计算</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea autoSize  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="比较字段配置" key="colList"  >
            <div style={{maxHeight:'550px',overflowY:'scroll'}}>
            <EditIncrNodeColumns ref='tableColumns' processId={this.processId} nodeId={this.nodeId} parentForm={this.props.form} data={this.state.formData.tableColumns} />
            </div>
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
