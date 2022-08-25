import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//新增流程

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.BPM.CORE_BPM_CONFIG.getById;
const SubmitUrl=URI.BPM.CORE_BPM_CONFIG.save; //存盘地址
const ModelSelectUrl=URI.CORE_DATASOURCE.dataModelSelect;
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const listAllAppUrl=URI.BPM.APPLICATION.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.userId=AjaxUtils.getUserId();
    this.applicationId=this.props.applicationId;
    this.categoryId=this.props.categoryId==='缺省分类'?'':this.props.categoryId;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.applicationId+".processCategory&rootName=流程分类";
    this.state={
      mask:false,
      sourceType:'dataModel',
      targetType:'dataModel',
      dataModels:[],
      sqlModels:[],
      beanModels:[],
      filtersBeans:[],
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    if(this.id===undefined || this.id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"FLOW");
        this.setState({mask:false});
    }else{
      let url=GetById.replace("{id}",this.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.processOwners!=undefined){
              data.processOwners=data.processOwners.split(",");
            }
            this.setState({formData:data,sourceType:data.sourceType,targetType:data.targetType});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
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
          postData.pNodeId='process';
          // postData.applicationId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo(data.msg);
                if(closeFlag){
                  this.props.close(true);
                }
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          help='指定本流程所属的应用'
        >
          {
            getFieldDecorator('applicationId',
              {
                rules: [{ required: true}],
                initialValue:this.applicationId
              }
            )
            (<TreeNodeSelect value={this.state.applicationId} labelId='applicationName' valueId='applicationId'  url={listAllAppUrl}   style={{minWidth:'200px',marginRight:'15px',marginLeft:'5px'}} />)
          }
        </FormItem>
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定本流程所属的分类,请在应用配置中管理分类'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.categoryUrl} defaultData={[{title:'缺省分类',value:'all'}]} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="流程名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本流程的说明"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="流程编号"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定流程的唯一编号,所有传输日记数据将以此id作为表名存储"
        >
          {getFieldDecorator('configId', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {getFieldDecorator('state',{initialValue:'1'})
          (
            <RadioGroup>
              <Radio value='1'>启用</Radio>
              <Radio value='2'>发布</Radio>
              <Radio value='0'>禁用</Radio>
            </RadioGroup>
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
