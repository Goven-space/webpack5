import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message,Radio,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.ETL.FileManager.getById;
const saveDataUrl=URI.ETL.FileManager.save;
const uploadUrl=URI.CORE_FILE.uploadResource;
const deleteUrl=URI.CORE_FILE.deleteFile;
const SelectProcessUrl=URI.ETL.CONFIG.selectProcess;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.applicationId=this.props.applicationId;
    this.SelectProcessUrl=SelectProcessUrl+"?applicationId="+this.applicationId;
    this.state={
      mask:false,
      basePath:'',
      formData:{},
    };
  }

  componentDidMount(){
    this.getBasePath();
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      this.setState({mask:true});
      //载入表单数据
      let url=loadDataUrl+"?id="+id;
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

 getBasePath=()=>{
   let url=URI.CORE_APPPROPERTIES.getConfigValue;
   url=url+"?configId=etl.file.basepath";
   AjaxUtils.get(url,(data)=>{
       if(data.state===false){
         AjaxUtils.showError(data.msg);
       }else{
         this.setState({basePath:data.configValue,mask:false});
       }
   });
 }

  onSubmit = () => {
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
          postData.appId=this.appId;
          postData.applicationId=this.applicationId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.setState({mask:false});
                this.props.close(true);
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
      <Form style={{marginRight:'20px'}}  >
        <FormItem  label="基础路径"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
          <div>{this.state.basePath}</div>
        </FormItem>
        <FormItem  label="文件夹路径"  help='如果目录不存在则会自动创建一个如:/excelfile/2020' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
          {
            getFieldDecorator('filePath',{
             rules: [{ required: true,message:'请指定文件存储的路径'}],
             initialValue:'/'
            })
            (<Input  />)
          }
        </FormItem>
        <FormItem label="选项" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='私有文件夹只有创建者能查看，公共文件夹所有用户均可查看和上传文件'
        >
          {getFieldDecorator('folderType',{initialValue:0})
          (
            <RadioGroup>
              <Radio value={0}>私有文件夹</Radio>
              <Radio value={1}>公共文件夹</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="监听文件夹" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}
          help='如果有文件新增或修改时系统将自动捕获文件并启动ETL流程'
        >
          {getFieldDecorator('monitorFlag',{initialValue:0})
          (
            <RadioGroup>
              <Radio value={0}>否</Radio>
              <Radio value={1}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="指定监听流程"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          style={{display:this.props.form.getFieldValue("monitorFlag")===0?'none':''}}
          help="选择一个文件处理流程"
        >
          {
            getFieldDecorator('processId',{rules: [{ required: false}],initialValue:''})
            (<TreeNodeSelect url={this.SelectProcessUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'title',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem label="自动启动" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}
          style={{display:this.props.form.getFieldValue("monitorFlag")===0?'none':''}}
          help='服务器启动时自动启动本监听'
        >
          {getFieldDecorator('state',{initialValue:0})
          (
            <RadioGroup>
              <Radio value={0}>否</Radio>
              <Radio value={1}>是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="同步启动" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}
          help='同步表示有多个文件同时变更时逐个启动流程进行处理,异步表示为每个文件开始一个流程并行处理'
        >
          {getFieldDecorator('syncFlag',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>同步</Radio>
              <Radio value={false}>异步</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="监听间隔"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='监听文件变化的间隔时间单位毫秒'
          style={{display:this.props.form.getFieldValue("monitorFlag")===0?'none':''}}
        >{
          getFieldDecorator('interval',{rules: [{ required: true}],initialValue:"1000"})
          (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem  label="备注"  labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} >
          {
            getFieldDecorator('remark',{
             rules: [{ required: false,message:'文件夹备注'}],
            })
            (<Input  />)
          }
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
