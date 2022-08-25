import React from 'react';
import { Form, Select, Input, Button,Spin,notification,InputNumber,Radio} from 'antd';
import AppSelect from '../../../core/components/AppSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import AceEditor from '../../../core/components/AceEditor';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.Gateway_DATAMAPPING_CATEGORY.save;
const loadDataUrl=URI.Gateway_DATAMAPPING_CATEGORY.getById;
const loadApiDataUrl=URI.NEW_SERVICE.load;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.apiId=this.props.apiId;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadApiConfigData=()=>{
      this.setState({mask:true});
      let url=loadApiDataUrl.replace('{id}',this.apiId);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({mask:false});
            if(this.props.form.getFieldValue("mapDirection")=='OUT'){
              if(data.responseSample==''){AjaxUtils.showInfo("API没有配置输出示例!");return;}
              this.props.form.setFieldsValue({"inputJson":data.responseSample});
            }else{
              if(data.responseSample==''){AjaxUtils.showInfo("API没有配置输入示例!");return;}
              this.props.form.setFieldsValue({"inputJson":data.requestBodySampleStr});
            }
          }
      });
  }

  loadData=()=>{
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
        FormUtils.getSerialNumber(this.props.form,"categoryId",this.appId,"MAPPING");
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.userIds!==undefined && data.userIds!=null){
              data.userIds=data.userIds.split(",");
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
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
          postData.appId=this.appId;
          postData.apiId=this.apiId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
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
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="映射类型"
          help='输出表示对API的结果数据进行映射，输入表示对API的输入参数进行转换'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('mapDirection',{rules: [{ required: true}],initialValue:'OUT'})
          (<RadioGroup  >
            <Radio value='OUT'>输出结果映射</Radio>
            <Radio value='IN'>输入参数映射</Radio>
          </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="配置名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="指定任何有意义的且能描述本配置的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the tagName!' }]
            })
            (<Input/>)
          }
        </FormItem>
        <FormItem
          label="配置唯一id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='本映射配置的唯一Id'
        >
          {
            getFieldDecorator('categoryId', {
              rules: [{ required: true, message: '请输入配置的id' }]})
            (<Input disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="应用帐号"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='表示只有此应用帐号调用API时才进行数据映射和裁剪，空表示所有用户'
        >{
          getFieldDecorator('userIds',{rules: [{ required: false}],initialValue:''})
          (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
        }
        </FormItem>
        <FormItem
          label="保留旧字段"
          help='保留表示所有旧的字段在新数据中不存在时将被全部保留下来'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('extendsData',{rules: [{ required: true}],initialValue:0})
          (<RadioGroup  >
            <Radio value={0}>否</Radio>
            <Radio value={1}>保留</Radio>
          </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="状态"
          help='是否停用本映射转换配置'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('status',{rules: [{ required: true}],initialValue:1})
          (<RadioGroup  >
            <Radio value={1}>启用</Radio>
            <Radio value={0}>停用</Radio>
          </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="测试JSON"
          help={<span>请填写输入JSON示例方便测试转换,<a onClick={this.loadApiConfigData}>从API导入</a></span>}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('inputJson')
          (<AceEditor mode='json' width='100%' height='200px'/>)
          }
        </FormItem>
        <FormItem
          label="返回字段"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          hasFeedback
          help="空表示返回所有,指定要返回的字段可使用JsonPath指定如:$.data"
        >
          {
            getFieldDecorator('returnJsonPath', {
              rules: [{ required: false, message: '' }]
            })
            (<Input/>)
          }
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

export default Form.create()(form);
