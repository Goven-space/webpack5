import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,AutoComplete} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//新增流程

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.ETL.CONFIG.getById;
const SubmitUrl=URI.ETL.CONFIG.save; //存盘地址
const ModelSelectUrl=URI.CORE_DATASOURCE.dataModelSelect;
const listBeansUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;
const schedulerSelectUrl=URI.CORE_SCHEDULER_STRATEGY.select;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const SelectProcessUrl=URI.ETL.CONFIG.selectProcess;
const listAllAppUrl=URI.ETL.APPLICATION.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.id=this.props.id;
    this.userId=AjaxUtils.getUserId();
    this.categoryId=this.props.categoryId||"";
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.applicationId+".processCategory&rootName=流程分类";
    this.SelectSubProcessUrl=SelectProcessUrl+"?applicationId="+this.applicationId;
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
          // postData.applicationId=this.applicationId;
          postData.pNodeId='Process';
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
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
          help='指定本流程所属的分类'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect defaultData={[{title:'缺省分类',value:'all'}]} url={this.categoryUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
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
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="流程管理员"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定本流程的管理员,管理员可以修改和监控流程'
        >{
          getFieldDecorator('processOwners',{rules: [{ required: true}],initialValue:this.userId})
          (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
        }
        </FormItem>
        <FormItem label="运行方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {getFieldDecorator('state',{initialValue:'2'})
          (
            <RadioGroup>
              <Radio value='2'>手动触发</Radio>
              <Radio value='1'>定时自动调度</Radio>
              <Radio value='3'>依赖上级流程</Radio>
              <Radio value='0'>禁用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="调度策略"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("state")==='1'?'':'none'}}
          help='注意:如果修改调度时间则必须要在所有集群服务器中重新启停本任务才能生效!'
        >
          {
            getFieldDecorator('expression', {rules: [{ required: false}]})
            (<AjaxSelect  url={schedulerSelectUrl}  options={{showSearch:true,multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="任务调度模式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("state")==='1'?'':'none'}}
          help='集群时指定任务可运行的服务器,可以填写ServerId或IP来指定可运行的服务器多个用逗号分隔'
        >{
          getFieldDecorator('executeServer')
          (<AutoComplete  >
              <Option value="Task">任务队列领取模式(推荐)</Option>
              <Option value="AllServer">所有集群服务器均可同时运行</Option>
              <Option value="SingleServer">只有主服务器可运行(主服务器失败时其他服务器接管)</Option>
              <Option value="Dispatcher">由调度服务器统一调度</Option>
            </AutoComplete>)
          }
        </FormItem>
        <FormItem
          label="指定依赖流程"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="请选择一个要依赖的上级流程,上级流程执行成后立即启动本流程,上级流程失败时不会执行本流程"
          style={{display:this.props.form.getFieldValue("state")==='3'?'':'none'}}
        >
          {
            getFieldDecorator('parentProcessId',{rules: [{ required: false}],initialValue:''})
            (<TreeNodeSelect url={this.SelectSubProcessUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="任务重要性"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='在任务队列模式下可以根据任务重要性来领取任务(10为最高)'
        >{
          getFieldDecorator('taskLevel',{initialValue:1})
          (<InputNumber min={1} max={10}  />)
          }
        </FormItem>
        <FormItem label="任务选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          style={{display:this.props.form.getFieldValue("executeServer")==='Task'?'':'none'}}
          help='如果任务还没有被执行完时是否重复生成任务?'
        >
          {getFieldDecorator('repeatGenerationTask',{initialValue:"1"})
          (
            <RadioGroup>
              <Radio value="1">始终生成</Radio>
              <Radio value="0">不重复产生任务</Radio>
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
