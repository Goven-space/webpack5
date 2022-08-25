import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';


const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_BUSINESSLOG_APPCONFIG.getById;
const saveDataUrl=URI.CORE_BUSINESSLOG_APPCONFIG.save;

//新增路由分类

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData(); //载入表单数据
  }

  loadData(){
    let id = this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"gatewayAppId","ROUTER","R");
        this.setState({mask:false});
    }else{
      //载入表单数据
      this.setState({mask:true});
      let url=loadDataUrl+"?id="+id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                this.setState({mask:false});
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
      < FormItem label="字段Id" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {
            getFieldDecorator('field', {
              rules: [{ required: true, }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="字段名"   labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {
            getFieldDecorator('fieldDes',{rules: [{ required: true}]})
            (<Input placeholder="字段含义展示在表头"  />)
          }
        </FormItem>

        <FormItem  label="是否为查询条件"   labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {
            getFieldDecorator('queryCondition',{initialValue:'0'})(
              <RadioGroup>
                <Radio value='0'>否</Radio>
                <Radio value='1'>是</Radio>
              </RadioGroup>
            )
          }
            <FormItem  label="控件类型"   
            labelCol={{ span: 4 }} 
            wrapperCol={{ span: 16 }}
            style={{display:this.props.form.getFieldValue("queryCondition")==="1"?"":"none" , marginBottom:'0px'}}>
            {
              getFieldDecorator('queryType',{initialValue:'char'})(
                <RadioGroup>
                  <Radio value='char'>文本框</Radio>
                  <Radio value='date'>时间控件</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem  label="查询类型"   
            labelCol={{ span: 4 }} 
            wrapperCol={{ span: 20 }}
            style={{display:this.props.form.getFieldValue("queryCondition")==="1"?"":"none" , marginBottom:'0px'}}>
            {
              getFieldDecorator('queryConditionType',{initialValue:'eq'})(
                <RadioGroup>
                  <Radio value='eq'>精准查询</Radio>
                  <Radio value='regex'  style={{display:this.props.form.getFieldValue("queryType")!=="date"?"":"none"}}>模糊查询</Radio>
                  <Radio value='gt'>大于查询</Radio>
                  <Radio value='lt'>小于查询</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
        </FormItem>
        <FormItem  label="是否为table表头"  labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
        {
          getFieldDecorator('tableHeader',{initialValue:'0'})(
            <RadioGroup>
              <Radio value='0'>否</Radio>
              <Radio value='1'>是</Radio>
            </RadioGroup>
          )
        }
          <FormItem
            label="表头索引"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 4 }}
            style={{display:this.props.form.getFieldValue("tableHeader")==="1"?"":"none", marginBottom:'0px'}}
          >{
            getFieldDecorator('tableHeaderIndex',{initialValue:100})
            (<InputNumber  />)
          }
          </FormItem>
          <FormItem
            label="表头宽度"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 4 }}
            style={{display:this.props.form.getFieldValue("tableHeader")==="1"?"":"none", marginBottom:'0px'}}
          >{
            getFieldDecorator('tableHeaderWidth',{initialValue:10})
            (<InputNumber min={1}  />)
          }
          </FormItem>
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('describe')
          (<Input.TextArea />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close}>
            取消
          </Button>
        </FormItem>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
