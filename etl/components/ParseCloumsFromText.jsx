import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio} from 'antd';
import * as FormUtils from '../../core/utils/FormUtils';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class form extends React.Component{
  constructor(props){
    super(props);
    this.thisobj=this.props.thisobj;
    this.state={
      mask:false,
    };
  }

  componentDidMount(){
    FormUtils.setFormFieldValues(this.props.form,{body:AjaxUtils.formatJson(JSON.stringify(this.thisobj.state.data))});
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let jsonObj=[];
        let fieldConfig=this.props.form.getFieldValue("body").trim();
        if(fieldConfig!=='' && fieldConfig.substring(0,1)==='['){
          jsonObj=JSON.parse(fieldConfig);
          jsonObj=jsonObj.filter((dataItem) => {
            return dataItem.colId!=='';
          });
        }else if(fieldConfig.substring(0,1)==='{'){
          let fieldJsonObj=JSON.parse(fieldConfig);
          let i=0;
          for(var key in fieldJsonObj){
            let colId=key;
            let colItem={id:AjaxUtils.guid(),colId:colId,colName:colId};
            jsonObj[i]=colItem;
            i++;
          }
        }else if(fieldConfig.indexOf(",")!==-1){
          jsonObj=[];
          let fieldConfigArray=fieldConfig.split(",");
          for(let i=0;i<fieldConfigArray.length;i++){
            let colId=fieldConfigArray[i].trim();
            let colItem={id:AjaxUtils.guid(),colId:colId,colName:colId};
            jsonObj[i]=colItem;
          }
        }else if(fieldConfig.indexOf("\n")!==-1){
          jsonObj=[];
          let fieldConfigArray=fieldConfig.split("\n");
          for(let i=0;i<fieldConfigArray.length;i++){
            let colId=fieldConfigArray[i].trim();
            let colItem={id:AjaxUtils.guid(),colId:colId,colName:colId};
            jsonObj[i]=colItem;
          }
        }
        this.thisobj.setState({data:jsonObj,visible:false});
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    return (
    <Spin spinning={false}  tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="????????????"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
          help='?????????????????????????????????????????????????????????????????????ID'
        >{
          getFieldDecorator('body',{
            rules: [{ required: false}],
          })
          (<Input.TextArea style={{minHeight:'450px',maxHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 2 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            ????????????????????????
          </Button>
          {' '}
          <Button onClick={this.props.closeTab.bind(this,false)}  >
            ??? ???
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
