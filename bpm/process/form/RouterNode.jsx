import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//执行任务的节点属性
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.BPM.CORE_BPM_PROCESSNODE.props;
const SubmitUrl=URI.BPM.CORE_BPM_PROCESSNODE.save; //存盘地址

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.state={
      mask:false,
      formData:{},
      filtersBeans:[],
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&nodeId="+this.nodeObj.nodeId;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              if(JSON.stringify(data)==='{}'){
                data={
                  pNodeName:this.nodeObj.text,
                  pNodeId:this.nodeObj.nodeId,
                  processId:this.processId,
                  pNodeType:this.nodeObj.nodeType,
                  sourceId:this.nodeObj.sourceId,
                  targetId:this.nodeObj.targetId,
                  copyData:'0',
                  errorNum:100,
                  commitData:'0',
                  targetDeleteAll:'0',
                  clearProcessMainData:'0',
                  order:0,
                  assertCondition:'0',
                  async:'false',
                };
              }
              // console.log(data);
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
          postData.sourceId=this.nodeObj.sourceId;
          postData.targetId=this.nodeObj.targetId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName,'router');
                }
              }
          });
      }
    });
  }

  updateFieldMapConfigs=(data)=>{
    this.state.formData.fieldMapConfig=JSON.stringify(data);
  }

  inserDemo=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//使用HTTP状态码作为断言条件
function assert(engine,nodeDoc,formDataDoc){
  var result=0;
  var number=formDataDoc.get("number"); //取表单字段作为条件
  if(number>100){
  	result=1; //允许路由
  }
  return result;
}`;
      codeMirror.setValue(code);
      this.state.formData.condition=code;
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.condition=newCode; //sqlcode 存在业务模型的filters字段中
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
                label="路由名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本路由的说明"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: false}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:'none'}}
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
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
              >
              {this.nodeObj.nodeId+",源节点:"+this.nodeObj.sourceId+" 目标节点:"+this.nodeObj.targetId}
              </FormItem>
              <FormItem label="路由类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="始终表示必须执行，单选表示只能选择一条路由，复选表示可多选"
              >
                {getFieldDecorator('routerType',{initialValue:'always'})
                (
                  <RadioGroup>
                    <Radio value='always'>始终</Radio>
                    <Radio value='radio'>单选</Radio>
                    <Radio value='checkbox'>复选</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="默认选中" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="路由是否在显示时默认选中"
              >
                {getFieldDecorator('defaultSelected',{initialValue:'YES'})
                (
                  <RadioGroup>
                    <Radio value='YES'>是</Radio>
                    <Radio value='NO'>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="是否回退线" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="如果是返回路由时系统会自动查找目标节点审批的用户作为审批者"
              >
                {getFieldDecorator('backRouterFlag',{initialValue:'NO'})
                (
                  <RadioGroup>
                    <Radio value='NO'>否</Radio>
                    <Radio value='YES'>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="缺省路由" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="其他条件都不成立时走本路由"
              >
                {getFieldDecorator('defaultRouter',{initialValue:'YES'})
                (
                  <RadioGroup>
                    <Radio value='YES'>是</Radio>
                    <Radio value='NO'>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="显示顺序"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='当有并行分支时数字越小时排在前面'
              >{
                getFieldDecorator('order',{rules: [{ required: false}],initialValue:1})
                (<InputNumber min={0} max={100} />)
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
          <TabPane  tab="路由条件" key="event"  >
            <Row>
              <Col span={4} style={{textAlign:'right'}}>自定义逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.condition}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                返回1表示执行本路由,0表示禁止路由:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>代码示例</a> <Divider type="vertical" />{' '}
              </Col>
            </Row>
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
