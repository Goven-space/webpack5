import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//提交版本

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.ESB.VERSION.save;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.processId=this.processId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功,可在流程列表的+号中看到历史版本记录!");
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
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large">
          <TabPane  tab="另存为一个历史版本" key="props"  >
            <FormItem
              label="版本说明"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('commitMsg',{
                rules: [{ required: true}],
                initialValue:''
              })
              (
                <Input.TextArea  style={{minHeight:'320px',maxHeight:'600px'}}   />
              )}
            </FormItem>
          </TabPane>
        </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >提交</Button>{' '}
            <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
          </FormItem>
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
