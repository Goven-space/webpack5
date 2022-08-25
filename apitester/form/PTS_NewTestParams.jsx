import React from 'react';
import { Form, Select, Input, Button,Spin,Radio} from 'antd';
import AppSelect from '../../core/components/AppSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_PTS_TESTPARAMA.details;
const saveDataUrl=URI.CORE_PTS_TESTPARAMA.save;
const RadioGroup = Radio.Group;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:true,
      formData:{}
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
        this.setState({mask:false});
    }else{
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
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
            this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                 AjaxUtils.showInfo("保存成功!");
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
          label="变量名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本变量的文字"
        >
          {getFieldDecorator('paramName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="变量Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="由英文字母或数据符号组成的唯一id"
        >
          {getFieldDecorator('paramId',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="随机变量"
          help="如果是随机变量请选择是"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('randomFlag',{initialValue:'1'})
          (<RadioGroup>
              <Radio value='1'>是</Radio>
              <Radio value='0'>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="变量值"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="多个值用逗号分隔(如果是随机变量且是多个值是则会随机从本值中拿取一个)${$date}或获取日期,${$dateTime}或获取时间,${$id}获取22位唯一id,${$bean.methodName}可调用javabean方法返回变量"
        >
          {getFieldDecorator('paramValue',{rules: [{ required: true}],initialValue:'${$id}'})
          (<Input.TextArea autosize style={{minHeight:'200px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.close.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
