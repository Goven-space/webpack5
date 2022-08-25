import React from 'react';
import { Form, Select, Input, Button,Spin,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_VIEWTEMPLATE.getById;
const saveDataUrl=URI.CORE_VIEWTEMPLATE.save;
const validateTemplateIdUrl=URI.CORE_VIEWTEMPLATE.validate;
const RadioGroup = Radio.Group;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId==='AllView'?'':this.props.categoryId;
    this.menuUrl=TreeMenuUrl+"?categoryId="+this.appId+".TemplateCategory&rootName=模板分类";
    this.state={
      mask:true,
      formData:{}
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
        FormUtils.getSerialNumber(this.props.form,"templateId",this.appId,"VIEW");
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
          //console.log(values);
          //console.log(this.props.editRowData);
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
                 this.props.closeTab(true);
              }
          });
      }
    });
  }

  //检测configId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateTemplateIdUrl,callback);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

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
            getFieldDecorator('appId', {rules: [{ required: true, message: 'Please select the appId!' }],
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="所属分类"
          {...formItemLayout4_16}
          help='指定本模板所属的分类'
        >
          {
            getFieldDecorator('templateFolder',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId,
              }
            )
            (<TreeNodeSelect  url={this.menuUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="模板名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本模板的文字"
        >
          {getFieldDecorator('templateName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="templateId"
          {...formItemLayout4_16}
          help='系统自动生成id或者手工指定，如果模板已被引用修改会引起错误'
        >
          {
            getFieldDecorator('templateId' ,{rules: [{ required: true}]})
            (<Input placeholder="模板的唯一id" />)
          }
        </FormItem>
        <FormItem
          label="模板文件"
          {...formItemLayout4_16}
          hasFeedback
          help='可以直接使用硬盘中的模板文件(文件路径在平台参数中可配置),指定文件名后模板代码将失效'
        >
          {
            getFieldDecorator('templateFilePath')
            (<Input placeholder="模板文件名" />)
          }
        </FormItem>
        <FormItem
          label="模板类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >
          {
            getFieldDecorator('templateType',{initialValue:'VelocityView'})
            (<Select>
              <Option value="VelocityView">VelocityView</Option>
              <Option value="FreeMarkerView">FreeMarkerView</Option>
              <Option value="HtmlView">HtmlView</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="允许缓存"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='是否允许服务器缓存模板代码'
        >{getFieldDecorator('cacheFlag',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewTemplate = Form.create()(form);

export default NewTemplate;
