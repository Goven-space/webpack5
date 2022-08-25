import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import SelectAPI from './SelectAPI';

//新增超时预警规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.scopesave;

class form extends React.Component{
  constructor(props){
    super(props);
    this.currentRecord=this.props.record||{};
    this.id=this.props.id;
    this.state={
      mask:false,
      visible:false,
      formData:{},
    };
  }

  componentDidMount(){
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
          postData.id=this.id;
          postData.scopeId=this.currentRecord.id;
          let url=postData.url;
          if(url.indexOf("{")!==-1 || url.indexOf("}")!==-1){
              AjaxUtils.showInfo("URL中不能包含{变量}路径参数!");
              return;
          }
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
  showModal=(action)=>{
    this.setState({visible: true});
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //服务选择相关函数
  saveSelectedServices=(item)=>{
      //调用子窗口获取已经选中的行
      let selectedRows=this.refs.SelectAPI.getSelectedRows();
      if(selectedRows.length>1 ||selectedRows.length==0){AjaxUtils.showError("每次只能选择一个API接口,如果需要控制多个API可以直接输入匹配的起始路径即可!");return;}
      let formData=this.state.formData;
      formData.title=selectedRows[0].configName;
      formData.url=selectedRows[0].mapUrl;
      this.props.form.setFieldsValue({url:formData.url,title:formData.title});
      this.setState({visible:false});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title='选择API服务' maskClosable={false}
          width='1200px'
          style={{ top: 20, }}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onOk={this.saveSelectedServices}
          cancelText='关闭'
          okText='确定选择'
          >
          <SelectAPI ref='SelectAPI'   closeModal={this.closeModal} />
      </Modal>
      <Form>
        <FormItem
          label="服务名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='任意描述字符串'
        >
          {
            getFieldDecorator('title',{rules: [{ required: true}],initialValue:this.currentRecord.title||''})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="选项"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定与API的关系,排除只能排除其他包含关系中的URL地址"
        >{
          getFieldDecorator('action',{initialValue:this.currentRecord.action||'contain'})
          (    <RadioGroup>
                        <Radio value='contain' >包含</Radio>
                        <Radio value='exclude' >排除</Radio>
                </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="URL"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='指定要匹配的URL路径不能包含根路径,/表示匹配所有,其他路径表示匹配API的开始部分如：/rest/api/v1匹配/rest/api/v1/demo'
        >{
          getFieldDecorator('url',{rules: [{ required: true}],initialValue:this.currentRecord.url||'/'})
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="选择API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
        <Button onClick={this.showModal} >选择一个API</Button>
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
