import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DataCryptFieldConfig from './components/DataCryptFieldConfig';

//数据加解密

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
          let dataType=postData.dataType;
          if(dataType==="1"){dataType="DES加密";}
          else if(dataType==="2"){dataType="DES解密";}
          else if(dataType==="3"){dataType="AES加密";}
          else if(dataType==="4"){dataType="AES解密";}
          else if(dataType==="5"){dataType="Base64编码";}
          else if(dataType==="6"){dataType="Base64解码";}
          else if(dataType==="7"){dataType="MD5加密";}
          else if(dataType==="8"){dataType="UTF-8编码";}
          else if(dataType==="9"){dataType="UTF-8解码";}
          else if(dataType==="10"){dataType="SM3加密";}
          else if(dataType==="11"){dataType="SM4加密";}
          else if(dataType==="12"){dataType="SM4解密";}
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

  updateTableColumns=(data)=>{
    this.state.formData.tableColumns=JSON.stringify(data);
  }

  getNodeIds=()=>{
    let joinNodeIds = this.props.form.getFieldValue("dataNodeId");
    return joinNodeIds;
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
              <FormItem
                label="数据所在节点"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择数据所在节点后可自动读取数据字段配置'
              >
                {
                  getFieldDecorator('dataNodeId', {
                    rules: [{ required: false}]
                  })
                  (<AjaxSelect url={this.selectNodeUrl}  valueId='nodeId' textId='nodeName' options={{showSearch:true}} />)
                }
              </FormItem>
              <FormItem
                label="加解密算法"
                help='SM4配置密码时必须为32位字母加数字'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('dataType',{initialValue:'1'})
                (<Select  >
                  <Option value='1'>DES加密</Option>
                  <Option value='2'>DES解密</Option>
                  <Option value='3'>AES加密</Option>
                  <Option value='4'>AES解密</Option>
                  <Option value='5'>Base64编码</Option>
                  <Option value='6'>Base64解码</Option>
                  <Option value='7'>MD5加密</Option>
                  <Option value='8'>UTF-8编码</Option>
                  <Option value='9'>UTF-8解码</Option>
                  <Option value='10'>SM3加密</Option>
                  <Option value='11'>SM4加密</Option>
                  <Option value='12'>SM4解密</Option>
                </Select>)
                }
              </FormItem>
              <FormItem
                label="密码"
                help='指定加解密的密码'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('password')
                (<Input type='password' />)
                }
              </FormItem>
              <FormItem
                label="范围"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('dataRange',{initialValue:'1'})
                (
                  <RadioGroup>
                    <Radio value='1'>仅对配置字段加解密</Radio>
                    <Radio value='2'>对数据体进行整体加解密</Radio>
                  </RadioGroup>
                )
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
          <TabPane  tab="加解密字段配置" key="event"  >
            <DataCryptFieldConfig
              parentForm={this.props.form}
              processId={this.processId}
              pNodeId={this.nodeObj.key}
              updateTableColumns={this.updateTableColumns}
              tableColumns={this.state.formData.tableColumns}
              getNodeIds={this.getNodeIds}
            />
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
