import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Modal,Select,Radio,Checkbox,Tag,Tabs,Row,Col} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import AceEditor from '../../../core/components/AceEditor'
import ListRemarks from '../grid/ListRemarks'
import ProcessMonitor from '../../process/ProcessMonitor';

//流程审批表单

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const ReadUrl=URI.BPM.ENGINE.readUrl;


class form extends React.Component{
  constructor(props){
    super(props);
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId||'';
    this.url=ReadUrl+"?processId="+this.processId+"&transactionId="+this.transactionId;
    this.state={
      mask:false,
      visible:false,
      visible_firstnode:false,
      visible_backAnyNode:false,
      returnToMe:0,
      otherUserIds:'',
      data:{
        formDatas:[],
        formFields:[],
        actionIds:[],
        nextRouters:[
                {
                    targetNode:{users:[]}
                }
        ],
        currentNodeConfig:{}
      },
    };
  }

  componentDidMount(){
    this.readProcess();
  }

  //载入表单数据
  readProcess=()=>{
      AjaxUtils.get(this.url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.resultMessage);
          }else{
            this.transactionId=data.transactionId;
            this.setState({data:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data.formDatas);
          }
      });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    //生成所有字段
    let formItemsData=this.state.data.formFields.map((item,index)=>{
        let fieldId=item.fieldId;
        let fieldName=item.fieldName;
        let fieldStatus=item.fieldStatus;
        let defaultValue=this.state.data.formDatas[fieldId];
        let formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
        {getFieldDecorator(fieldId,{rules: [{ required: false}],initialValue:defaultValue})(<Input  />)}
        </FormItem>);
        return formItem;
    });

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Tabs size="large">
        <TabPane  tab="审批表单" key="props"  >
            <Form>
              <FormItem label='事务Id' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
                {this.state.data.transactionId}
              </FormItem>
              <FormItem label='当前节点' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
                {
                  this.state.data.formDatas.currentStatus=='end'?'已结束':
                  (this.state.data.formDatas.wf_currentNodeName||'')+"("+this.state.data.formDatas.wf_authorUserIds+")"
                }
              </FormItem>
              {formItemsData}
            </Form>
          </TabPane>
          <TabPane tab="审批记录" key="remarkList"   >
            <ListRemarks transactionId={this.state.data.transactionId} applicationId={this.state.data.formDatas.applicationId} />
          </TabPane>
          <TabPane tab="图形监控" key="graphMonitor"   >
            <ProcessMonitor processId={this.state.data.processId} transactionId={this.state.data.transactionId} applicationId={this.state.data.formDatas.applicationId} />
          </TabPane>
          <TabPane  tab="表单JSON" key="formConfig"  >
            <AceEditor height={460} onChange={()=>{}}  value={AjaxUtils.formatJson(JSON.stringify(this.state.data))}  />
          </TabPane>
          </Tabs>
      </Spin>
    );
  }
}

export default Form.create()(form);
