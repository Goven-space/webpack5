import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//压缩文件

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
    this.applicationId=this.props.applicationId;
    this.selectNodeUrl=SelectNodeUrl+"?processId="+this.processId+"&nodeType=*";
    this.pNodeRole="source";
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
              <FormItem label="文件来源" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='指定zip文件的来源'
              >
                {getFieldDecorator('zipFileFrom',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>手动指定文件夹或文件</Radio>
                    <Radio value='1'>前继节点读取到的文件列表</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="文件来源变量Id"
                help='指定上一节点的文件列表所在变量Id'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("zipFileFrom")==='1'?'':'none'}}
              >{
                getFieldDecorator('prevNodeReadFileId',{initialValue:'ReadFileList'})
                (<Input />)
                }
              </FormItem>
              <FormItem label="指定源目录或文件"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("zipFileFrom")==='0'?'':'none'}}
                help='指定要压缩的目录或者一个文件的全路径:/etl/file/${变量}'
              >
                {getFieldDecorator('sourceFilePath',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="目标zip文件"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='压缩文件存放的文件名/etl/tagfile/${变量}.zip,注意:源文件和目标文件不能是同一个目录'
              >
                {getFieldDecorator('targetFilePath',{rules: [{ required: false}],initialValue:'/user/test.zip'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="ZIP文件名包含时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='在文件名的结尾包含生成时间,为空表示不包含时间'
              >
                {getFieldDecorator('dateTimeFormat',{rules: [{ required: false}],initialValue:'yyyyMMddHHmmss'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="压缩后文件路径存放变量Id"
                help='指定压缩后的zip文件路径的存放变量将传给后继节点使用'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fileVariableId',{initialValue:'ReadFileList'})
                (<Input />)
                }
              </FormItem>
              <FormItem label="压缩后操作" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='压缩成功后的文件处理模方式'
              >
                {getFieldDecorator('zipAfterAction',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>不处理</Radio>
                    <Radio value='1'>删除文件</Radio>
                    <Radio value='2'>移动文件</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="目标文件目录"
                help='移动到目标文件夹支持${变量}获取变量'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:this.props.form.getFieldValue("zipAfterAction")==='2'?'':'none'}}
              >{
                getFieldDecorator('targetFolder')
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
            <FormItem label="未找到文件时" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定未找到压缩的文件时是否断言失败'
            >
              {getFieldDecorator('notFindFile',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>断言失败</Radio>
                  <Radio value='1'>断言成功</Radio>
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
