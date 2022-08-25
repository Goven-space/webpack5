import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormActions from '../../utils/FormUtils';
import TreeNodeSelect from '../../components/TreeNodeSelect';

const FormItem = Form.Item;
const loadDataUrl=URI.CORE_CATEGORYNODE.getById;
const saveDataUrl=URI.CORE_CATEGORYNODE.save;
const validateUrl=URI.CORE_CATEGORYNODE.validate;
const asynGetSelectControlJson=URI.CORE_CATEGORYNODE.asynGetSelectControlJson;

class form extends React.Component{
  constructor(props){
    super(props);
    this.rootName=this.props.rootName;
    this.id=this.props.id;
    this.parentNodeId=this.props.parentNodeId;
    this.categoryId=this.props.categoryId;
    this.treeNodeSelctUrl=asynGetSelectControlJson+"?categoryId="+this.categoryId+"&rootName="+this.rootName;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormActions.setFormFieldValues(this.props.form,data);
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
          postData.categoryId=this.categoryId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
		if(!value){
			callback([new Error('请填写唯一的节点ID!')]);
		}
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
          label="上级节点"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('parentNodeId',
              {
                rules: [{ required: true, message: '请选择上级节点!' }],
                initialValue:this.props.parentNodeId||'root',
              }
            )
            (<TreeNodeSelect  url={this.treeNodeSelctUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="节点名称"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('nodeText', {
              rules: [{ required: true, message: '请输入节点名称!' }]
            })
            (<Input placeholder="节点名称" />)
          }
        </FormItem>
        <FormItem
          label="节点ID"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',{
              rules: [{validator:this.checkExist}],
              validateTrigger:['onBlur'], //这里是数组
            })
            (<Input placeholder="节点唯一ID保存后不可修改" disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="同级排序"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sort', {
              rules: [{ required: true}],
              initialValue:'1',
            })
            (<InputNumber min={1} />)
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

const NewCategoryNode = Form.create()(form);

export default NewCategoryNode;
