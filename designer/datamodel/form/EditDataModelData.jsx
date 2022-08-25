import React from 'react';
import { Form, Select, Input, Button, message,Card,Icon,Spin,Col,Radio,InputNumber} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_DATAMODELS.SaveEditModelData;
const LISTCOLUMNS_URL=URI.CORE_DATAMODELS.ListModelDatasColumns;

class form extends React.Component{
  constructor(props){
    super(props);
    this.modelId=this.props.modelId;//数据模型的ModelId
    this.data=this.props.data; //编辑的数据
    this.parentId=this.props.parentId; //所属数据模型的唯一id
    this.keyId=this.props.keyId; //主键
    this.state={
      mask:false,
      formData:this.data,
      columnsData:[],
      hiddenType:'AllHidden',
    };
  }

  componentDidMount(){
    this.loadFormItemData('N');
  }

  //通过ajax远程载入模型的所有列
  loadFormItemData=(hiddenType)=>{
    this.setState({mask:true});
    let url=LISTCOLUMNS_URL+"?parentId="+this.parentId+"&showHiddenField="+hiddenType;
    AjaxUtils.get(url,(data)=>{
      this.setState({columnsData:data,mask:false});
      let formData=this.state.formData;
      Object.keys(formData).forEach(
        function(key){
          // console.log(key+"="+Object.prototype.toString.call(formData[key]));
          let dataType=Object.prototype.toString.call(formData[key]);
          if( dataType!== "[object String]" && dataType!== "[object Number]"){
            formData[key]=AjaxUtils.formatJson(JSON.stringify(formData[key]));
          }
        }
      );
      FormUtils.setFormFieldValues(this.props.form,this.state.formData);
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
          postData.modelId=this.modelId;
          // console.log(postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo("成功保成("+data.msg+")条数据!");
              }
              this.setState({mask:false});
          });
      }
    });
  }

  handleRadioChange = (e) => {
    let value=e.target.value;
    if(value==='AllHidden'){
        this.loadFormItemData('N');
    }else{
        this.loadFormItemData('Y');
    }
    this.setState({hiddenType:value});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let formItemsData=this.state.columnsData.map((item,index)=>{
        let colId=item.colId;
        let required=false;
        if(colId===this.keyId || item.noNull===true){
            required=true;
        }
        let dateIndexId=colId;
        //在显示所有字段时业务模型实质也取的是实体模型的所有字段
        if(item.aliasId!=='' && item.aliasId!==undefined && item.aliasId!==null){
          dateIndexId=item.aliasId;
        }
        return (<FormItem
          key={colId}
          label={item.colName}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator(dateIndexId,{rules: [{ required: required}]})(<Input.TextArea autosize />)}
        </FormItem>);
      });

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Card title="编辑数据" >
      <Form  >
        <FormItem label='显示选项' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} >
          <Radio.Group  value={this.state.hiddenType} onChange={this.handleRadioChange} >
            <Radio.Button  value="AllHidden">不显示隐藏字段</Radio.Button>
            <Radio.Button  value="AllShow">显示所有字段 </Radio.Button>
          </Radio.Group>
        </FormItem>
        {formItemsData}
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
        </FormItem>
      </Form>
      </Card>
      </Spin>
    );
  }
}

const EditDataModelData = Form.create()(form);

export default EditDataModelData;
