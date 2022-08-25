import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormActions from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//新增应用分类

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
        FormUtils.getSerialNumber(this.props.form,"nodeId",'ETL',"CATEGORY");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
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
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.categoryId=this.categoryId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
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
      <Form  >
        <FormItem
          label="上级分类"
          {...formItemLayout4_16}
          hasFeedback
          style={{display:'none'}}
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
          label="分类名称"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('nodeText', {
              rules: [{ required: true, message: '请输入应用分类名称!' }]
            })
            (<Input placeholder="分类名称" />)
          }
        </FormItem>
        <FormItem
          label="唯一ID"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',{
              rules: [{ required: true}]
            })
            (<Input placeholder="分类唯一ID保存后不可修改" disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem  label="创建者"  labelCol={{ span: 4 }}   wrapperCol={{ span: 16 }} help='只有创建者和管理员可看到本分类' >
          {
            getFieldDecorator('creator',{initialValue:AjaxUtils.getUserId()})
            (<UserAsynTreeSelect options={{showSearch:true,multiple:false}} />)
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
