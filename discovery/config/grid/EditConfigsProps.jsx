import React from 'react';
import {Icon,Tag,Button,Input,Modal,Form,Card,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const LIST_URL=URI.LIST_CONFIG_CENTER.listProps;
const SAVE_URL=URI.LIST_CONFIG_CENTER.saveProps;
const listAllEnvUrl=URI.CORE_ENVIRONMENTS.listAll;
const listAllAppUrl=URI.LIST_CONFIG_APPLICATION.listAll;

class form extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      data:{}
    }
  }


  saveConfig=()=>{
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
          this.setState({mask:true});
          AjaxUtils.post(SAVE_URL,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("成功保存("+data.msg+")条配置数据,需要在待发布列表中发布后才能生效!");
              }
          });
      }
    });
  }

  loadProps=()=>{
    let environment=this.props.form.getFieldValue("environment");
    let configAppId=this.props.form.getFieldValue("configAppId");
    let publicConfig=this.props.form.getFieldValue("publicConfig");
    this.setState({loading:true});
    AjaxUtils.post(LIST_URL,{configAppId:configAppId,environment:environment,publicConfig:publicConfig},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        console.log(data.props);
        this.props.form.setFieldsValue({props:data.props});
      }
    });
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 }};

    return (
      <Card title="编辑配置">
        <Form>
          <FormItem
            label="发布环境"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help="选择应用配置所适用的环境"
          >
            {
              getFieldDecorator('environment', {
                rules: [{ required: true}]
              })
              (<AjaxSelect  url={listAllEnvUrl}  options={{showSearch:true,style:{minWidth:'80px'}} } valueId="configId" textId="configId" style={{minWidth:'250px'}} />)
            }
          </FormItem>
          <FormItem
            label="发布应用"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help='选择本配置要发布的应用,ALL表示属于所有应用的公共配置'
          >{
            getFieldDecorator('configAppId', {rules: [{ required: true}]})
            (<AjaxSelect  url={listAllAppUrl}  options={{showSearch:true,style:{minWidth:'120px'}} }  valueId="configAppId" textId="configAppId" />)
            }
          </FormItem>
          <FormItem
            label="查看选项"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help='是否包含公共配置部分'
          >{
            getFieldDecorator('publicConfig',{initialValue:"Y"})
            (
              <RadioGroup>
                <Radio value="Y">是</Radio>
                <Radio value="N">否</Radio>
              </RadioGroup>)
            }
          </FormItem>
          <FormItem
            label="配置属性"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help="按属性文件格式批量保存配置格式:configId=value每行一个"
          >{
            getFieldDecorator('props' ,{rules: [{ required: true}]})
            (<Input.TextArea  rows={20} />)
            }
          </FormItem>
          <FormItem wrapperCol={{ span: 16, offset: 4 }}>
            <Button type="primary" onClick={this.saveConfig}  >
              保存配置
            </Button>{' '}
            <Button  onClick={this.loadProps}  >
              查看已有配置
            </Button>{' '}
          </FormItem>
        </Form>
      </Card>
    );
  }
}

const EditConfigsProps = Form.create()(form);
export default EditConfigsProps;
