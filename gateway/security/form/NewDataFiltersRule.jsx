import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon,Row,Col,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

//新增数据过滤规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;
const ListBeansByInterfaceUrl=URI.LIST_CORE_BEANS.ListBeansByInterface;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=5;
    this.appId=this.props.appId;
    this.userId=AjaxUtils.getCookie("userId");
    this.dataDirection=this.props.dataDirection;
    this.beanUrl=ListBeansByInterfaceUrl+"?interface=IGatewayDataFilters";
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.dataUserId!==undefined && data.dataUserId!==null && data.dataUserId!==''){
              data.dataUserId=data.dataUserId.split(",");
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.securityType=this.securityType;
          postData.dataDirection=this.dataDirection;
          if(postData.appId==undefined){
            postData.appId=this.appId;
          }
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功，可在规则前面的+号中设定作用范围!");
                this.props.close(true);
              }
          });
      }
    });
  }


        updateCode=(newCode)=>{
          let formData=this.state.formData;
          formData.filtersCode=newCode; //代码
        }

  inserDemo1=()=>{
          let codeMirror=this.refs.codeMirror.getCodeMirror();
          let code=`//如果是响应数据body为后端API返回的数据,doAndView为返回视图对象
//如果是请求数据body为请求的RequestBody数据，docAndView为空值
//普通请求数据用Document dataDoc=RequestUtil.getContextDocument()获取
//如果要终止请求:docAndView.setError();docAndView.setTip("提示");
public String run(String body,DocAndView docAndView)throws Exception{
  //PrintUtil.o("body="+body); //可以打印数据到控制台
  Document dataDoc=JsonUtil.json2doc(body);
  Document newDoc=new Document(); //外面再包一层json
  newDoc.put("data",dataDoc);
  newDoc.put("status",true);
  return JsonUtil.doc2Json(newDoc);
}`;
          codeMirror.setValue(code);
          this.state.formData.filtersCode=code;
        }

    inserDemo2=()=>{
            let codeMirror=this.refs.codeMirror.getCodeMirror();
            let code=`//如果是响应数据body为后端API返回的数据,doAndView为返回视图对象
//如果是请求数据body为请求的RequestBody数据，docAndView为空值
//普通请求数据用Document dataDoc=RequestUtil.getContextDocument()获取
public String run(String body,DocAndView docAndView)throws Exception{
  //PrintUtil.o("body="+body); //可以打印数据到控制台
  Document dataDoc=JsonUtil.json2doc(body);
  dataDoc.put("serviceId",dataDoc.getString("serviceName")); //修改serviceName为serviceId字段
  dataDoc.remove("serviceName");
  return JsonUtil.doc2Json(dataDoc);
}`;
            codeMirror.setValue(code);
            this.state.formData.filtersCode=code;
        }

  inserDemo3=()=>{
                let codeMirror=this.refs.codeMirror.getCodeMirror();
                let code=`//如果是响应数据body为后端API返回的数据,doAndView为返回视图对象
//如果是请求数据body为请求的RequestBody数据，docAndView为空值
public String run(String body,DocAndView docAndView)throws Exception{
  //PrintUtil.o("body="+body); //可以打印数据到控制台
  body=JsonUtil.xml2json(body);
  return body;
}`;
                codeMirror.setValue(code);
                this.state.formData.filtersCode=code;
    }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="规则基本属性" key="props"  >
            <FormItem
              label="规则名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('configName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="选项"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="删除字段和追加字段模式只支持JSON格式的数据字段删除和追加,字符替换适用于所有文本数据,脚本适用于复杂场景"
            >{
              getFieldDecorator('filtersType',{initialValue:0})
              (            <RadioGroup>
                            <Radio value={0}>删除字段</Radio>
                            <Radio value={1}>追加或替换字段</Radio>
                            <Radio value={2}>字符替换</Radio>
                            <Radio value={3}>脚本</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="目标字段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("filtersType")===2||this.props.form.getFieldValue("filtersType")==3?'none':''}}
              help='对JSON数据可以用点号(.)表示层次如：data.userId对应{data:{userId:1}}如果是数组则用[rows].userId对应{rows:[{userId:1},{userId:2}]},如果是普通字符串则只支持替换或脚本模式过滤,多个字段可以用逗号分隔'
            >{
              getFieldDecorator('fieldId',{rules: [{ required: true}],initialValue:'doc.fieldId'})
              (<Input.TextArea  autosize />)
              }
            </FormItem>
            <FormItem
              label="原文本值"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("filtersType")===2?'':'none'}}
              help='指定后端API返回的原字符串，在替换模式下原文体值支持正则表达式可匹配复杂字符串'
            >{
              getFieldDecorator('sourceFieldValue',{initialValue:''})
              (
                <Input.TextArea  autosize />)
              }
            </FormItem>
            <FormItem
              label="替换值"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("filtersType")===0||this.props.form.getFieldValue("filtersType")===3?'none':''}}
              help='指定目标字段的替换字符串'
            >{
              getFieldDecorator('targetFieldValue',{initialValue:''})
              (
                <Input.TextArea  autosize />)
              }
            </FormItem>
            <FormItem
              label="绑定用户"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定本规则适用的用户Id,不指定则表示适用所有用户,注意：只能选择用户Id不能选择部门'
            >{
              getFieldDecorator('dataUserId',{rules: [{ required: false}],initialValue:""})
              (<UserAsynTreeSelect options={{treeCheckable:true}} />)
              }
            </FormItem>
            <FormItem
              label="绑定服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='绑定服务器后只有在指定的服务器上本规则才生效!'
            >{
              getFieldDecorator('bindingServerId')
              (<ListClusterServers options={{showSearch:true}} />)
            }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='数字越小越先执行,如果检测不通过则不再检测后续规则'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:100})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="状态"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('state',{initialValue:"Y"})
              (            <RadioGroup>
                            <Radio value="Y">启用</Radio>
                            <Radio value="N">停用</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  autosize />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="数据转换脚本" key="dataRule"   >
            <FormItem
              label="绑定插件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              help="绑定一个数据转换插件实现数据转换,插件必须继承IGatewayDataFilters接口(绑定插件后脚本将失效)"
            >{
              getFieldDecorator('filtersBeanId')
              (<AjaxSelect url={this.beanUrl} valueId='beanId' textId="beanName" defaultData={{"beanName":'无',"beanId":''}} />)
              }
            </FormItem>
            <Row>
              <Col span={4} style={{textAlign:'right'}}>过滤规则:</Col>
              <Col span={18}>
                <div style={{border:'1px #cccccc solid',minHeight:'280px',margin:'2px',borderRadius:'0px'}}>
                  <CodeMirror ref='codeMirror'
                  value={this.state.formData.filtersCode}
                  onChange={this.updateCode}
                  options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
                  />
              </div>
                请使用标准JAVA语法进行数据过滤:
                <a style={{cursor:'pointer'}} onClick={this.inserDemo1}>数据转换示例1</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>数据转换示例2</a> <Divider type="vertical" />{' '}
                <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>XML转JSON示例</a>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewDataFiltersRule = Form.create()(form);

export default NewDataFiltersRule;
