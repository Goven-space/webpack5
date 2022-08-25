import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import EditSelect from '../../../core/components/EditSelect';
import VariableRuleNodeParams from './components/VariableRuleNodeParams';

//变量设置

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.applicationId=this.props.applicationId;
    this.pNodeRole='target';
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.state={
      mask:false,
      formData:{tableColumns:'[]'},
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
          postData.processId=this.processId;
          postData.pNodeType=this.nodeObj.nodeType;
          postData.pNodeRole=this.pNodeRole;
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

  updateFieldMapConfigs=(data)=>{
    this.state.formData.tableColumns=JSON.stringify(data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const taskType=this.props.form.getFieldValue("taskType");

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
              <FormItem label="任务来源"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定Kettle任务的来源'
              >
                {getFieldDecorator('taskType',{initialValue:'1'})
                (
                  (<Select  >
                  <Option value='1'>Kettle转换文件</Option>
                  <Option value='2'>Kettle Job文件</Option>
                  <Option value='3'>Kettle数据资源库</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem label="文件路径"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:taskType==='1' || taskType=='2'?'':'none'}}
                help='指定服务器上的文件路径：d:/etl/task.ktr,支持变量如:${folder}'
              >
                {getFieldDecorator('filePath',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
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
          <TabPane  tab="资源数据库" key="dbconfig" >
              <FormItem label="提示"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '1' || taskType == '2' ? '' : 'none' }}
              >
                本配置需要选择资源数据库类型才能使用
              </FormItem>
              <FormItem label="所在目录"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定任务所在目录'
              >
                {getFieldDecorator('directory', { rules: [{ required: true }], initialValue: '/' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="Kettle任务名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定转换任务的名称,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('transname', { rules: [{ required: false }], initialValue: '' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="数据库类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定资源数据库的类型如:Oracle/mysql'
              >
                {getFieldDecorator('dbType', { rules: [{ required: false }], initialValue: '${$config.kettle.dbType}' })
                  (
                    (<EditSelect data={['mysql', 'oracle', 'mssql']} />)
                  )}
              </FormItem>
              <FormItem label="Access类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定数据库访问类型'
              >
                {getFieldDecorator('access', { rules: [{ required: false }], initialValue: 'Native' })
                  (
                    (<Select  >
                      <Option value='Native'>Native</Option>
                      <Option value='JDBC'>JDBC</Option>
                    </Select>)
                  )}
              </FormItem>
              <FormItem label="数据库Host"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定数据库所在服务器的host,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('host', { rules: [{ required: false }], initialValue: '${$config.kettle.dbHost}' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="数据库端口"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定数据库端口,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('port', { rules: [{ required: false }], initialValue: '${$config.kettle.dbPort}' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="数据库名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定资源数据所在数据库名称,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('dbName', { rules: [{ required: false }], initialValue: '${$config.kettle.dbName}' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="数据库帐号"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定数据库帐号,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('dbuserid', { rules: [{ required: false }], initialValue: '${$config.kettle.dbUserId}' })
                  (
                    (<Input />)
                  )}
              </FormItem>
              <FormItem label="数据库密码"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: taskType === '3' ? '' : 'none' }}
                help='指定数据库帐号的密码,支持公共变量${$config.变量id}'
              >
                {getFieldDecorator('dbpwd', { rules: [{ required: false }], initialValue: '${$config.kettle.dbPwd}' })
                  (
                    (<Input />)
                  )}
              </FormItem>
          </TabPane>
          <TabPane  tab="输入变量设置" key="field" >
            <div>
              <VariableRuleNodeParams
                data={this.state.formData.tableColumns}
                parentForm={this.props.form}
                processId={this.processId}
                pNodeId={this.nodeObj.key}
                applicationId={this.applicationId}
                updateFieldMapConfigs={this.updateFieldMapConfigs}
                />
              {"变量值支持取局部变量、全局变量、data数据:${变量id} ${$.data[0].id}"}
            </div>
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当任务运行失败时是否把本节点标记为断言失败?'
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
