import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';

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
    this.applicationId=this.props.applicationId;
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
        FormUtils.getSerialNumber(this.props.form,"nodeId",this.appId,"CATEGORY");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
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
          postData.applicationId=this.applicationId;
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

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
    let url=validateUrl+"?categoryId="+this.categoryId+"&nodeId="+value+"&id="+this.id;
    AjaxUtils.get(url,(data)=>{
            if(data.state===false){
               callback([new Error('节点Id已经存在,请更换其他值!')]);
            }else if(data.state===true){
              callback();//显示为验证成功
            }else{
              callback([new Error('验证服务异常')]);
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
          label="上级分类"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('parentNodeId',
              {
                rules: [{ required: true, message: '请选择上级分类!' }],
                initialValue:this.parentNodeId||'root',
              }
            )
            (<TreeNodeSelect  url={this.treeNodeSelctUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="分类名称"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('nodeText', {
              rules: [{ required: true}]
            })
            (<Input placeholder="分类名称" />)
          }
        </FormItem>
        <FormItem
          label="分类唯一Id"
          {...formItemLayout4_16}
          help='如果id已被引用修改会引起引用数据错误'
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',{
              rules: [{validator:this.checkExist}, { required: true}],
              validateTrigger:['onBlur'], //这里是数组
              initialValue:this.appId+".",
            })
            (<Input placeholder="节点唯一Id" />)
          }
        </FormItem>
        <FormItem
          label="同级排序"
          help='越小越靠前'
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
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

const NewServiceCategoryNode = Form.create()(form);

export default NewServiceCategoryNode;
