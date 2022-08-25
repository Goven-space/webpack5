
import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,AutoComplete,message} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ElasticWriteNodeColumns from './components/ElasticWriteNodeColumns';
import ElasticNodePreviewData from './components/ElasticNodePreviewData';
import AceEditor from '../../../core/components/AceEditor'

//elasticWriteNode写入节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const connectionsUrl=URI.CORE_DATASOURCE.listAll+"?configType=Elasticsearch";
const getIndexsUrl=URI.ETL.ElasticsearchNode.listIndexs;
const listTypes=URI.ETL.ElasticsearchNode.listTypes;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.pNodeRole="target";
    this.dbType="M";
    this.state={
      mask:false,
      formData:{tableColumns:'[]'},
      modelCol:[],
      DbList:[],
      typesList:[],
			targetDeleteAllFlag:'0'
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
								if(data.targetDeleteAll==='1') {
									this.setState({
										targetDeleteAllFlag:'1'
									})
								}
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
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
          if(postData.tableColumns!=='' && postData.tableColumns!=='[]' && postData.tableColumns!==undefined && postData.tableColumns.indexOf("\"primaryKey\":true")==-1){
            AjaxUtils.showError("警告:输出字段中没有指定关键ID字段!");
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

  loadIndexs=()=>{
    //载入指定indexs
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    let url=getIndexsUrl+"?dbConnId="+dbConnId;
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("index载入成功!");
            this.setState({DbList:data,mask:false});
            this.props.form.setFieldsValue({dbName:''});
          }
    });
  }

  loadTypes=()=>{
    //载入指定indexs
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    let index=this.props.form.getFieldValue("index");
    let url=listTypes+"?dbConnId="+dbConnId+"&index="+index;
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("types载入成功!");
            this.setState({typesList:data,mask:false});
            this.props.form.setFieldsValue({tableName:''});
          }
    });
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

	targetDeleteAllChange = (e) => {
		this.setState({
			targetDeleteAllFlag:e.target.value
		})
	}

	getTipCode= () => {
		this.props.form.setFieldsValue({targetDeleteContent:`{
	"query": {
		"match": {
			"message": "some message"
		}
	}
}`})
	}

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const typesOptionsItem =this.state.typesList.map(item => <Option key={item.value}>{item.text}</Option>);
    const DbOptionsItem = this.state.DbList.map(item => <Option key={item.value}>{item.text}</Option>);

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
                getFieldDecorator('dbConnId',{rules: [{ required: true}],initialValue:'elasticsearch'})
                (<AjaxSelect url={connectionsUrl} textId="configName" valueId="configId" options={{showSearch:true}} />)
              }
            </FormItem>
            <FormItem
              label="指定index"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="注意:请用小写字母指定一个存储的index,不存在时系统将自动创建index"
            >
            <Row gutter={1}>
                <Col span={12}>
                {
                  getFieldDecorator('index',{rules: [{ required: true}],initialValue:''})
                  (
                    <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
                    {DbOptionsItem}
                    </AutoComplete>
                  )
                }
              </Col>
              <Col span={12}>
                <Button  onClick={this.loadIndexs}  >
                  载入Index
                </Button>
              </Col>
            </Row>
            </FormItem>
            <FormItem
              label="指定type"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请指定要存储的type,不存在时系统将自动创建type'
            >
            <Row gutter={2}>
              <Col span={12}>
                {
                  getFieldDecorator('tableName', {
                    rules: [{ required: true}],
                  })
                  (
                    <AutoComplete filterOption={(inputValue, option) =>option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} >
                    {typesOptionsItem}
                    </AutoComplete>
                  )
                }
              </Col>
              <Col span={12}>
                <Button  onClick={this.loadTypes}  >
                  载入types
                </Button>
              </Col>
            </Row>
            </FormItem>
            <FormItem label="结束时清空数据流" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='本节点结束时清空内存中的数据流,可以提升内存使用率,清空后数据流不再流入下一节点'
            >
              {getFieldDecorator('clearDataFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
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
          <TabPane  tab="输出选项" key="condition"  >
            <FormItem label="删除Index" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='更新数据之前先删除已存在的Index以及数据'
            >
              {getFieldDecorator('targetDeleteAll',{initialValue:'0'})
              (
                <RadioGroup onChange={this.targetDeleteAllChange}>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
						{
							this.state.targetDeleteAllFlag==='1'?<FormItem label="删除内容" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
							help={<div>
								<a style={{marginRight:15}} onClick={this.getTipCode}>示例代码</a><span>请输入删除条件,如不传则删除整个index</span>
								</div>}
							>
							{getFieldDecorator('targetDeleteContent',{initialValue:``})
							(
								<AceEditor></AceEditor>
							)}
							</FormItem>:null
						}
            <FormItem label="数据更新方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='默认采用批量更新模式,不支持删除目标index中的数据' >
              {getFieldDecorator('writeType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>批量更新(存在时更新不存在插入)</Radio>
                  <Radio value='2'>逐条更新</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="批量大小"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定每次批量插入时的数据记录行'
            >{
              getFieldDecorator('batchSize',{rules: [{ required: false}],initialValue:5000})
              (<InputNumber min={0}  />)
              }
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
            <FormItem
              label="链接选项"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='数据输出完成后是否保持ElasticSearch的持久链接(如果使用频率较高建议保持)'
            >{
              getFieldDecorator('closeConnection',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>保持链接</Radio>
                  <Radio value='1'>关闭链接</Radio>
                </RadioGroup>
              )
              }
            </FormItem>
            <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='数据传输记录日志保存策略' >
              {getFieldDecorator('LogStrategy',{rules: [{ required: true}],initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>仅记录传输出错的记录</Radio>
                  <Radio value='2'>记录所有传输数据</Radio>
                  <Radio value='0'>不记录</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="输出字段" key="fieldConfig"  >
              <ElasticWriteNodeColumns form={this.props.form}  processId={this.processId} nodeId={this.nodeId} tableColumns={this.state.formData.tableColumns} ref='tableColumns' />
              注意:ES只能且必须选择一个主键字段作为数据插入或更新的判断值
              <FormItem
                label=""
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 21 }}
              >{
                getFieldDecorator('deleteNotConfigField',{initialValue:'true'})
                (
                  <RadioGroup>
                    <Radio value='true'>未配置字段不输出</Radio>
                    <Radio value='false'>全部输出</Radio>
                  </RadioGroup>
                )
                }
              </FormItem>
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
            <FormItem label="数据更新有部分失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当有数据写入失败时是否标识为断言失败?'
            >
              {getFieldDecorator('writeErrorAssert',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>断言失败</Radio>
                  <Radio value='0'>断言成功(忽略写入错误)</Radio>
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
              <ElasticNodePreviewData form={this.props.form}  processId={this.processId} nodeId={this.nodeId} getTableColumns={this.getTableColumns} ref='sqlDataPreview' />
              提示：只显示最大100条数据
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
