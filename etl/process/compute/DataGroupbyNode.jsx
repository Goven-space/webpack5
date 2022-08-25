import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//数据分组

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl=URI.ETL.PROCESSNODE.selectNode; //节点选择
const SelectNodeFieldUrl=URI.ETL.PROCESSNODE.prevnodeColumnsSelect;

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
      formData:{tableColumns:[]},
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
                if(data.groupbyFieldIds){data.groupbyFieldIds=data.groupbyFieldIds.split(",");}
                if(data.groupbyComputeFieldIds){data.groupbyComputeFieldIds=data.groupbyComputeFieldIds.split(",");}
                this.setState({formData:data});
                FormUtils.setFormFieldValues(this.props.form,data);
              }
            }
        });
  }

  onSubmit = (closeFlag) => {
    let groupbyType=this.props.form.getFieldValue("groupbyType");
    // console.log(groupbyType);
    if(groupbyType!=='1'){
      let groupbyComputeFieldId=this.props.form.getFieldValue("groupbyComputeFieldId");
      // console.log(groupbyComputeFieldId);
      if(groupbyComputeFieldId==='' || groupbyComputeFieldId===undefined){
        if(groupbyType==='2'){
          AjaxUtils.showError("请指定一个求和字段!");
        }else{
          AjaxUtils.showError("请指定一个平均值字段!");
        }
        return;
      }
    }
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

  loadNodeColumns=()=>{
    //载入数据库表
    let dataNodeId=this.props.form.getFieldValue("dataNodeId");
    let url=SelectNodeFieldUrl+"?processId="+this.processId+"&nodeId="+dataNodeId;
    if(dataNodeId===''||dataNodeId===undefined){AjaxUtils.showError("请先指定数据所在节点!");return;}
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("字段载入成功!");
            this.setState({tableColumns:data,mask:false});
          }
    });
  }

  groupbyTypeChange=(v)=>{
    if(v==='2'){
      this.props.form.setFieldsValue({"computeResultFieldId":'sum'});
    }else if(v==='3'){
      this.props.form.setFieldsValue({"computeResultFieldId":'avg'});
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let tableColumnsOptionsItem=[];
    if(this.state.tableColumns instanceof Array){
      tableColumnsOptionsItem = this.state.tableColumns.map(item => <Option key={item.value}>{item.value}</Option>);
    }
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
              <FormItem label="分组模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定分组运算模式(最小和最大运算支持数字和时间比较)'
              >
                {getFieldDecorator('groupbyType',{rules: [{ required: true}],initialValue:'1'})
                (
                  (<Select  onChange={this.groupbyTypeChange}>
                  <Option value='1'>标准Groupby分组(记录数)</Option>
                  <Option value='2'>Groupby分组并对指定字段求和</Option>
                  <Option value='3'>Groupby分组并对指定字段求平均值</Option>
                  <Option value='4'>Groupby分组并对指定字段求最小值</Option>
                  <Option value='5'>Groupby分组并对指定字段求最大值</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem
                label="数据所在节点"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择分组数据来源节点(可自动读取数据字段配置)'
              >
                {
                  getFieldDecorator('dataNodeId', {
                    rules: [{ required: false}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true}} />)
                }
              </FormItem>
              <FormItem
                label="指定分组字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                help='指定要进行分组的字段,输入字段Id后回车'
              >
                <Row gutter={1}>
                  <Col span={17}>
                      {
                        getFieldDecorator('groupbyFieldIds',{rules: [{ required: true}]})
                        (<Select mode='tags' >
                          {tableColumnsOptionsItem}
                        </Select>)
                      }
                  </Col>
                  <Col span={7}>
                    <Button  onClick={this.loadNodeColumns}  >
                      <Icon type="search" />载入字段
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem
                label="计算字段Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                style={{display:this.props.form.getFieldValue("groupbyType")==='1'?'none':''}}
                help='进行分组求和、平均值、最小值、最大值时请指定计算字段Id'
              >
                <Row gutter={1}>
                  <Col span={17}>
                      {
                        getFieldDecorator('groupbyComputeFieldId',{rules: [{ required: false}]})
                        (<Select >
                          {tableColumnsOptionsItem}
                        </Select>)
                      }
                  </Col>
                  <Col span={7}>
                    <Button  onClick={this.loadNodeColumns}  >
                      <Icon type="search" />载入字段
                    </Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem
                label="计算结果字段Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='(求和、平均值、最小值、最大值)后的存储字段Id'
                style={{display:this.props.form.getFieldValue("groupbyType")==='1'?'none':''}}
              >{
                getFieldDecorator('computeResultFieldId')
                (<Input />)
                }
              </FormItem>
              <FormItem
                label="总数记录数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='分组后总记录数的结果字段Id'
              >{
                getFieldDecorator('totalFieldId',{initialValue:'total'})
                (<Input />)
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
