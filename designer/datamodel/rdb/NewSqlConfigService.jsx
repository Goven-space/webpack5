import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//SQL配置直接生成服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_DATAMODELS.generateSqlService; //生成sql配置的服务

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.configId=this.props.configId; //sql配置的id
    this.configName=this.props.configName; //sql配置的名称
    this.codeType=this.props.codeType; //代码类型js,sql两种
    this.state={
      mask:false,
      formData:[],
    };
  }

  onSubmit = (closeFlag=true) => {
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
          postData.executeSqlConfigFlag="true"; //生成 sql配置的id服务
          postData.modelId=this.modelId; //sql配置中选择的所属的数据模型
          postData.codeType=this.codeType;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: '服务生成失败',content:data.msg,width:600});
              }else{
                if(data.msg.indexOf('(0)')!==-1){
                  Modal.error({title: '服务生成失败',content:data.msg+",URI重复或者其他原因!",width:600});
                }else{
                  Modal.info({title: '服务生成结果',content:data.msg+",如果API没有列出请点击刷新按扭!",width:600});
                }
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const QueryMethodType = (
        getFieldDecorator('getByFiltersMethodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const getByFiltersServiceUrl="/"+this.appId.toLowerCase()+"/v1/"+this.configId.toLowerCase();

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="脚本Id"
          help='无需修改'
          {...formItemLayout4_16}
          style={{display:this.state.sqlConfigDisplay}}
        >
          {
            getFieldDecorator('sqlConfigId',{initialValue:this.configId})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('getByFiltersServiceName',{rules: [{ required: true}],initialValue:this.configName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="注意:如果URI路径已经存在，系统不会重复发布相同URI的API"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('getByFiltersServiceUrl',{rules: [{required: true}],initialValue:getByFiltersServiceUrl})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem label="事务支持" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='是否支持数据库事务,查询类语句建议选否，更新类语句选是'
        >
          {getFieldDecorator('transaction',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        {this.codeType!=='sql'?'':
            <FormItem
              label="执行方法"
              help='请根据SQL中的insert,update,select选择相应的执行方法,注意:Hive不支持普通SQL分页'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('executeBeanMethodName',{initialValue:'selectList'})
                (<Select  >
                      <Option value="selectOne">selectOne(查询单条符合记录的数据)</Option>
                      <Option value="selectList">selectList(查询多条符合记录的数据)</Option>
                      <Option value="selectListByPage">selectListByPage(普通SQL使用游标分页,支持动态SQL分页)</Option>
                      <Option value="insert">insert(执行插入数据的SQL语句)</Option>
                      <Option value="update">update(执行更新数据的SQL语句)</Option>
                      <Option value="delete">delete(执行删除数据的SQL语句)</Option>
              </Select>)
              }
            </FormItem>
        }
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
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
