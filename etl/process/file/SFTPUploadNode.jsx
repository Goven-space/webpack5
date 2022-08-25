import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//sftp文件上传

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
    const fileType=this.props.form.getFieldValue('fileType');

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
                  (<Input placeholder='FTP的用户名' />)
                )}
              </FormItem>
              <FormItem label="密码"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='FTP密码'

              >
                {getFieldDecorator('password',{rules: [{ required: false}],initialValue:''})
                (
                  (<Input type='password' placeholder='FTP的密码'  />)
                )}
              </FormItem>
              <FormItem label="FTP模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='需与FTP服务器端进行配合来决定是否开启被动模式'
              >
                {getFieldDecorator('enterLocalPassiveMode',{initialValue:'true'})
                (
                  <RadioGroup>
                    <Radio value='true'>被动模式</Radio>
                    <Radio value='false'>主动模式</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="结束时清空数据流" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='本节点结束时清空内存中的数据流,可以提升内存使用率,清空后数据流不再流入下一节点'
              >
                {getFieldDecorator('clearDataFlag',{initialValue:'1'})
                (
                  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='0'>否</Radio>
                  </RadioGroup>
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
          <TabPane  tab="上传文件" key="file"  >
            <FormItem label="远程FTP目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定要上传的FTP所在的目录,目录支持${变量}'
            >
              {getFieldDecorator('sftpFolder',{rules: [{ required: true}],initialValue:'/etl/test'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="数据上传方式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择数据流上传的方式'
            >
              {getFieldDecorator('fileType',{initialValue:'file'})
              (
                <RadioGroup>
                  <Radio value='file'>本地已存在的文件</Radio>
                  <Radio value='ReadFileList'>前继节点传入的文件列表</Radio>
                  <Radio value='json'>数据流转为JSON文件后上传</Radio>
                  <Radio value='xml'>数据流转为XML文件后上传</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="文件所在变量Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定文件路径所在的变量Id'
              style={{display:fileType==='ReadFileList'?'':'none'}}
            >
              {getFieldDecorator('prevNodeReadFileId',{rules: [{ required: false}],initialValue:'ReadFileList'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="本地文件目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定存储本地文件的目录,目录支持${变量}'
              style={{display:fileType!='ReadFileList'?'':'none'}}
            >
              {getFieldDecorator('localFolder',{rules: [{ required: true}],initialValue:'/'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="文件后缀"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:fileType==='file'?'':'none'}}
              help='指定要上传的文件的后缀多个用逗号分隔,*号表示所有(xml,json,xlsx)'
            >
              {getFieldDecorator('fileExtension',{rules: [{ required: true}],initialValue:'*'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="上传成功后操作" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='上传后对本地文件进行处理'
            >
              {getFieldDecorator('deleteFile',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>不操作</Radio>
                  <Radio value='1'>删除</Radio>
                  <Radio value='2'>移动</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              label="目标文件目录"
              help='移动到目标文件夹支持${变量}获取变量'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("deleteFile")==='2'?'':'none'}}
            >{
              getFieldDecorator('targetFolder')
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
