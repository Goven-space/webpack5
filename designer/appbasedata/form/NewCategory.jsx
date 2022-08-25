import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import AppSelect from '../../../core/components/AppSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import EditCategoryColumns from './EditCategoryColumns';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APPBASEDATACATEGORY.save;
const loadDataUrl=URI.CORE_APPBASEDATACATEGORY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        FormUtils.getSerialNumber(this.props.form,"categoryId",this.appId,"DIC");
        this.jsonLoad(''); //设置默认值参数到子控件中去
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
            this.jsonLoad(data.inParams); //设置输入参数到子控件中去
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
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
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  jsonEditChange=(data)=>{
    this.state.formData.inParams=JSON.stringify(data);
  }

  jsonLoad=(jsonStr)=>{
    let jsonObj=[];
      if(jsonStr===undefined || jsonStr===''){
        jsonObj.push({paramsId:"nodeText",paramsName:"数据名称",paramsType:"text",required:true,hidden:false});
        jsonObj.push({paramsId:"nodeId",paramsName:"唯一id",paramsType:"text",required:true,hidden:false});
        jsonObj.push({paramsId:"sort",paramsName:"排序号",paramsType:"number",required:false,hidden:false});
      }else{
        jsonObj=JSON.parse(jsonStr);
      }
      this.refs.editJson.loadParentData(jsonObj); //调用子组件的方法
      this.state.formData.inParams=JSON.stringify(jsonObj); //默认第一次要把paramsValue解码
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="分类名"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="指定任何有意义的且能描述本分类的名称"
        >
          {
            getFieldDecorator('categoryName', {
              rules: [{ required: true, message: 'Please input the tagName!' }]
            })
            (<Input placeholder="分类名" />)
          }
        </FormItem>

        <FormItem
          label="分类唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='保存后不可修改,加上应用id前缀可避免重复'
        >
          {
            getFieldDecorator('categoryId', {
              rules: [{ required: true, message: '请输入分类的id' }]})
            (<Input disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="数据结构"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='本分类的数据结构类型'
        >{getFieldDecorator('treeData',{initialValue:'Y'})
          (
            <RadioGroup>
              <Radio value='Y'>具有层次结构的树</Radio>
              <Radio value='N'>偏平数据</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="字段定义"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.jsonEditDisplay}}
          help='当数据为树型结构时nodeText字段为默认字段,不可删除'
        >{
          (<div>
            <EditCategoryColumns ref="editJson" onChange={this.jsonEditChange} />
           </div>
          )}
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
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

const NewCategory = Form.create()(form);

export default NewCategory;
