import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';

//MongoDB业务模型

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_DATAMODELS.load;
const saveDataUrl=URI.CORE_DATAMODELS.save;
const validateBeanIdUrl=URI.CORE_DATAMODELS.validate;
const mongodbsUrl=URI.CORE_DATAMODELS.mongodbs;
const connectionsUrl=URI.CORE_DATAMODELS.connections;
const selectDataModels=URI.CORE_DATAMODELS.selectDataModels;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.selectDataModelsByAppId=selectDataModels.replace('{modelType}','E')+"?appId="+this.props.appId;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined){
      FormUtils.getSerialNumber(this.props.form,"modelId",this.appId,"VM");
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
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.dbType='A'; //表过适用所有数据库
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }
    });
  }

  //检测configId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateBeanIdUrl,callback);
  }


  onModelFiltersChange=(data)=>{
    this.state.formData.filters=JSON.stringify(data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {initialValue:this.props.appId})
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="模型类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:'none'}}
        >
          {getFieldDecorator('modelType',{initialValue:'V'})
          (<Select disabled={true}  >
              <Option value="E">实体数据模型</Option>
              <Option value="R">业务数据模型</Option>
              <Option value="V">业务视图</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="视图名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本业务视图的文字"
        >
          {getFieldDecorator('modelName',{
              rules: [{ required: true, message: '请输入视图名称!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="业务视图唯一id"
          {...formItemLayout4_16}
          hasFeedback
          help="唯一id如果已被引用修改id会引起其他设计的引用错误"
        >
          {
            getFieldDecorator('modelId', {rules: [{required: true}]})
            (<Input   />)
          }
        </FormItem>
        <FormItem label="删除冗余字段" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='删除数据在本业务视图中不存在的字段' >
          {getFieldDecorator('deleteNotExistField',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="数据所在层级"
          {...formItemLayout4_16}
          hasFeedback
          help="指定要格式化数据所在层级，空表示根层,其他层使用JsonPath指定如:$.rows"
        >
          {
            getFieldDecorator('dataJsonPath', {rules: [{required: false}]})
            (<Input   />)
          }
        </FormItem>
        <FormItem
          label="绑定数据模型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='可以用来读取数据模型的字段配置(视图模型不支持持久化数据,一般作为VO视图使用)'
        >
          {
            getFieldDecorator('entryModelId', {
              rules: [{ required: false}]
            })
            (<AjaxSelect url={this.selectDataModelsByAppId} options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem
          label="使用说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >业务视图主要用来对API最后输出的JSON数据进行格式化如：用sql脚本发布的API要对输出的字段做一些运算可以在API中绑定业务视图来格式化输出的JSON
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button onClick={this.onSubmit.bind(this,false)}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewViewModel = Form.create()(form);

export default NewViewModel;
