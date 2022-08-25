import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TxtFileReadNodeColumns from './components/TxtFileReadNodeColumns';

//大文本文件分页读取

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
    const readType=this.props.form.getFieldValue("readType");
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
              <FormItem label="文件来源"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='指定要读取文件的来源,如果读取到多个文件则所有文件的内容追加到前一个文件数据流的最后'
              >
                {getFieldDecorator('readType',{initialValue:'1'})
                (
                  (<Select  >
                  <Option value='1'>指定具体的文件路径</Option>
                  <Option value='5'>上一环节中读取或API上传的文件列表</Option>
                  </Select>)
                )}
              </FormItem>
              <FormItem label="文件路径"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:readType==='1'?'':'none'}}
                help='文件路径中可以使用${变量}来接收上一节点设置的变量参数'
              >
                {getFieldDecorator('fileName',{rules: [{ required: false}],initialValue:'/test.txt'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem label="文件列表所在字段Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:readType==='5'?'':'none'}}
                help='指定文件列表所在的字段Id(如文件监听器节点、文件路径读取节点读取到的文件列表所在的字段Id)'
              >
                {getFieldDecorator('prevNodeReadFileId',{rules: [{ required: false}],initialValue:'ReadFileList'})
                (
                  (<Input />)
                )}
              </FormItem>
              <FormItem
                label="每页读取数"
                help='指定每次分页读取的数据量,0表示一次全部读取'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('pageSize',{rules: [{ required:false}],initialValue:10000})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem
                label="最大读取记录"
                help='限定可最大读取的记录数量,0表示不限制'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('maxReadCount',{rules: [{ required:false}],initialValue:0})
                (<InputNumber min={0}  />)
                }
              </FormItem>
              <FormItem label="读取后操作" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='读取成功后的文件处理模方式'
              >
                {getFieldDecorator('readAfterAction',{initialValue:'0'})
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
                style={{display:this.props.form.getFieldValue("readAfterAction")==='2'?'':'none'}}
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
          <TabPane  tab="文件内容" key="fileBody"  >
            <FormItem label="内容编码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='文件内容编码(根据编码填写utf-8,gbk,unicode等,如果编码不对则会出现中文乱码)'
            >
              {getFieldDecorator('charset',{rules: [{ required: false}],initialValue:'utf-8'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="数据类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='指定文件中的数据类型'
            >
              {getFieldDecorator('dataType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>符号分隔的数据</Radio>
                  <Radio value='2'>JSON格式数据</Radio>
                  <Radio value='3'>XML格式数据</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="内容分隔符"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='1'?'':'none'}}
              help='当文件内容是符号分隔的数据时指定分隔符号(输入tab表示tab键分隔)'
            >
              {getFieldDecorator('separator',{rules: [{ required: false}],initialValue:','})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="清除内容中的空格" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='1'?'':'none'}}
               help='清除字段值两端可能存在的空格'
            >
              {getFieldDecorator('deleteSpace',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="指定JSON路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='2'?'':'none'}}
              help='指定路径后可以读取指定的JSON层次的数据(如:$.data)，空则全部读取'
            >
              {getFieldDecorator('jsonPath',{rules: [{ required: false}],initialValue:'$.data'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="指定XML路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='3'?'':'none'}}
              help='指定路径后可以读取指定的XML层次的数据并转为JSON(如:xml#data)，空则全部读取'
            >
              {getFieldDecorator('xmlPath',{rules: [{ required: false}],initialValue:'xml#data'})
              (
                (<Input />)
              )}
            </FormItem>
            <FormItem label="追加文件名" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
               help='在输出变量中追加读取到的文件名(变量名:ReadFileList)传入下一节点'
            >
              {getFieldDecorator('addFileName',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </TabPane>
          <TabPane  tab="输入字段" key="fieldConfig"  >
              <TxtFileReadNodeColumns form={this.props.form} applicationId={this.applicationId} tableColumns={this.state.formData.tableColumns} processId={this.processId} ref='tableColumns' />
              注意:空表示保留所有字段,如果配置了字段则表示没有配置的字段将不会被读取,CSV文件如果不配置字段则默认第一行为字段名
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
               help='指定未找到读取的文件时是否断言失败'
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
