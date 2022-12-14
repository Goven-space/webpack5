import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const FormItem = Form.Item;
const loadDataUrl=URI.CORE_APPSERVICECATEGORY.GetById;
const saveDataUrl=URI.CORE_APPSERVICECATEGORY.Save;
const validateUrl=URI.CORE_APPSERVICECATEGORY.ValidateNodeId;
const ListTreeSelectDataUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.rootName=this.props.rootName;
    this.id=this.props.id;
    this.parentNodeId=this.props.parentNodeId;
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
    this.treeNodeSelctUrl=ListTreeSelectDataUrl+"?categoryId="+this.categoryId+"&rootName="+this.rootName;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"nodeId",this.appId,"CY");
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
          postData.appId=this.appId;
          postData.categoryId=this.categoryId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.form.resetFields();
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //??????AppId??????????????????
  checkExist=(rule, value, callback)=>{
    let url=validateUrl+"?categoryId="+this.categoryId+"&nodeId="+value+"&id="+this.id;
    AjaxUtils.get(url,(data)=>{
            if(data.state===false){
               callback([new Error('??????Id????????????,??????????????????!')]);
            }else if(data.state===true){
              callback();//?????????????????????
            }else{
              callback([new Error('??????????????????')]);
            }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('parentNodeId',
              {
                rules: [{ required: true, message: '?????????????????????!' }],
                initialValue:this.parentNodeId||'root',
              }
            )
            (<TreeNodeSelect  url={this.treeNodeSelctUrl} labelId='text' valueId='value' options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="????????????"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('nodeText', {
              rules: [{ required: true}]
            })
            (<Input placeholder="????????????" />)
          }
        </FormItem>
        <FormItem
          label="????????????Id"
          {...formItemLayout4_16}
          help='??????id?????????????????????????????????????????????'
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',{
              rules: [{validator:this.checkExist}, { required: true}],
              validateTrigger:['onBlur'], //???????????????
              initialValue:this.appId+".",
            })
            (<Input placeholder="????????????Id" />)
          }
        </FormItem>
        <FormItem
          label="????????????"
          help='???????????????'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sort', {
              rules: [{ required: true}],
              initialValue:'1001',
            })
            (<InputNumber min={1001} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            ??????
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            ??????
          </Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

export default Form.create()(form);
