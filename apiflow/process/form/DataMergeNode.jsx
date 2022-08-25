import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DataMergeNodeConfig from './components/DataMergeNodeConfig';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//数据合并节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl=URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ESB.CORE_ESB_PROCESSNODE.selectNode; //节点选择


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.nodeId=this.nodeObj.key;
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
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
                  responseData:'1',
                };
              }else{
                  data.mergeNodeList=data.mergeNodeList.split(",");
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
          if(this.refs.nodeParamsConfig){
            postData.params=JSON.stringify(this.refs.nodeParamsConfig.getData()); //映射配置json
          }
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

  updateFieldMapConfigs=(data)=>{
    this.state.formData.fieldMapConfig=JSON.stringify(data);
  }

  inserDemo=()=>{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let code=`//resultDocs为所有合并节点的数据集合HashMap<String,Document>
function run(engine,resultDocs){
  var doc=new Document();
  var nodeDoc1=resultDocs.get("T00001"); //节点T10001执行的结果
  var nodeDoc2=resultDocs.get("T00002"); //节点T10002执行的结果
  var lng=JSONPath.read(nodeDoc1.toJson(),"result.location.lng"); //按路径取json中的数据
  var lat=JSONPath.read(nodeDoc1.toJson(),"result.location.lat");
  doc.put("origin",lat+","+lng);//合并结果到后继节点的输入参数中
  lng=JSONPath.read(nodeDoc2.toJson(),"result.location.lng"); //按路径取json中的数据
  lat=JSONPath.read(nodeDoc2.toJson(),"result.location.lat");
  doc.put("destination",lat+","+lng)//合并结果到后继节点的输入参数中
  return doc;
}`;
      codeMirror.setValue(code);
      this.state.formData.mergeCode=code;
  }

  inserDemo2=()=>{
    let codeMirror=this.refs.codeMirror.getCodeMirror();
    let code=`//resultDocs为所有合并节点的数据集合HashMap<String,Document>
function run(engine,resultDocs){
  var doc=new Document();
  var nodeDoc1=resultDocs.get("T00001"); //节点T10001执行的结果
  var nodeDoc2=resultDocs.get("T00002"); //节点T10002执行的结果
  var rows_1=JSONPath.read(nodeDoc1.toJson(),"rows"); //按路径取json中的数据
  var rows_2=JSONPath.read(nodeDoc2.toJson(),"rows"); //按路径取json中的数据
  doc.put("rows1",rows_1);
  doc.put("rows2",rows_2);
  return doc;
}`;
    codeMirror.setValue(code);
    this.state.formData.mergeCode=code;
  }

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.mergeCode=newCode; //sqlcode 存在业务模型的filters字段中
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
                label="选择要合并的节点"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择多个要合并数据的节点，只有选择节点的结果数据全部到达后才会路由到下一节点'
              >
                {
                  getFieldDecorator('mergeNodeList', {
                    rules: [{ required: true}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true,mode:"multiple"}} />)
                }
              </FormItem>
              <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="是否把合并结果输出到API调用端"
              >
                {getFieldDecorator('responseData',{initialValue:'0'})
                (
                  <Select  >
                    <Option value='1'>输出合并结果给调用端</Option>
                    <Option value='0'>不输出合并结果(仅作为下一节点的输入)</Option>
                    <Option value='2'>多次循环时累加合并结果后输出</Option>
                  </Select>
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
          <TabPane  tab="合并配置" key="mapConfig"  >
            <div  style={{display:this.state.formData.requestBodyFlag==='true'?'none':''}} >
              <DataMergeNodeConfig ref='nodeParamsConfig' params={paramsJson} processId={this.processId} nodeId={this.nodeObj.key}  />
            </div>
            <div>示例:使用JsonPath读取多个节点的数据进行合并如:$.T00001.userid,$.T00002.data.username</div>
          </TabPane>
          <TabPane  tab="合并规则" key="event"  >
            <Row>
              <Col span={4} style={{textAlign:'right'}}>合并逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.mergeCode}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                使用规则代码对数据进行合并,合并后的结果数据Document,resultDocs为所有合并节点的数据集合:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo}>合并示例1</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>合并示例2</a> <Divider type="vertical" />{' '}
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

const DataMergeNode = Form.create()(form);

export default DataMergeNode;
