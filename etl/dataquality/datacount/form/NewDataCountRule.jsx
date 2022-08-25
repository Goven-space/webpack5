import React from 'react';
import { Form, Input, Button, Spin,Icon,Col,Row,Select,AutoComplete,Tabs,Radio,InputNumber} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxSelect from '../../../../core/components/AjaxSelect';

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.ETL.DATAQUALITY_DATACOUNT.getById;
const saveDataUrl=URI.ETL.DATAQUALITY_DATACOUNT.save;
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
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        let jsonStr='{\n"msgtype": "text",\n"text": {\n"content": "\n数据量对比预警:${ruleName}\n源表:${sourceDataSourceId}=>${sourceTableName}\n目标表:${targetDataSourceId}=>${targetTableName}\n源表数据量:${sourceCount}\n目标表数据量:${targetCount}\n"}}'
        this.state.formData.eventBody=jsonStr;
        this.state.formData.state='1';
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
    let dbConnId=this.props.form.getFieldValue("sourceDataSourceId");
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

  loadDatabaseTable_target=()=>{
    let dbConnId=this.props.form.getFieldValue("targetDataSourceId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{dbName:'SYSDB',dbType:this.dbType,dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("数据库表载入成功!");
            this.setState({tableList_target:data,mask:false});
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
    let tableOptionsItem_target =[];
    if(this.state.tableList_target instanceof Array){
     tableOptionsItem_target=this.state.tableList_target.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}  >
        <Tabs size="large">
          <TabPane  tab="规则配置" key="props"  >
              <FormItem  label="规则名称"  help='数据量对比描述' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
                {
                  getFieldDecorator('ruleName',{rules: [{ required: true}]})
                  (<Input  />)
                }
              </FormItem>
              <FormItem
                label="对比时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择本数据对比规则执行的时间点'
              >
                {
                  getFieldDecorator('expression', {rules: [{ required: false}]})
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
              <FormItem  label="差异范围"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} help='0表示不相等则告警，其他表示数据量最小差异范围超过则告警' >
                {
                  getFieldDecorator('differenceNumber',{
                   rules: [{ required: true}],initialValue:"0"
                  })
                  (<InputNumber min={0} />)
                }
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
            <TabPane  tab="源数据表" key="sourceds"  >
                <FormItem
                  label="源数据库链接"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help="指要对比的源数据源Id"
                >
                  {
                    getFieldDecorator('sourceDataSourceId',{initialValue:'default'})
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
                        getFieldDecorator('sourceTableName', {
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
                <FormItem  label="数据筛选条件"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} help='空表示所有数据支持${变量}如: where date=${$date} 或者 where id>1000' >
                  {
                    getFieldDecorator('sourceWhereSQL')
                    (<Input  />)
                  }
                </FormItem>
            </TabPane>
            <TabPane  tab="目标数据表" key="targetds"  >
              <FormItem
                label="目标数据库链接"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指要对比的目标数据源Id"
              >
                {
                  getFieldDecorator('targetDataSourceId',{initialValue:'default'})
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
              <FormItem  label="数据筛选条件"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} help='空表示所有数据支持${变量}' >
                {
                  getFieldDecorator('targetWhereSQL')
                  (<Input  />)
                }
              </FormItem>
          </TabPane>
          <TabPane  tab="告警设置" key="gjconfig"  >
            <FormItem label="发送通知" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help='设定在对比结束后是否发送提醒消息'
            >
              {getFieldDecorator('eventType',{initialValue:'0'})
              (
                <Select>
                  <Option value='0'>不发送通知</Option>
                  <Option value='1'>结束后发送对比结果通知</Option>
                  <Option value='2'>仅对比结果异常时发送通知</Option>
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
