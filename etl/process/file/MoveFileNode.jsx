import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//移动,删除，重命名文件

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
    const fileSourceType=this.props.form.getFieldValue("fileSourceType");
    const actionFlag=this.props.form.getFieldValue("actionFlag");

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
                 help='指定文件的来源'
              >
                {getFieldDecorator('fileSourceType',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>前继节点传入的文件列表</Radio>
                    <Radio value='1'>手动指定文件路径</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="文件所在变量Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:fileSourceType==='0'?'':'none'}}
                help='指定文件列表所在变量Id'
              >
                {
                  getFieldDecorator('readFileNodeId', {
                    rules: [{ required: false},{initialValue:'ReadFileList'}]
                  })
                  (<Input />)
                }
              </FormItem>
              <FormItem label="手动指定文件路径"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:fileSourceType==='1'?'':'none'}}
                help='指定一个具体的文件全路径进行移动如：d:/etl/file/test.txt,文件路径支持${变量}'
              >
                {getFieldDecorator('sourceFilePath',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="操作" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='指定要对文件执行的操作'
              >
                {getFieldDecorator('actionFlag',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>移动</Radio>
                    <Radio value='1'>删除</Radio>
                    <Radio value='2'>复制</Radio>
                    <Radio value='3'>重命名</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="目标文件夹"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定一个具体的文件路径作为目标：d:/etl/file,文件路径支持${变量}'
                style={{display:(actionFlag==='0' || actionFlag=='2')?'':'none'}}
              >
                {getFieldDecorator('targetFilePath',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="给文件名追加字符"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='给文件名后面追加固定字符串或者时间格式:字符串_{yyyy-MM-dd HH:mm:ss}'
                style={{display:(actionFlag==='3')?'':'none'}}
              >
                {getFieldDecorator('appendStrToFileName',{rules: [{ required: false}],initialValue:'New_{yyyyMMddHHmmss}'})
                (
                  (<Input />)
                )}
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
