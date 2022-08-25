import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//sftp文件读取

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
              <FormItem label="类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='指定FTP的类型是否为'
              >
                {getFieldDecorator('ftpType',{initialValue:'ftp'})
                (
                  <RadioGroup>
                    <Radio value='ftp'>FTP</Radio>
                    <Radio value='sftp'>SFTP</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="传输模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='被动模式只需要服务器端开放端口给客户端连接,主动模式需要客户端必须开放端口给服务器'
              >
                {getFieldDecorator('enterLocalPassiveMode',{initialValue:'1'})
                (
                  <RadioGroup>
                    <Radio value='0'>主动模式</Radio>
                    <Radio value='1'>被动模式</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="FTP服务器IP"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定FTP的服务器IP'
              >
                {getFieldDecorator('host',{rules: [{ required: true}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="端口"
                help='指定FTP端口'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('port',{rules: [{ required:false}],initialValue:22})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem label="用户名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='FTP用户名,空表示匿名登录'
              >
                {getFieldDecorator('userName',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="密码"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='FTP密码'
              >
                {getFieldDecorator('password',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input type='password' />)
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
          <TabPane  tab="下载文件" key="file"  >
            <FormItem label="FTP文件编码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定FTP服务器端的文件名称的编码'
            >
              {getFieldDecorator('charset',{rules: [{ required: true}],initialValue:'GBK'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="远程FTP目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要下载的FTP所在的目录,目录支持${变量}如:usr\file'
            >
              {getFieldDecorator('sftpFolder',{rules: [{ required: true}],initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="文件后缀"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要下载的文件的后缀多个用逗号分隔,*号表示所有(xml,xlsx,json)'
            >
              {getFieldDecorator('fileExtension',{rules: [{ required: true}],initialValue:'*'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="文件名匹配规则"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='以^开头表示正则表达式,${变量}表示下载变量中指定的文件,空表示下载所有文件'
            >
              {getFieldDecorator('fileNameRule',{rules: [{ required: false}],initialValue:''})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="下载选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='是否仅下载修改时间大于流程最后一次运行时间的文件(注意:SFTP不支持本选项!)'
            >
              {getFieldDecorator('downloadLastModifiedFlag',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="往前偏移时间(秒)"
              help='指定本节点最后运行时间的往前偏移多少秒再与文件修改时间进行对比,0表示不偏移'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:(this.props.form.getFieldValue("downloadLastModifiedFlag")==='1')?'':'none'}}
            >{
              getFieldDecorator('forwardSecond',{rules: [{ required:false}],initialValue:10})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem label="下载后删除" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='下载后删除远程服务器中的文件'
            >
              {getFieldDecorator('deleteFile',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>否</Radio>
                  <Radio value='1'>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="本地存储目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定下载后存储的本地文件,目录支持${变量}'
            >
              {getFieldDecorator('localFolder',{rules: [{ required: true}],initialValue:''})
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
               help='指定未找到下载的文件时是否断言失败'
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
