import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//新增防重复提交规则

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=9;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
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
            data.resubmitMethod=data.resubmitMethod.split(",");
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
              label="检测方法"
              help='要检测的HTTP方法'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('resubmitMethod',{initialValue:"POST"})
              (
                <Select
                   mode="multiple"
                   style={{ width: '100%' }}
                   placeholder="Please select"
                 >
                   <option key='POST'>POST</option>
                   <option key='DELETE'>DELETE</option>
                   <option key='PUT'>PUT</option>
                   <option key='PATCH'>PATCH</option>
                   <option key='GET'>GET</option>
                 </Select>
              )
              }
            </FormItem>
            <FormItem
              label="重复条件"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('resubmitType',{initialValue:1})
              (            <RadioGroup>
                            <Radio value={1}>同一用户相同API相同参数</Radio>
                            <Radio value={3}>同一API相同参数</Radio>
                            <Radio value={2}>唯一提交ID</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="唯一字段Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='提定唯一提交Id的字段id'
              style={{display:this.props.form.getFieldValue('resubmintType')===2?'':'none'}}
            >{
              getFieldDecorator('resubmitNonceId',{rules: [{ required: false}],initialValue:'nonceId'})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="状态码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='拒绝时返回的HTTP状态码'
            >{
              getFieldDecorator('responseCode',{rules: [{ required: true}],initialValue:500})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='填写提示内容'
            >{
              getFieldDecorator('message',{rules: [{ required: true}],initialValue:"禁止重复提交!"})
              (<Input.TextArea  autosize  />)
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

export default Form.create()(form);
