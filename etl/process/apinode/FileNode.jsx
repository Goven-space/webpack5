import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//执行任务的节点属性
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
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
                data={pNodeName:this.nodeObj.text,pNodeId:this.nodeObj.key,processId:this.processId,pNodeType:this.nodeObj.nodeType,
                  readFileType:'*',
                  writeFileFlag:'0',
                  deleteSrcFile:'0',
                  conflictFlag:'1',
                  dataType:'1',
                  appendJsonFile:'0',
                  appendJsonFile:'1'
                };
              }
              // console.log(data);
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag){
                  this.props.close(true,postData.pNodeName);
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
          <TabPane  tab="读取文件" key="props"  >
            <FormItem
              label="节点名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="指定任何有意义且能描述本节点的说明"
            >
              {
                getFieldDecorator('pNodeName', {
                  rules: [{ required: false}]
                })
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="节点Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              {
                getFieldDecorator('pNodeId', {
                  rules: [{ required: true}]
                })
                (<Input  disabled={true} />)
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
                (<Input  />)
              }
            </FormItem>
            <FormItem label="文件路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='空表示不读取,指定文件目录(表示读取目录下的所有文件)也可指定具体的某一个文件路径,可以使用{yyyyMMddHHmm}来动态指定文件名或目录如:d:/file{yyyyMMdd}.rar' >
              {getFieldDecorator('readFilePath',{rules: [{ required: false}],initialValue:''})
              (<Input />)
              }
            </FormItem>
            <FormItem
              label="文件类型"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="*号表示所有文件，其他文件格式用逗号分隔如：json,xml,rar,docx"
            >{
              getFieldDecorator('readFileType',{rules: [{ required: false}],initialValue:"*"})
              (<Input  />)
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
          <TabPane  tab="输出文件" key="write"  >
            <FormItem label="是否输出文件" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='只有选择是才会输出文件' >
              {getFieldDecorator('writeFileFlag',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="文件数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='文件流是指文件节点中读取的文件,数据流是指从数据模型中读取的数据流' >
              {getFieldDecorator('dataType',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>输出读取的文件流</Radio>
                  <Radio value='0'>输出流程中的数据流到json文件</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="输出目录"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定输出文件的目录可以使用{yyyy-MM-dd HH:mm}来动态指定文件目录如:d:/file{yyyy-MM-dd}' >
              {getFieldDecorator('writeFilePath',{rules: [{ required: false}],initialValue:''})
              (<Input />)
              }
            </FormItem>
            <FormItem label="冲突处理"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='1'?'':'none'}}
              help='指定文件写入时的处理策略'
            >
              {getFieldDecorator('conflictFlag',{initialValue:'3'})
              (
                (<Select  >
                <Option value='1'>文件已存在时替换(不存在时写入)</Option>
                <Option value='2'>文件已存在时替换(不存在时跳过)</Option>
                <Option value='3'>文件已存在时跳过(不存在时写入)</Option>
                </Select>)
              )}
            </FormItem>
            <FormItem label="删除原文件" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='1'?'':'none'}}
              help='写入成功后删除源文件' >
              {getFieldDecorator('deleteSrcFile',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="JSON文件名"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='0'?'':'none'}}
              help='空表示系统自动生成,指定输出数据流的JSON文件名可用{yyyy-MM-dd HH:mm}来动态指定文件名如:test{yyyyMMdd}.json' >
              {getFieldDecorator('jsonFileName',{rules: [{ required: false}],initialValue:''})
              (<Input />)
              }
            </FormItem>
            <FormItem label="输出方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("dataType")==='0'?'':'none'}}
              help='如果目标JSON文件已存在' >
              {getFieldDecorator('appendJsonFile',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='0'>先清空再写入</Radio>
                  <Radio value='1'>增量写入(每次追加数据)</Radio>
                </RadioGroup>
              )}
            </FormItem>
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

const FileNode = Form.create()(form);

export default FileNode;
