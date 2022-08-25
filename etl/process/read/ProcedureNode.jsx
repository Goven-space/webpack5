import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,AutoComplete,Icon,Checkbox,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ProduceParamsConfig from './components/ProduceParamsConfig';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const connectionsUrl=URI.CORE_DATASOURCE.listAll+"?configType=RDB,Driver";
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const listProcedures=URI.CORE_DESIGNER_PROCEDURE.listProcedures;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

//存储过程节点

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole="source";
    this.state={
      mask:false,
      formData:{},
      procedures:[],
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
                let paramsJson=data.params==undefined?'[]':data.params;
                this.refs.nodeParamsConfig.setData(JSON.parse(paramsJson));
                FormUtils.setFormFieldValues(this.props.form,data);
              }
            }
        });
  }


  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          if(this.refs.nodeParamsConfig){
            postData.params=JSON.stringify(this.refs.nodeParamsConfig.getData()); //映射配置json
          }
          postData.appId=this.appId;
          postData.processId=this.processId;
          postData.pNodeType=this.nodeObj.nodeType;
          postData.pNodeRole=this.pNodeRole;
          this.setState({mask:true});
          let title=postData.pNodeId+"#"+postData.pNodeName;
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

  loadDatabaseProcedure=()=>{
    //载入数据库存储过程
    let dbConnId=this.props.form.getFieldValue("dbConnId");
    this.setState({mask:true});
    AjaxUtils.post(listProcedures,{dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("存储过程载入成功,如果在列表中没有载入可以手工指定存储过程Id");
            this.setState({procedures:data,mask:false});
            this.props.form.setFieldsValue({procedureId:''});
          }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    let procedureOptionsItem =[];
    if(this.state.procedures instanceof Array){
     procedureOptionsItem=this.state.procedures.map(item => <Option key={item.procedureName}>{item.procedureName}</Option>);
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
              label="指定数据库链接"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="执行本存储过程时所使用的数据库链接"
            >
              {
                getFieldDecorator('dbConnId',{initialValue:'default'})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="存储过程的Id"
              {...formItemLayout4_16}
              help='请指定存储过程在数据库中的Id'
            >
              <Row gutter={1}>
                <Col span={12}>
                  {
                    getFieldDecorator('procedureId', {
                      rules: [{ required: true}],
                    })
                    (
                      <AutoComplete filterOption={true} placeholder='请指定存储过程在数据库中的Id' >
                      {procedureOptionsItem}
                      </AutoComplete>
                    )
                  }
                </Col>
                <Col span={12}>
                  <Button  onClick={this.loadDatabaseProcedure}  >
                    <Icon type="search" />载入存储过程
                  </Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem
              label="返回数据集"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='存储过程执行后是否有数据集返回?'
            >{getFieldDecorator('isResult',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="参数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help='存储过程的输入输出参数,参数顺序要与存储过程的输入输出参数顺序对应,参数值支持${变量}作为输入参数'
            >
              <ProduceParamsConfig id={this.id} ref='nodeParamsConfig' form={this.props.form}  ></ProduceParamsConfig>
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

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
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
