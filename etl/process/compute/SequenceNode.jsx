import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//生成序列

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const redisDataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=Redis";

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole='compute';
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
          let seqType=postData.seqType;
          if(seqType==="0"){seqType="计数器生成";}
          else if(seqType==="1"){seqType="数据库生成";}
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
              <FormItem
                label="字段名"
                help='指定生成的序号所在的字段Id,系统将对data中的数据逐行生成此字段的序号'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fieldId',{rules: [{ required:true}],initialValue:'seq'})
                (<Input  />)
                }
              </FormItem>
              <FormItem label="生成方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='指定序列的生成方式(内存方式适合于一个并,其他均适合于多并发)'
              >
                {getFieldDecorator('seqType',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>内存计数器生成</Radio>
                    <Radio value='2'>Redis计数器生成</Radio>
                    <Radio value='1'>数据库生成</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="跳过选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='是否跳过已经存在序号字段的数据行，避免重复生成'
              >
                {getFieldDecorator('skipExistFlag',{initialValue:'1'})
                (
                  <RadioGroup>
                    <Radio value='1'>是</Radio>
                    <Radio value='0'>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="输出序列到API" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='生成的序列输出到API调用端'
              >
                {getFieldDecorator('exportSequenceNo',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="保存到全局变量中" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                 help='生成的所有序列保存到全局变量中方便后继节点使用(全局变量名为:节点Id_SEQLIST)'
              >
                {getFieldDecorator('saveToGlobalVariable',{initialValue:'0'})
                (
                  <RadioGroup>
                    <Radio value='0'>否</Radio>
                    <Radio value='1'>是</Radio>
                  </RadioGroup>
                )}
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
          <TabPane  tab="计数器生成" key="field" disabled={(this.props.form.getFieldValue('seqType')==='1')} >
            <FormItem
              label="指定Redis数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请选择一个Redis数据源"
              style={{display:this.props.form.getFieldValue('seqType')==='2'?"":"none"}}
            >
              {
                getFieldDecorator('redisConnId',{rules: [{ required: false}],initialValue:'redis'})
                (<TreeNodeSelect url={redisDataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="保存序列值"
              help='是表示把最后的序列值保存到系统中下次运行时直接从上次序列值作为开始值,否表示每次从起始值重新计数'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
            {getFieldDecorator('saveSeqFlag',{initialValue:'1'})
            (
              <RadioGroup>
                <Radio value='1'>是</Radio>
                <Radio value='0'>否</Radio>
              </RadioGroup>
            )}
            </FormItem>
            <FormItem
              label="超始值"
              help='指定一个开始值'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('startNum',{rules: [{ required:false}],initialValue:1})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="增长值"
              help='每次增长的数字'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('addNum',{rules: [{ required:false}],initialValue:1})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="最大值"
              help='0表示不限定最大值'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('maxNum',{rules: [{ required:false}],initialValue:0})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="最小位数"
              help='位数不足时前面补0,0表示不限定最小位数'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('minLength',{rules: [{ required:false}],initialValue:0})
              (<InputNumber min={0}  />)
              }
            </FormItem>
            <FormItem
              label="固定前缀"
              help='在序列前面增加固定前缀字符串'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('seqNumStartStr',{rules: [{ required:false}],initialValue:''})
              (<Input   />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="数据库生成" key="db" disabled={(this.props.form.getFieldValue('seqType')==='0' || this.props.form.getFieldValue('seqType')==='2')} >
            <FormItem
              label="指定数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请选择一个数据源"
            >
              {
                getFieldDecorator('dbConnId',{rules: [{ required: false}],initialValue:'default'})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="获取序列的SQL"
              help="请根据不同的数据源输入获取序列的SQL语句(MSSQL:SELECT NEXT VALUE FOR SEQID,MYSQL:SELECT NEXTVAL('SEQID'),ORACLE:select seqid.currval from dual)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sql',{rules: [{ required:false}],initialValue:''})
              (<Input  />)
              }
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 4, offset: 20 }}>
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
