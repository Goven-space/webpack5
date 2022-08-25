import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//数据总量对比

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
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.pNodeRole='compute';
    this.state={
      mask:false,
      formData:{tableColumns:'[]',tableColumns_a:'[]',tableColumns_b:'[]'},
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
          postData.pNodeType=this.nodeObj.nodeType;
          postData.processId=this.processId;
          postData.pNodeRole=this.pNodeRole;
          postData.tableColumns=this.getTableColumns();
          let title=postData.pNodeId+"#"+postData.pNodeName;
          this.setState({mask:true});
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

 //a+b表合并后的记录
  getTableColumns=()=>{
    let a=JSON.parse(this.state.formData.tableColumns_a);
    a.forEach((item,index,array)=>{
      item.tableName="A";
    });
    let b=JSON.parse(this.state.formData.tableColumns_b);
    b.forEach((item,index,array)=>{
      item.tableName="B";
    });
    let c=this.MergeArray(a,b);
    return JSON.stringify(c);
  }

  MergeArray=(arr1,arr2)=>{
      var _arr = new Array();
      for(var i=0;i<arr1.length;i++){
         _arr.push(arr1[i]);
      }
      for(var i=0;i<arr2.length;i++){
          var flag = false;
          var bColId=arr2[i].colId.toLowerCase();
          for(var j=0;j<arr1.length;j++){
              let aColId=arr1[j].colId.toLowerCase();
              if(bColId===aColId){
                  arr1[j].tableName="B";
                  flag=true;//说明b表中的字段已经在a表中存在
                  break;
              }
          }
          if(flag==false){
              _arr.push(arr2[i]);
          }
      }
      return _arr;
  }

  updateTableColumns_a=(data)=>{
    this.state.formData.tableColumns_a=JSON.stringify(data);
  }

  updateTableColumns_b=(data)=>{
    this.state.formData.tableColumns_b=JSON.stringify(data);
  }

  updateTableColumns_join=(data)=>{
  }

  getNodeIds_a=()=>{
    let joinNodeIds = this.props.form.getFieldValue("sourceNodeId_a");
    return joinNodeIds;
  }

  getNodeIds_b=()=>{
    let joinNodeIds = this.props.form.getFieldValue("sourceNodeId_b");
    return joinNodeIds;
  }

  getNodeIds_join=()=>{
    let a = this.props.form.getFieldValue("sourceNodeId_a");
    let b = this.props.form.getFieldValue("sourceNodeId_b");
    return a+","+b;
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
              <FormItem label="对比计算公式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定两个数据流总数的对比模式,条件成立则输出true不成立则输出false'
              >
                {getFieldDecorator('equalType',{rules: [{ required: true}],initialValue:'A=B'})
                (
                  (<Select  >
                  <Option value='A=B'>A等于B</Option>
                  <Option value='A>B'>A大于B</Option>
                  <Option value='A>=B'>A大于等于B</Option>
                  <Option value='A<B'>A小于B</Option>
                  <Option value='A<=B'>A小于等于B</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem
                label="对比结果字段"
                help='对比结果存放在全局变量中的字段Id,结果为true或false'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('resultFieldId',{rules: [{ required: true}],initialValue:'compareResult'})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="指定A节点数据流"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定A数据流所在节点'
              >
                {
                  getFieldDecorator('sourceNodeId_a', {
                    rules: [{ required: true}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true}} />)
                }
              </FormItem>
              <FormItem
                label="A节点字段"
                help='*号表示自动计算总数,指定总数所在字段如:total,默认取最后一行的字段如果要指定其他行可以用fieldId#0'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fieldId_a',{rules: [{ required: true}],initialValue:'*'})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="指定B节点数据流"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定B数据流所在节点'
              >
                {
                  getFieldDecorator('sourceNodeId_b', {
                    rules: [{ required: true}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true}} />)
                }
              </FormItem>
              <FormItem
                label="B节点字段"
                help='*号表示自动计算总数,指定总数所在字段如:total,默认取最后一行的字段如果要指定其他行可以用fieldId#0'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fieldId_b',{rules: [{ required: true}],initialValue:'*'})
                (<Input  />)
                }
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
          </TabPane>
        </Tabs>

        <FormItem wrapperCol={{ span: 4, offset: 20 }} >
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
