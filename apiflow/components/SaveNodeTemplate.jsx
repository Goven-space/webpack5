import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,InputNumber,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';

//保存为节点模板

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.ESB.CORE_ESB_NODETEMPLATE.save; //存盘地址
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.getNodeFormData=this.props.getNodeFormData;
    this.categoryUrl=TreeMenuUrl+"?categoryId="+this.appId+".nodeTemplateCategory&rootName=自定义节点分类";
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    let data=this.getNodeFormData();
    this.props.form.setFieldsValue({templateName:data.pNodeName});
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData=this.getNodeFormData();
          postData.templateName=this.props.form.getFieldValue("templateName");//模板名称
          postData.overData=this.props.form.getFieldValue("overData");//是否覆盖
          postData.categoryId=this.props.form.getFieldValue("categoryId");//所属分类id
          postData.templateTip=this.props.form.getFieldValue("templateTip");//备注
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                this.props.close(true);
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
      <Form onSubmit={this.onSubmit} >
            <FormItem
              label="指定分类"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="指定本节点要保存的分类"
            >
              {
                getFieldDecorator('categoryId', {
                  rules: [{ required: true}]
                })
                (<TreeNodeSelect  url={this.categoryUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
              }
            </FormItem>
            <FormItem
              label="模板名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              {
                getFieldDecorator('templateName', {
                  rules: [{ required: true}]
                })
                (<Input  />)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='一句话说明节点的用途'
            >
              {
                getFieldDecorator('templateTip', {
                  rules: [{ required: false}]
                })
                (<Input  />)
              }
            </FormItem>
            <FormItem label="是否覆盖" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="覆盖名称相同的节点"
            >
              {getFieldDecorator('overData',{initialValue:'1'})
              (
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 8, offset: 4 }}>
              <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
                保存
              </Button>
                {' '}
                <Button onClick={this.props.close.bind(this,false)}  >
                  关闭
                </Button>
            </FormItem>
      </Form>
      </Spin>
    );
  }
}

const SaveNodeTemplate = Form.create()(form);

export default SaveNodeTemplate;
