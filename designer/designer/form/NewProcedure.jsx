import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,AutoComplete,Icon,Checkbox} from 'antd';
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
const loadDataUrl=URI.CORE_DESIGNER_PROCEDURE.getById;
const saveDataUrl=URI.CORE_DESIGNER_PROCEDURE.save;
const listProcedures=URI.CORE_DESIGNER_PROCEDURE.listProcedures;
const RadioGroup = Radio.Group;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";

//新增存储过程

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.state={
      mask:true,
      formData:{},
      procedures:[],
    };
  }

  componentDidMount(){
    if(this.id===undefined){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl+"?id="+this.id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            let paramsJson=data.params==undefined?[]:data.params;
            this.refs.nodeParamsConfig.setData(paramsJson);
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
            this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                 AjaxUtils.showInfo("保存成功!");
                 if(closeFlag){
                   this.props.closeTab(true);
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
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {rules: [{ required: true, message: 'Please select the appId!' }],
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="存储过程中文说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="任何能描述本存储过程的文字"
        >
          {getFieldDecorator('configName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="指定数据库链接"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="执行本存储过程时所使用的数据库链接"
        >
          {
            getFieldDecorator('dbConnId',{rules: [{required: true}]})
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
          label="返回结果集"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='存储过程是否返回结果集数据'
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
          help='存储过程的输入输出参数,参数顺序要与存储过程的输入输出参数顺序对应'
        >
          <ProduceParamsConfig id={this.id} ref='nodeParamsConfig' form={this.props.form}  ></ProduceParamsConfig>
        </FormItem>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存退出
          </Button>
          {' '}
          <Button type="ghost" onClick={this.onSubmit.bind(this,false)}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewProcedure = Form.create()(form);

export default NewProcedure;
