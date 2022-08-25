import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//下载cos文件到本地目录

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
    this.pNodeRole="target";
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
          try{
            postData.tableColumns=JSON.stringify(this.refs.tableColumns.getTableColumns());
          }catch(e){}
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
              <FormItem label="本地文件目录"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='可以使用${变量}来接收文件存储的目录'
              >
                {getFieldDecorator('filePath',{rules: [{ required: true}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="要下载的文件"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='支持使用${变量},*号表示下载目录下的所有文件,^开始表示匹配正则表达式,其他字符串表示包含文件名'
              >
                {getFieldDecorator('fileName',{rules: [{ required: true}],initialValue:'*'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="下载后文件路径存放变量Id"
                help='指定下载成功后的所有文件路径的列表存放变量将传给后继节点使用'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fileVariableId',{initialValue:'ReadFileList'})
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
          <TabPane  tab="认证配置" key="cosRegion"  >
            <FormItem label="Region"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定COS所在区域'
            >
              {getFieldDecorator('cosRegion',{rules: [{ required: true}],initialValue:'ap-guangzhou'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="bucket"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要存储的bucket'
            >
              {getFieldDecorator('bucket',{rules: [{ required: true}],initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="bucketPath"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要下载bucket中的文件夹路径如:images/,/表示根目录'
            >
              {getFieldDecorator('bucketPath',{rules: [{ required: true}],initialValue:'/'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="SecretId"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='腾讯云帐号的SecretId,支持${$config.变量}取变量值'
            >
              {getFieldDecorator('accessKeyId',{rules: [{ required: true}],initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="SecretKey"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='腾讯云帐号的SecretKey,支持${$config.变量}取变量值'
            >
              {getFieldDecorator('accessKeySecret',{rules: [{ required: true}],initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="结果断言" key="resultAssert"  >
            <FormItem label="执行异常时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当程序运行异常时是否把本节点标记为断言失败?'
            >
              {getFieldDecorator('exceptionAssert',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>断言成功(忽略异常)</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="断言失败时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='当断言失败时是否终止流程执行,如果不终止则交由后继路由线判断'
            >
              {getFieldDecorator('assertAction',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>终止流程</Radio>
                  <Radio value='0'>继续运行后继节点</Radio>
                </RadioGroup>
              )}
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
