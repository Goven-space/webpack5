import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import PermissionSelect from '../../../core/components/PermissionSelect';

//新增超时预警规则配置

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=6;
    this.appId=this.props.appId||'gateway';
    this.userId=AjaxUtils.getCookie("userId");
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
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.permissionId!==undefined && data.permissionId!==''  && data.permissionId!==null){
              data.permissionId=data.permissionId.split(",");
            }else{
              data.permissionId=[];
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
          postData.securityType=this.securityType;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功，可在规则前面的+号中设定作用范围!");
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
      <Form>
        <Tabs size="large">
          <TabPane  tab="规则基本属性" key="props"  >
            <FormItem
              label="规则名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('configName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="API调用权限"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='本安全策略优先于API中单独指定的权限配置,如果本规则的权限检测不通过将直接返回无权调用提示!'
            >{
              getFieldDecorator('permissionId')
              (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
            }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='数字越小越先执行,如果检测不通过则不再检测后续规则'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:100})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="状态码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='拒绝时返回的HTTP状态码'
            >{
              getFieldDecorator('responseCode',{rules: [{ required: true}],initialValue:403})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="提示内容"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='填写提示内容'
            >{
              getFieldDecorator('message',{rules: [{ required: true}],initialValue:"您没有权限调用本API!"})
              (<Input.TextArea  autosize  />)
              }
            </FormItem>
            <FormItem
              label="状态"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('state',{initialValue:"Y"})
              (            <RadioGroup>
                            <Radio value="Y">启用</Radio>
                            <Radio value="N">停用</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  autosize />)
              }
            </FormItem>
          </TabPane>
        </Tabs>
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

const NewPermissionRule = Form.create()(form);

export default NewPermissionRule;
