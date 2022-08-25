import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//流程直接生成服务API

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.ESB.CORE_ESB_CONFIG.publish; //发布API的url
const ListAppServiceCategroyUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.processId=this.props.processId;
    this.configId=this.props.configId; //sql配置的id
    this.configName=this.props.configName; //sql配置的名称
    this.applicationId=this.props.applicationId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.applicationId+".ServiceCategory&rootName=服务分类";
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
          postData.executeSqlConfigFlag="true"; //生成 sql配置的id服务
          postData.modelId=this.modelId; //sql配置中选择的所属的数据模型
          postData.applicationId=this.applicationId;
          postData.appId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: 'API生成失败',content:data.msg,width:600});
              }else{
                if(data.msg.indexOf('(0)')!==-1){
                  Modal.error({title: 'API生成失败',content:data.msg+",URI重复或者其他原因!",width:600});
                }else{
                  Modal.info({title: 'API生成结果',content:data.msg+",如果API没有列出请点击刷新按扭!",width:600});
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
        getFieldDecorator('method',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const getByFiltersServiceUrl="/"+this.applicationId.toLowerCase()+"/"+this.configId.toLowerCase();

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="流程Id"
          help='无需修改'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('processId',{initialValue:this.processId})
            (<Input disabled={true} />)
          }
        </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('configName',{rules: [{ required: true}],initialValue:this.configName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="注意:如果URI路径已经存在，系统不会重复发布相同URI的API"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('url',{rules: [{required: true}],initialValue:getByFiltersServiceUrl})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="参数类型"
          help='给多个API节点提交数据时请选择Body请求,查询数据的API可选择Form'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('requestBodyFlag',{initialValue:'true'})
            ( <RadioGroup>
              <Radio value='true'>RequestBody Json字符串</Radio>
              <Radio value='false'>Form Query键值对</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="异步"
          help='指定流程是否异步启动,默认同步模式等待所有API执行完成后返回结果'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('asyncStartFlag',{initialValue:'false'})
            ( <RadioGroup>
              <Radio value='false'>同步模式</Radio>
              <Radio value='true'>异步模式</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="指定字段"
          help='指定返回的数据字段如:$.T0001.data'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('returnJsonPath',{initialValue:''})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="备注"
          help='备注信息'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('remark',{initialValue:''})
            (<Input />)
          }
        </FormItem>
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
