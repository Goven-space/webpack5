import React from 'react';
import { Form, Select, Input, Button,Spin,} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import EditMockColumns from './../grid/EditMockColumns';

const FormItem = Form.Item;
const Option = Select.Option;
const submitUrl=URI.CORE_MOCK_RESPONSE.save;
const loadDataUrl=URI.CORE_MOCK_RESPONSE.getById;
const listMockConfig=URI.CORE_MOCK_MGR.listAllSelect;
const listViewBeansUrl=URI.CORE_MOCK_RESPONSE.listViewBeans;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:true,
      formData:{},
      actionDisplay:'none',
      filtersDisplay:'none',
      bodyDisplay:'',
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
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo("??????????????????,???????????????????????????????????????!");
              }else{
                AjaxUtils.showInfo("????????????!");
                this.props.close(true);
              }
          });
      }
    });
  }

  formatMockData=()=>{
    let value=this.props.form.getFieldValue("responseBody");
    value=AjaxUtils.formatJson(value);
    this.props.form.setFieldsValue({"responseBody":value});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
          hasFeedback
          help='????????????id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
          hasFeedback
          help="??????????????????????????????????????????????????????"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="????????????" />)
          }
        </FormItem>
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
          help={<span>??????????????????????????????????????????????????????????????????JSON <a onClick={this.formatMockData} >?????????JSON</a></span>}
        >
          {
            getFieldDecorator('responseBody',{initialValue:'{"state":true,"msg":"This is a mock message"}'})
            (<Input.TextArea style={{minHeight:'280px',maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            ??????
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            ??????
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewMockData = Form.create()(form);

export default NewMockData;
