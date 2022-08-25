import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';

//数据加密规则

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=3;
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
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    let secretkeyType=this.props.form.getFieldValue('secretkeyType');
    let secretkey=this.props.form.getFieldValue('secretkey');
    if(secretkeyType==='1' && secretkey===''){AjaxUtils.showError('请填写密码!');return;}
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
              label="要加解密的数据"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="对请求数据加解密时只支持RequestBody数据的请求"
            >{
              getFieldDecorator('direction',{initialValue:"OUT"})
              (            <RadioGroup>
                            <Radio value="OUT">返回的数据</Radio>
                            <Radio value="IN">请求的数据</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="加密的数据字段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="空表示全部,使用JsonPath指定字段如:$.data.userid,注意:字段级别加解密只支持JSON报文"
            >{
              getFieldDecorator('secretFieldJsonPath',{initialValue:""})
              (
                <Input />
              )
              }
            </FormItem>
            <FormItem
              label="操作"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('action',{initialValue:"encry"})
              (            <RadioGroup>
                            <Radio value="encry">加密</Radio>
                            <Radio value="decry">解密</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="算法"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('algorithm',{initialValue:"DES"})
              (            <RadioGroup>
                            <Radio value="DES">DES</Radio>
                            <Radio value="AES">AES</Radio>
                            <Radio value="SM4">SM4</Radio>
                            <Radio value="BASE64">BASE64</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="密码选项"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('secretkeyType',{initialValue:"1"})
              (            <RadioGroup>
                            <Radio value="1">指定密码</Radio>
                            <Radio value="2">使用调用用户的加密密码</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="密码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue('secretkeyType')==='1'?'':'none'}}
              help='加解密时的密码如果选择DES或AES算法则密码不能少于8位数'
            >{
              getFieldDecorator('secretkey',{rules: [{ required: true}],initialValue:""})
              (<Input type='password'  />)
              }
            </FormItem>
            <FormItem
              label="绑定服务器"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='绑定服务器后只有在指定的服务器上本规则才生效!'
            >{
              getFieldDecorator('bindingServerId')
              (<ListClusterServers options={{showSearch:true}} />)
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

const NewDataEncryptionRule = Form.create()(form);

export default NewDataEncryptionRule;
