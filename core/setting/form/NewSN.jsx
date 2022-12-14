import React from 'react';
import { Form, Input, Button,Spin,notification,Card} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const FormItem = Form.Item;
const submitUrl=URI.CORE_APPSETTING.saveSN;
const loadDataUrl=URI.CORE_APPSETTING.getSN;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
      let url=loadDataUrl;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
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
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                this.props.close(true);
              }
          });
      }
    });
  }

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
    <Card title='???????????????'>
      <Form onSubmit={this.onSubmit} style={{minHeight:'400px'}}>
        <FormItem
          label="?????????"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 18 }}
          help='??????????????????????????????,?????????????????????'
        >
          {
            getFieldDecorator('sn', {
              rules: [{ required: true, message: '?????????SN?????????' }]})
            (<Input.TextArea autosize style={{minHeight:'300px'}}/>)
          }
        </FormItem>
        <FormItem
          label="????????????"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 18 }}
          help='???????????????SN???????????????(application.properties)??????'
        >
          {
            getFieldDecorator('filePath')
            (<Input />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 4, offset: 2 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            ??????
          </Button>
          {' '}
        </FormItem>

      </Form>
      </Card>
      </Spin>
    );
  }
}

const NewSN = Form.create()(form);

export default NewSN;
