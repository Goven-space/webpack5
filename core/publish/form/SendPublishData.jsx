import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,AutoComplete,InputNumber} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

//发布设计到其他服务器中去

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_DATAPUBLISH.send; //发布到目标服务器
const serverInfoUrl=URI.CORE_DATAPUBLISH.serverInfo; //发布到目标服务器

class form extends React.Component{
  constructor(props){
    super(props);
    this.batchIds=this.props.batchIds;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
      AjaxUtils.get(serverInfoUrl,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            data.updateType='true';
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
          postData.batchIds=this.batchIds;
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="目标服务器环境"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="要发布的目标服务器的环境"
        >
          {
            getFieldDecorator('serverName', {
              rules: [{ required: true}]
            })
            (<Input disabled />)
          }
        </FormItem>
        <FormItem
          label="服务器地址"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="要发布的目的服务器的地址"
        >
          {
            getFieldDecorator('serverHost', {
              rules: [{ required: true}]
            })
            (<Input disabled />)
          }
        </FormItem>
        <FormItem
          label="更新方式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='目标服务器的设计已存在时的更新方式'
        >{
          getFieldDecorator('updateType',{initialValue:'true'})
          (<RadioGroup>
              <Radio value='true'>强制更新</Radio>
              <Radio value='false'>跳过更新</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="更新说明"
          help="请添加更新说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark',{
            rules: [{ required: true}]
          })
          (<Input.TextArea autosize />)
          }
        </FormItem>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            发布
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
