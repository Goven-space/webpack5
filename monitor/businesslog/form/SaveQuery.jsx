import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';


const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_BUSINESSLOG_APPCONFIG.save;

//新增路由分类

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      updateName:""
    };
  }

  componentDidMount(){
    this.setState({"updateName":this.props.updateName})
  }


  onSubmit = (action) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          this.props.close(true,values.kQueryName,1,action);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
      < FormItem label="快捷名称" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {
            getFieldDecorator('kQueryName', {
              rules: [{ required: true, }],
              initialValue:this.state.updateName
            })
            (<Input />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,'new')}  >
            新建
          </Button>
          {' '}
          <Button style={{display:this.state.updateName!==""?"":"none"}} type="primary" onClick={this.onSubmit.bind(this,'edit')}  >
            修改快捷
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
