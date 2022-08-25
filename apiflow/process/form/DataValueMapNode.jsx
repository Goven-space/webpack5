import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DataValueMapNodeParams from './components/DataValueMapNodeParams';
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';

//数据值转换节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const selectExportParams=URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.nodeId=this.nodeObj.key;
    this.applicationId=this.props.applicationId;
    this.fieldSelectUrl=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.nodeId;
    this.pNodeRole='event';
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName);
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
              <FormItem label="要转换的数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="指定要进行转换的数据"
              >
                {getFieldDecorator('dataType',{initialValue:'1'})
                (
                  <Select  >
                    <Option value='1'>对流程的最终输出结果数据进行转换</Option>
                    <Option value='2'>仅对上一节点的输出结果进行转换</Option>
                    <Option value='3'>对全局变量中的数据进行转换</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="数据类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="指明要转换的数据类型,如果是数组会对每一行中的字段进行转换"
              >
                {getFieldDecorator('objectType',{initialValue:'object'})
                (
                  <RadioGroup>
                    <Radio value='object'>对象</Radio>
                    <Radio value='array'>数组</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="字段所在层级"
                help="数据所在层级(空表示根层),输出结果层级:$.T00001.data,上一节点输入层级$.data,全局变量层级$.data"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('dataJsonPath',{initialValue:''})
                (<Input     />)
                }
              </FormItem>
              <FormItem label="调试" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="在调试中输出转换前和转换后的数据"
              >
                {getFieldDecorator('debugData',{initialValue:'1'})
                (
                  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='0'>否</Radio>
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
          </TabPane>
          <TabPane  tab="转换配置" key="field" >
            <div>
              <DataValueMapNodeParams
                data={this.state.formData.tableColumns}
                parentForm={this.props.form}
                processId={this.processId}
                pNodeId={this.nodeObj.key}
                applicationId={this.applicationId}
                updateFieldMapConfigs={this.updateFieldMapConfigs}
                />
            </div>
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
