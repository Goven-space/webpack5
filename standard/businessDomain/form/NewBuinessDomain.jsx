import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Select,Radio,Checkbox,Row,Col,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import RolesSelect from '../../../core/components/RolesSelect';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const RadioGroup = Radio.Group;
const Option = Select.Option;

const loadDataUrl=URI.CORE_BusinessDomain.getById;
const saveDataUrl=URI.CORE_BusinessDomain.save;
const treeUrl=URI.CORE_BusinessDomain.treeOptData;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.parentNodeId=this.props.parentNodeId;
    this.categoryId=this.props.categoryId;
    this.state={
      mask:false,
      formData:{},
      FieldsConfig:[],
      isTreeData:'',
      checkedValue:{},
      nodeId:''
    };
  }

  componentDidMount(){
    this.loadFormData(); /* */
  }

  //载入表单数据
  loadFormData=()=>{
    let id=this.id;
    if(id===undefined || id===''){
        this.props.form.setFieldsValue({parentNodeId:this.parentNodeId||'root'});
        FormUtils.getSerialNumber(this.props.form,"nodeId","BU","AREA");
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
          Object.keys(values).forEach((key)=>{
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  let value=this.props.form.getFieldValue(key);
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  //普通字符串
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
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

  updateCode=(newCode)=>{
    let formData=this.state.formData;
    formData.eventCode=newCode; //sqlcode 存在业务模型的filters字段中
    this.setState({
      formData: formData,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="业务域属性" key="props">
            <FormItem key='parentNodeId'  label="上级业务域" {...formItemLayout4_16} hasFeedback>
            {
              getFieldDecorator('parentNodeId',{rules: [{ required: true}]})
              (<TreeNodeSelect url={treeUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}/>)
            }
            </FormItem>
            <FormItem
              label="业务域名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定任何有意义的名称"
            >
              {
                getFieldDecorator('areaName', {
                  rules: [{ required: true}]
                })
                (<Input placeholder="业务域名称" />)
              }
            </FormItem>
            <FormItem
              label="业务域唯一Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="唯一Id不允许重复"
            >
              {
                getFieldDecorator('nodeId', {
                  rules: [{ required: true}]
                })
                (<Input  placeholder="业务域Id" />)
              }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:"1001"})
              (<InputNumber min={1001} />)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
            >
              {
                getFieldDecorator('remark')
                (<Input  />)
              }
            </FormItem>
          </TabPane>
        </Tabs>
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

export default Form.create()(form);
