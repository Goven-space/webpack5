import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';

//发布API服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.LIST_TCPIP_RECORDAPI.publish; //发布API
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.record.appId+".ServiceCategory&rootName=API分类";
    this.state={
      mask:false,
      formData:this.record,
    };
  }

  onSubmit = (closeFlag=true) => {
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showError(data.msg);
              }
              this.props.close(true);
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const QueryMethodType = (
        getFieldDecorator('methodType',{ initialValue:this.record.methodType})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
        >
          {this.record.appId}
        </FormItem>
        <FormItem
          label="API分类"
          {...formItemLayout4_16}
          help='指定发布后本API所属的分类(可以在应用中的API分类中进行管理)'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: true}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.appServiceCategroyUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('configName',{rules: [{ required: true}],initialValue:this.record.configName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="公开URL"
          help="注意:如果URI路径已经存在，系统不会重复发布相同URI的API"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('mapUrl',{rules: [{required: true}],initialValue:this.record.mapUrl})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="Header头配置"
          help='在API注册中创建Header头配置信息'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('createHeaderFlag',{initialValue:0})
            (<RadioGroup >
              <Radio value={0}>否</Radio>
              <Radio value={1}>是</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="后端URL"
          help="注意:系统识别到的后端API地址"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('backendUrl',{rules: [{required: true}],initialValue:this.record.backendUrl})
            (<Input  />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
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

export default Form.create()(form);
