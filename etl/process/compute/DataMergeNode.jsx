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

//多流自定义合并数据流

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole='compute';
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.state={
      mask:false,
      formData:{},
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
                  pNodeType:this.nodeObj.nodeType
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
          postData.pNodeRole=this.pNodeRole;
          let title=postData.pNodeId+"#"+postData.pNodeName;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,title,'DataMergeNode');
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
      let code=`//indocs为所有合并节点的数据流集合HashMap<String,List<Document>>
//resultDocs为合并运算后的结果数据集,默认为空集合
function run(engine,indocs,resultDocs){
  var docs_a=indocs.get("T00001"); //节点T10001的数据流List<Document>
  var docs_b=indocs.get("T00002"); //节点T10002的数据流List<Document>
  //以下实现union all合并
  resultDocs.addAll(docs_a);
  resultDocs.addAll(docs_b);
}`;
      codeMirror.setValue(code);
      this.state.formData.mergeCode=code;
  }

  inserDemo2=()=>{
    let codeMirror=this.refs.codeMirror.getCodeMirror();
    let code=`///indocs为所有合并节点的数据流集合HashMap<String,List<Document>>
//resultDocs为合并运算后的结果数据集,默认为空集合
function run(engine,indocs,resultDocs){
  var docs_a=indocs.get("T00001"); //节点T10001的数据流List<Document>
  var docs_b=indocs.get("T00002"); //节点T10002的数据流List<Document>
  //以下实现字段级别的合并
  for(x in docs_a){
  	var doca=docs_a[x];//获取a记录
    var userId=doca.get("userId");
    //循环b集合文档进行数据对比
    for(y in docs_b){
    	var docb=docs_b[y];//获取b记录
      	if(docb.get("userId")===userId){
          doca.put("userId",userId+"_"+docb.get("userName")); //修改a集合的字段
        }
    }
  }
  resultDocs.addAll(docs_a); //返回合并后的数据
  //PrintUtil.o(resultDocs);
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
                label="选择要合并的节点"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择多个要合并的数据流节点，所有合并节点数据流全部达后执行自定义合并逻辑并流转到后继节点'
              >
                {
                  getFieldDecorator('mergeNodeList', {
                    rules: [{ required: true}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true,mode:"multiple"}} />)
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
          <TabPane  tab="合并逻辑" key="event"  >
            <Row>
              <Col span={4} style={{textAlign:'right'}}>数据合并逻辑:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.mergeCode}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                返回合并后的结果数据集合resultDocs:
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
