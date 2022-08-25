import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as FormUtils from '../../core/utils/FormUtils';
import RolesSelect from '../../core/components/RolesSelectSigle';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';

//把API发布到Portal门户中

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_APIPORTAL_PUBLISH.publish; //发布API的服务
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const MenuCategoryId="APIPORTAL_MENU_Business"; //业务域所属菜单的固定ID

class form extends React.Component{
  constructor(props){
    super(props);
    this.currentRecord=this.props.currentRecord;
    this.appId=this.currentRecord.appId;
    this.closeModal=this.props.closeModal;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=API分类";
    this.state={
      mask:false,
      formData:this.currentRecord,
    };
  }

  componentDidMount(){
    this.state.formData.updateVisibleUserIdsFlag='0';
    FormUtils.setFormFieldValues(this.props.form,this.state.formData);
  }

  onSubmit = (closeFlag=true) => {
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
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: 'API发布失败',content:data.msg,width:600});
              }else{
                Modal.info({title: 'API发布成功',content:data.msg,width:600});
                this.props.closeModal(true);
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
          label="API所属应用分类"
          {...formItemLayout4_16}
          help='指定本API所属的分类(可以在应用中的API分类中进行管理)'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.appServiceCategroyUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="URL"
          help="注意:如果URI路径已经存在，系统不会重复发布相同URI的API"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('mapUrl',{rules: [{required: true}]})
            (<Input  style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="发布应用"
          help='选择发布到API门户中的应用'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('appId',{rules: [{required: true}],initialValue:''})
            (<Input  disabled={true} />)
          }
        </FormItem>
        <FormItem
          label="发布范围"
          help='同步本应用的下的所有API到API管理平台中'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('publishAction')
          (<Checkbox  value="all" >发布本应用下的所有API</Checkbox>)
          }
        </FormItem>
        <FormItem
          label="更新选项"
          help='是否强制更新API门户中的API信息?默认会自动检测API是否有变化再决定更新!'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('updateAction')
          (<Checkbox  value="1" >强制更新</Checkbox>)
          }
        </FormItem>
        <FormItem
          label="发布说明"
          help='说明本次发布API修改的地方或功能'
          {...formItemLayout4_16}
        >{
          getFieldDecorator('log')
          (<Input.TextArea  style={{maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
