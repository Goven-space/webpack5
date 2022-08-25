import React from 'react';
import { Form, Input, Button, Spin,Icon,Col,Row,Select,AutoComplete,Tabs,Radio,InputNumber} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import FieldRules from './FieldRules';

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.ETL.DATAQUALITY_DATACONTENT.getById;
const saveDataUrl=URI.ETL.DATAQUALITY_DATACONTENT.save;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.dbType="R";
    this.state={
      mask:false,
      basePath:'',
      formData:{fieldRules:[]},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        let jsonStr='{\n"msgtype": "text",\n"text": {\n"content": "\n数据质量检测通知:${ruleName}\n数据源:${dataSourceId}\n数据库表:${tableName}\n数据检测结果:${remark}\n"}}'
        this.state.formData.eventBody=jsonStr;
        this.state.formData.state='1';
        this.state.formData.level=5;
        this.state.formData.errorPercentage="10";
        FormUtils.setFormFieldValues(this.props.form,this.state.formData);
    }else{
      this.setState({mask:true});
      //载入表单数据
      let url=loadDataUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }


  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          postData.applicationId=this.applicationId;
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                this.props.close(true);
              }
          });
      }
    });
  }

  loadDatabaseTable=()=>{
    let dbConnId=this.props.form.getFieldValue("dataSourceId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:'SYSDB',dbType:this.dbType,dbConnId:dbConnId},(data)=>{
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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}  >
        <Tabs size="large">
          <TabPane  tab="规则配置" key="props"  >
            <FormItem  label="规则名称"  help='数据质量检测描述' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
              {
                getFieldDecorator('ruleName',{rules: [{ required: true}]})
                (<Input  />)
              }
            </FormItem>
            <FormItem
              label="源数据库链接"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="指要对比的源数据源Id"
            >
              {
                getFieldDecorator('dataSourceId',{rules: [{ required: true}]})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="源数据库表"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              help='指定数据库中要进行对比的数据库表'
            >
              <Row gutter={1}>
                <Col span={12}>
                  {
                    getFieldDecorator('tableName', {
                      rules: [{ required: true}],
                    })
                    (
                      <AutoComplete filterOption={true} placeholder='选择数据库表' >
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
              label="严重级别"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择本质量监测规则的级别1-10'
            >{
              getFieldDecorator('level',{rules: [{ required: true}],initialValue:"1"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="错误占比"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='错误占比达到本预设置时可以设置发送告警信息'
            >{
              getFieldDecorator('errorPercentage',{rules: [{ required: true}],initialValue:"10"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="检测时间"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择本数据监测规则执行的时间点'
            >
              {
                getFieldDecorator('expression', {rules: [{ required: true}]})
                (<AjaxSelect  url={schedulerSelectUrl}  options={{showSearch:true,multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
              }
            </FormItem>
            <FormItem
              label="运行服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='集群时指定任务可运行的服务器,可以填写ServerId或IP来指定可运行的服务器多个用逗号分隔'
            >{
              getFieldDecorator('executeServer')
              (<AutoComplete  >
                  <Option value="AllServer">所有集群服务器均可同时运行</Option>
                  <Option value="SingleServer">只有主服务器可运行(主服务器失败时其他服务器接管)</Option>
                </AutoComplete>)
              }
            </FormItem>
            <FormItem  label="SQL"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} help='自定义数据加载SQL如:select * from table where id>1' >
              {
                getFieldDecorator('sql')
                (<Input  />)
              }
            </FormItem>
            <FormItem label="错误数据存储表" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='指定唯一的MongoDB表名用来存储错误数据(表不存在时系统会自动创建),空表示不记录错误数据' >
              {getFieldDecorator('errorDataTableName',{initialValue:''})
              (
                <Input  />
              )}
            </FormItem>
            <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('state',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>启用</Radio>
                  <Radio value='0'>停用</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem  label="备注"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
              {
                getFieldDecorator('remark',{
                 rules: [{ required: false,message:'文件夹备注'}],
                })
                (<Input  />)
              }
            </FormItem>
        </TabPane>
        <TabPane  tab="检测字段" key="field"  >
          <FieldRules form={this.props.form} applicationId={this.applicationId} ref='tableColumns' data={this.state.formData.fieldRules} />
        </TabPane>
        <TabPane  tab="告警设置" key="acl"  >
          <FormItem label="发送通知" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
            help='设定在对比结束后是否发送提醒消息'
          >
            {getFieldDecorator('eventType',{initialValue:'0'})
            (
              <Select>
                <Option value='0'>不发送通知</Option>
                <Option value='1'>结束后发送结果通知</Option>
                <Option value='2'>达到错误占比时发送通知</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            label="API URL"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='指定一个接收消息的API地址,系统将以POST application/json;chartset=utf-8的方式调用可以发送邮件，钉钉消息等.'
          >{
            getFieldDecorator('eventUrl',{rules: [{ required: false}]})
            (<Input  />)
            }
          </FormItem>
          <FormItem
            label="内容"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='使用${变量}可以获取变量值'
          >{
            getFieldDecorator('eventBody',{rules: [{ required: false}]})
            (<Input.TextArea autoSize style={{minHeight:'160px'}} />)
            }
          </FormItem>
        </TabPane>
      </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
