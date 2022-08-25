import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';
import DataMergeNodeConfig from './components/DataMergeNodeConfig';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//数据拆分循环节点

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
    this.nodeId=this.nodeObj.key;
    this.processId=this.props.processId;
    this.fieldSelectUrl=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.nodeId;
    this.state={
      mask:false,
      formData:{params:'[]'},
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
              if(JSON.stringify(data)==='{}'){
                data={
                  pNodeName:this.nodeObj.text,
                  pNodeId:this.nodeObj.key,
                  processId:this.processId,
                  pNodeType:this.nodeObj.nodeType,
                  dataFieldId:'',
                  endProcessFlag:'0',
                  second:'0',
                };
              }
              this.setState({formData:data});
              FormUtils.setFormFieldValues(this.props.form,data);
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName,'DataMergeNode');
                }
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let paramsJson=this.state.formData.params==undefined?[]:JSON.parse(this.state.formData.params);
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
                    rules: [{ required: true}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="节点id不能重复"
              >
                {
                  getFieldDecorator('pNodeId', {
                    rules: [{ required: true}]
                  })
                  (<Input disabled={true} />)
                }
              </FormItem>
              <FormItem
                label="节点类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
              >
                {
                  getFieldDecorator('pNodeType', {
                    rules: [{ required: true}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点别名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="别名可以在进行数据请求或者输出时作为JSON的数据标识使用,空值表示使用节点Id作为标识"
              >
                {
                  getFieldDecorator('pNodeAlias', {
                    rules: [{ required: false}]
                  })
                  (<Input   />)
                }
              </FormItem>
              <FormItem
                label="数据体所在字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定要拆分JSON中数组所在字段如:{total:1,data:[]}则指定$.data，数据拆分后会逐条传给后续节点,完成后会设置全局结束变量标识!"
              >{
                getFieldDecorator('dataFieldId',{rules: [{ required: true}],initialValue:''})
                (<AjaxEditSelect  url={this.fieldSelectUrl}   />)
                }
              </FormItem>
              <FormItem
                label="有错误时"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='后继节点执行错误时是否终止流程'
              >
                {
                  getFieldDecorator('endProcessFlag', {
                    rules: [{ required: false}]
                  })
                  (            <RadioGroup>
                                <Radio value='1'>终止流程</Radio>
                                <Radio value='0'>忽略错误</Radio>
                                <Radio value='2'>正向补偿</Radio>
                              </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="间隔时间(毫秒)"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定每条数据传输的间隔时间,可保护后继API的执行性能'
              >{
                getFieldDecorator('second',{rules: [{ required: true}],initialValue:100})
                (<InputNumber min={0}  />)
                }
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
