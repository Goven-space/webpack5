import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,DatePicker,Select,Radio,Checkbox} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import moment from 'moment';

//新增认证配置

const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const loadDataUrl=URI.CORE_APPBASEDATA.getById;
const saveDataUrl=URI.CORE_APPBASEDATA.save;
const validateUrl=URI.CORE_APPBASEDATA.validate;
const listAll=URI.CORE_APPBASEDATA.listJson;
const getCategoryUrl=URI.CORE_APPBASEDATACATEGORY.getByCategoryId;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.parentNodeId=this.props.parentNodeId;
    this.categoryId=this.props.categoryId;
    this.treeNodeSelctUrl=listAll+"?categoryId="+this.categoryId;
    this.state={
      mask:false,
      formData:{},
      FieldsConfig:[],
      isTreeData:'',
      checkedValue:{},
    };
  }

  componentDidMount(){
    this.loadCategoryConfig();
  }

  //载入分类配置
  loadCategoryConfig=()=>{
    let url=getCategoryUrl+"?categoryId="+this.categoryId;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            let fieldConfigData=JSON.parse(data.inParams);
            this.setState({FieldsConfig:fieldConfigData,isTreeData:data.treeData,mask:false});
            this.loadFormData();
          }
      });
  }

  //载入表单数据
  loadFormData=()=>{
    let id=this.id;
    if(id===undefined || id===''){
        let data={parentNodeId:this.parentNodeId||'root'};
        this.setState({formData:data,mask:false});
        FormUtils.setFormFieldValues(this.props.form,data);
    }else{
        let url=loadDataUrl.replace('{id}',id);
        AjaxUtils.get(url,(data)=>{
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              //如果是日期格式则要进行转换
              Object.keys(data).forEach((key)=>{
                if(this.getFieldType(key)==='datetime'){
                    data[key]=moment(data[key], dateFormat); //转换为mement类型的数据
                }else if(this.getFieldType(key)==='checkbox'){
                    data[key]=data[key].split(","); //转换为数组
                }
              });

              this.setState({formData:data,mask:false});
              FormUtils.setFormFieldValues(this.props.form,data);
            }
        });
    }
  }

  getFieldType=(fieldName)=>{
    //获取字段类型
    let fieldType='string';
    this.state.FieldsConfig.forEach((item)=>{
      if(item.paramsId===fieldName){
        fieldType = item.paramsType;
      }
    });
    return fieldType;
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach((key)=>{
              if(values[key]!==undefined){
                let value=values[key];
                let fieldType=this.getFieldType(key);
                if(fieldType==='datetime'){
                   postData[key]=value.format(dateFormat); //日期转换
                }else if(fieldType==='checkbox'){
                  //复选框要把数组转换为字符串再提交
                  let checkboxValue=this.props.form.getFieldValue(key);
                  postData[key]=checkboxValue.join(","); //checkbox是一个数组要转换为字符串提交
                }else if(value instanceof Array){
                  let value=this.props.form.getFieldValue(key);
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  //普通字符串
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.categoryId=this.categoryId;
          postData.appId=this.appId;
          // console.log(postData);
          // return;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
    let url=validateUrl+"?categoryId="+this.categoryId+"&nodeId="+value+"&id="+this.id;
    AjaxUtils.get(url,(data)=>{
            if(data.state===false){
               callback([new Error('节点Id不能为空且不能重复,请更换其他值!')]);
            }else if(data.state===true){
              callback();//显示为验证成功
            }else{
              callback([new Error('验证服务异常')]);
            }
    });
  }

  onCheckBoxChange=(e)=>{
    console.log(e);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    let formItemsData=this.state.FieldsConfig.map((item,index)=>{
        let fieldId=item.paramsId;
        let fieldName=item.paramsName;
        let fieldType=item.paramsType;
        let required=item.required;
        let defaultValue=item.defaultValue||'';
        let tip=item.tip||'';

        let formItem;
        if(fieldId==='nodeId'){
          //树型数字的节点id
            formItem=(<FormItem key={fieldId} label={fieldName} {...formItemLayout4_16} hasFeedback >
            {
              getFieldDecorator('nodeId',{rules: [{validator:this.checkExist}],validateTrigger:['onBlur']})
              (<Input placeholder="保存后不可修改" disabled={this.props.id!==''} />)
            }
            </FormItem>);
        }else{
          //普通自定义节点
          if(fieldType==='number'){
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
            {getFieldDecorator(fieldId,{rules: [{ required: required}],initialValue:defaultValue})(<InputNumber min={1} />)}
            </FormItem>);
          }else if(fieldType==='datetime'){
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
            {getFieldDecorator(fieldId,{rules: [{ required: required}]})(<DatePicker format={dateFormat} placeholder={tip}  style={{width:'200px'}} />)}
            </FormItem>);
          }else if(fieldType==='textarea'){
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
            {getFieldDecorator(fieldId,{rules: [{ required: required}],initialValue:defaultValue})(<Input.TextArea autosize placeholder={tip} />)}
            </FormItem>);
          }else if(fieldType==='radio'){
            //充许在缺省值中通过 男|0,女|1这样来设置
            let valueArray=defaultValue.split(",");
            let i=0;
            let radioOption=valueArray.map((item)=>{
              let itemValue=item;
              let itemText=item;
              let spos=item.indexOf("|");
              if(spos!==-1){
                  itemText=item.substring(0,spos);
                  itemValue=item.substring(spos+1,item.length);
              }
              if(i===0){defaultValue=itemValue;i=1;} //第一个设为默认值
              return (<Radio key={itemValue} value={itemValue}>{itemText}</Radio>);
            });
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
              {getFieldDecorator(fieldId,{rules: [{ required: required}],initialValue:defaultValue})(
                <RadioGroup>
                 {radioOption}
                </RadioGroup>
              )}
            </FormItem>);
          }else if(fieldType==='checkbox'){
            //充许在缺省值中通过 男|0,女|1这样来设置
            let valueArray=defaultValue.split(",");
            let checkboxOption=valueArray.map((item)=>{
              let itemValue=item;
              let itemText=item;
              let spos=item.indexOf("|");
              if(spos!==-1){
                  itemText=item.substring(0,spos);
                  itemValue=item.substring(spos+1,item.length);
              }
              return (<Checkbox key={itemValue} checked={false} value={itemValue}>{itemText}</Checkbox>);
            });
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
              {getFieldDecorator(fieldId,{rules: [{ required: required}],initialValue:''})(
                 <CheckboxGroup>
                 {checkboxOption}
                 </CheckboxGroup>
              )}
            </FormItem>);
          }else{
            //普通文本
            formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
            {getFieldDecorator(fieldId,{rules: [{ required: required}],initialValue:defaultValue})(<Input placeholder={tip} />)}
            </FormItem>);
          }
        }
        return formItem;
    }); //end let map

    //如果是树型结构的数据则插入上级节点选项
    let parentFormItem=(<FormItem key='parentNodeId'  label="上级节点" {...formItemLayout4_16} hasFeedback>
          {
            getFieldDecorator('parentNodeId',{rules: [{ required: true}]})
            (<TreeNodeSelect url={this.treeNodeSelctUrl} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>);
    if(this.state.isTreeData==='Y'){
      formItemsData.splice(0,0,parentFormItem);
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        {formItemsData}
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

export default Form.create()(form);
