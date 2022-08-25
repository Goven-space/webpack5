import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber,AutoComplete} from 'antd';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../core/components/UserAsynTreeSelect';

const FormItem = Form.Item;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.loadResponseSample;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
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
      let url=loadDataUrl.replace('{id}',this.id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.responseSample!==undefined && data.responseSample!==null){
              data.responseSample=AjaxUtils.formatJson(data.responseSample);
              data.failResponseSample=AjaxUtils.formatJson(data.failResponseSample);
            }
            if(data.requestBodyDataType==='' || data.requestBodyDataType===undefined){
              data.requestBodyDataType="JSON";
            }
            if(data.visibleUserIds!==undefined && data.visibleUserIds!==null){
              data.visibleUserIds=data.visibleUserIds.split(",");
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
          // postData=Object.assign({},this.state.formData,postData); 这里不能合并
          postData.id=this.id; //API的唯一id
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
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
          label="热门API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='是否设置并显示到热门API列表中'
        >{
            getFieldDecorator('hotFlag',{initialValue:0})
            (<RadioGroup>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="推荐API"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='是否设置并显示到推荐API列表中'
        >{
            getFieldDecorator('recommendFlag',{initialValue:0})
            (<RadioGroup>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="API显示图标"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='是否设置并显示到推荐API列表中,空表示使用缺省图标如:/res/images/api.png'
        >{
            getFieldDecorator('iconUrl',{initialValue:''})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="API价格(元)"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 6 }}
          help='是否设置每次API调用的价格,方便计费时使用,0表示免费'
        >{
            getFieldDecorator('price',{initialValue:'0'})
            (<Input  />)
          }
        </FormItem>
        <FormItem
          label="API可见范围"
          help="选择能在API门户中查看本API文档的用户,空表示所有用户"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('visibleUserIds')
            (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
          }
        </FormItem>
        <FormItem
          label="Produces ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="指定服务返回的数据类型"
        >{
          getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
          (<AutoComplete  >
              <Option value="*">透传注册服务的ContentType</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
              <Option value="application/x-msdownload;charset=utf-8">application/octet-stream;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem
          label="RequestBody参数类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.formData.requestBodyFlag?'':'none'}}
          help='指定RequestBody请求时的数据类型,默认为单个JSON对象'
        >{
          getFieldDecorator('requestBodyDataType',{initialValue:'JSON'})
          (<Select >
              <Option value="JSON">单个JSON对象</Option>
              <Option value="ARRAY">JSON数组</Option>
              <Option value="STRING">任意字符串</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="RequestBody请求示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.state.formData.requestBodyFlag?'':'none'}}
          help='指定RequestBody请求时的示例JSON或字符串,在API文档中查看或测试时提供参考'
        >{
          getFieldDecorator('requestBodySampleStr')
          (<Input.TextArea autosize style={{minHeight:'60px',maxHeight:'460px'}} />)
          }
        </FormItem>
        <FormItem
          label="调用成功返回示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help='在自动化测试任务中可以作为测试结果是否正确的验证参考值'
        >{
          getFieldDecorator('responseSample')
          (<Input.TextArea autosize style={{minHeight:'120px',maxHeight:'460px'}} />)
          }
        </FormItem>
        <FormItem
          label="调用失败返回示例"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >{
          getFieldDecorator('failResponseSample')
          (<Input.TextArea autosize style={{minHeight:'120px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button onClick={this.onSubmit} type="primary"  >
            保存
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}
export default Form.create()(form);
