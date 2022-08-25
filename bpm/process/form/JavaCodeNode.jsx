import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import EditJavaCode from '../../../core/components/EditJavaCode';

//执行java脚本节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.BPM.CORE_BPM_PROCESSNODE.props;
const SubmitUrl=URI.BPM.CORE_BPM_PROCESSNODE.save; //存盘地址


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeObj=this.props.nodeObj;
    this.eleId=this.props.eldId;
    this.processId=this.props.processId;
    this.pNodeRole='event';
    this.applicationId=this.props.applicationId;
    this.state={
      mask:false,
      formData:{},
      disabledRule:true,
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
              }else{
                this.state.formData.code=this.getDefaultData();
                this.setState({mask:false});
              }
            }
        });
  }

  getDefaultData=()=>{
    const beanId="BPM_"+this.nodeObj.key+"_"+AjaxUtils.guid().toUpperCase();
    const defaultCode=`package cn.restcloud.bpm.rule.ext;

import org.apache.commons.lang3.StringUtils;
import org.bson.Document;
import java.sql.Connection;
import cn.restcloud.framework.core.context.*;
import cn.restcloud.bpm.base.IBPMBaseEvent;
import cn.restcloud.bpm.base.IBPMBaseProcessEngine;
import cn.restcloud.framework.core.util.*;
import cn.restcloud.framework.core.util.db.rdb.*;
import java.util.*;

/**
formDataDoc为表单字段数据
执行成功必须返回字符1,返回0表示失败
*/

public class ${beanId}  implements IBPMBaseEvent {
	@Override
	public String execute(IBPMBaseProcessEngine engine, Document modelNodeDoc, Document formDataDoc) throws Exception {
        PrintUtil.o(formDataDoc);
        String id=formDataDoc.getString("id");
        PrintUtil.o("id="+id);
		return "1";
	}

}
    `;
    return defaultCode;
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
          if(this.refs.editJavaCodeObj){postData.code=this.refs.editJavaCodeObj.getCode();}
          let title=postData.pNodeName;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
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

  //保存代码
  saveEditCode=(classPath,code,ruleData,showMsg)=>{
    this.state.formData.code=code;
    this.onSubmit();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const codeContent=<EditJavaCode ref="editJavaCodeObj"  code={this.state.formData.code} record={this.state.formData} saveEditCode={this.saveEditCode} templateType="ETLJavaCode"  />;

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
                  rules: [{ required: true}],
                  initialValue:this.nodeObj.text
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
                  rules: [{ required: true}],
                  initialValue:this.nodeObj.key
                })
                (<Input  disabled={true} />)
              }
            </FormItem>
            <FormItem label="执行失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当执行失败时是否终止流程运行"
            >
              {getFieldDecorator('compensateFlag',{initialValue:'0'})
              (
                <RadioGroup>
                  <Radio value='0'>跳过</Radio>
                  <Radio value='2'>终止流程</Radio>
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
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
              保存
            </Button>
              {' '}
              <Button onClick={this.props.close.bind(this,false)}  >
                关闭
              </Button>
          </FormItem>
        </TabPane>
        <TabPane  tab="Java脚本" key="ruleEditor" >
          {codeContent}
        </TabPane>
      </Tabs>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
