import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,Tooltip,Tabs,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import PermissionSelect from '../../../core/components/PermissionSelect';
//业务模型中列的事件配置

const FormItem = Form.Item;
const Option = Select.Option;
const columnGetByIdUrl=URI.CORE_DATAMODELS.columnGetById;
const saveDataUrl=URI.CORE_DATAMODELS.columnSaveById;
const TabPane = Tabs.TabPane;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.loadDataUrl=columnGetByIdUrl.replace("{id}",this.id);
    this.state={
      mask:true,
      formData:{},
      saveButtonDisplay:'',
    };
  }

  componentDidMount(){
    if((this.id+" ")<10){
      AjaxUtils.showError("当前列还有没有保存，不能定义事件!");
      this.setState({mask:false,saveButtonDisplay:'none'});
    }else{
      AjaxUtils.get(this.loadDataUrl,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false,saveButtonDisplay:''});
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state==='false'){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
              }
          });
      }
    });
  }

  insertEventCode=()=>{
      let code=`//获取数据并格式化
var state=doc.get("state");
if(state=="1"){
   doc.put("state","男");
}else{
   doc.put("state","女");
}`;
      this.props.form.setFieldsValue({loadEventCode:code});
  }

  insertRestClientCode=()=>{
    let code=`//格式化时间
var srcDatetimeValue=doc.get("datetimeTest");
if(srcDatetimeValue!==null){
  var newDatetimeValue=DateTimeUtil.formatDateTime(DateTimeUtil.string2Date(srcDatetimeValue), "yyyy年MM月dd日");
  doc.put("datetimeTest",newDatetimeValue);
}`;
      this.props.form.setFieldsValue({loadEventCode:code});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let helpBody=`
      `
  ;

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
          <FormItem label='绑定权限' labelCol={{ span: 2 }}  wrapperCol={{ span: 22 }} help='绑定权限后只有此权限的用户才会输出此字段数据,没有权限的用户将隐藏' >
          {
            getFieldDecorator('permissionIds')
            (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
          }
          </FormItem>
          <FormItem
            label="格式化事件"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            help={
              <div>可以对doc数据进行格式化或者读取数据(别名优先)可使用工具类RdbUtil,RdbMapperUtil,RdbDataModelUtil,RestClient读取数据,
              <a onClick={this.insertEventCode}>示例代码1</a> <a onClick={this.insertRestClientCode}>示例代码2</a>
              </div>
            }
          >{
            getFieldDecorator('loadEventCode')
            (<Input.TextArea autosize={{ minRows: 6, maxRows: 26 }} />)
            }
          </FormItem>
        <FormItem wrapperCol={{ span: 8, offset:2 }} style={{display:this.state.saveButtonDisplay}}>
          <Button type="primary"  onClick={this.onSubmit.bind(this,false)}  >
            保存配置
          </Button>
        </FormItem>
       </Form>
      </Spin>
    );
  }
}

const FormColumnEventCode = Form.create()(form);

export default FormColumnEventCode;
