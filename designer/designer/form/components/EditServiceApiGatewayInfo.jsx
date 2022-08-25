import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber} from 'antd';
import AjaxSelect from '../../../components/FormComponents/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

const FormItem = Form.Item;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.CORE_ALIYUNAPI.Detail;
const CreateApi=URI.CORE_ALIYUNAPI.CreateApi;
const DeleteApi=URI.CORE_ALIYUNAPI.DeleteApi;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.appId=this.props.appId;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    if(this.id===undefined || this.id===''){
        this.setState({mask:false});
    }else{
      this.loadData();
    }
  }

  loadData=()=>{
      let url=loadDataUrl+"?serviceId="+this.id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            //字符串转为数组
            if(data.apiDeployedInfo!=='' && data.apiDeployedInfo!==undefined && data.apiDeployedInfo!==null){
              data.apiDeployedInfo=data.apiDeployedInfo.split(",");
            }else{
              data.apiDeployedInfo=[];
            }
            //字符串转为数组
            if(data.apiRequestProtocol!=='' && data.apiRequestProtocol!==undefined && data.apiRequestProtocol!==null){
              data.apiRequestProtocol=data.apiRequestProtocol.split(",");
            }else{
              data.apiRequestProtocol=[];
            }

            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
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
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                AjaxUtils.showInfo("保存成功!");
              }
          });
      }
    });
  }

  onCreate = (closeFlag) => {
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
          this.setState({mask:true});
          AjaxUtils.post(CreateApi,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo(data.msg);
                this.loadData();
              }
          });
      }
    });
  }

  onDelete = (closeFlag) => {
    let apiId=this.state.formData.apiId;
    if(apiId===''){AjaxUtils.showError("本服务还未发布,不能取消!");return;}
    let postData={appId:this.appId,apiId:apiId,serviceId:this.id};
    this.setState({mask:true});
    AjaxUtils.post(DeleteApi,postData,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
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
          label="网关ApiId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >{this.state.formData.apiId===''?'未发布':this.state.formData.apiId}
        </FormItem>
        <FormItem
          label="安全认证"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          help="API安全认证类型"
        >{
          getFieldDecorator('apiAuthType',{rules: [{ required: true}],initialValue:'APP'})
          (<Select>
              <Option value="APP">阿里云APP</Option>
              <Option value="ANONYMOUS">无认证</Option>
              <Option value="APPOPENID">OpenID Connect</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="需要认证token"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='是表示必须先登录获取token然后在调用其他API时需在header的identitytoken参数中传入token'
        >{
          getFieldDecorator('apiIdentitytoken',{initialValue:'Y'})
          (<RadioGroup>
              <Radio value='Y'>是</Radio>
              <Radio value='N'>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="发布类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('apiVisibility',{rules: [{ required: true}],initialValue:'PRIVATE'})
          (<RadioGroup>
              <Radio value='PUBLIC'>公开</Radio>
              <Radio value='PRIVATE'>私有</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="HTTP协议类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
        >{
          getFieldDecorator('apiRequestProtocol',{rules: [{ required: true}],initialValue:'HTTP'})
          (<Select mode='multiple' >
              <Option value="HTTP">HTTP</Option>
              <Option value="HTTPS">HTTPS</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="后端超时"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 4 }}
        >{
          getFieldDecorator('apiServiceTimeout',{initialValue:'3000'})
          (<Input />)
          }
        </FormItem>
        <FormItem
          label="运行环境"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          help='空表示全部下线'
        >{
          getFieldDecorator('apiDeployedInfo',{initialValue:'RELEASE'})
          (<Select mode='multiple' >
              <Option value="RELEASE">线上</Option>
              <Option value="PRE">预发</Option>
              <Option value="TEST">测试</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="云端URL"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.state.formData.ApiDomain}
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button onClick={this.onSubmit} type="primary"  >
            保存
          </Button>{' '}
          <Button onClick={this.onCreate}   >
            同步到API网关
          </Button>{' '}
          <Button onClick={this.onDelete}   >
            从API网关中删除
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const EditServiceApiGatewayInfo = Form.create()(form);

export default EditServiceApiGatewayInfo;
