import React from 'react';
import { Form, Select, Input, Button,Spin,Row,Col} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import DyAjaxSelect from '../../core/components/DyAjaxSelect';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

const FormItem = Form.Item;
const Option = Select.Option;
const submitUrl=URI.CORE_TESTCASEMAPPLAN.save;
const loadDataUrl=URI.CORE_TESTCASEMAPPLAN.getById;
const PlanSelectUrl=URI.CORE_TESTPLAN.select;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id; //已有配置的id,编辑时使用
    this.testCaseId=this.props.testCaseId; //测试用例的id
    this.serviceId=this.props.serviceId; //被测试api的id,如果测试外部的api则为空值
    let code=`//断言测试结果是否正确返回true表示测试成功,false表示测试失败
function assert(responseEntry){
  var r=true;
  var responseBody=responseEntry.getBody();//测试结果JSON字符串
  var responseCode=responseEntry.getResponseCode();//测试返回的http状态码
  var doc=JsonUtil.json2doc(responseBody);//测试结果转为doc对象
  if(DocumentUtil.getString(doc,"state")=="true"){
     r=true;//测试成功
  }else{
     r=false; //测试失败
  }
  return r;
}`;

    this.state={
      mask:false,
      formData:{"code":code},
    };
  }

  componentDidMount(){
    let id=this.id;
    if(id===undefined || id==='' || id===null){
        this.setState({mask:false});
    }else{
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.testCaseId=data.testCaseId;
            this.serviceId=data.serviceId;
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
            codeMirror.setValue(data.code);
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
              if(values[key]!==undefined && values[key]!==null){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.serviceId=this.serviceId;
          postData.testCaseId=this.testCaseId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }


  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.code=newCode;
    this.setState({
      formData: formData,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <FormItem
          label="指定测试任务"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="选择一个要加入的测试任务"
        >
          {
            getFieldDecorator('testPlanId', {
              rules: [{ required: true}]
            })
            (<AjaxSelect url={PlanSelectUrl}  options={{showSearch:true}} />)
          }
        </FormItem>
        <Row>
          <Col span={4}></Col>
          <Col span={16}>
            <div style={{border:'1px #cccccc solid',minHeight:'150px',margin:'2px',borderRadius:'0px'}}>
              <CodeMirror ref='codeMirror'
              value={this.state.formData.code}
              onChange={this.updateCode}
              options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
              />
            </div>
            使用JS语法对结果进行断言,r=ture表示验证成功,r=false表示验证失败,responseEntry为测试结果返回对象,可使用PrintUtil.o()输出变量,使用RdbUtil执行SQL语句进行数据库记录验证
          </Col>
        </Row>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          {this.id===undefined?
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>:''
          }
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewCaseMapPlan = Form.create()(form);

export default NewCaseMapPlan;
