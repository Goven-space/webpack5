import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormActions from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

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
        FormUtils.getSerialNumber(this.props.form,"nodeId",'CORE',"CY");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.showUserIds!==undefined && data.showUserIds!==''  && data.showUserIds!==null){
              data.showUserIds=data.showUserIds.split(",");
            }else{
              data.showUserIds=[];
            }
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
              rules: [
                { required: true, message: '请输入唯一ID!' },
                {validator:this.checkExist}
              ],
              validateFirst:true,
              validateTrigger:['onBlur'], //这里是数组
            })
            (<Input placeholder="分类唯一ID保存后不可修改" disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem  label="查看权限"  labelCol={{ span: 4 }}   wrapperCol={{ span: 16 }} help='设定可以查看到本分类的用户,空表示所有用户' >
          {
            getFieldDecorator('showUserIds',{initialValue:this.showUserIds})
            (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
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
