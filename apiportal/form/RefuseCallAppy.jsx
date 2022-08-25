import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import * as FormActions from '../../core/utils/FormUtils';

//拒绝或同意调用申请

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APIPORTAL_APPY.refuse;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.apiName=this.props.apiName;
    this.endDateTime=this.props.endDateTime;
    this.state={
      mask:false,
      fileList:[],
    };
  }

  componentDidMount(){
    //载入附件数据
    FormActions.getFiles(this.id,(fileList)=>{
      if(fileList.length>0){
        this.setState({ fileList:fileList });
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
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.ids=this.id;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
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
        <FormItem
          label="API名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.apiName}
        </FormItem>
        <FormItem
          label="申请期限"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.endDateTime===''?'永久':this.endDateTime}
        </FormItem>
        <FormItem
          label="是否同意"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
            getFieldDecorator('actionType',{initialValue:'1'})
            (<RadioGroup>
              <Radio value='1'>同意</Radio>
              <Radio value='2'>拒绝</Radio>
            </RadioGroup>)
          }
        </FormItem>
        <FormItem
          label="审批意见"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark',{rules: [{ required: true}]} )
          (<Input.TextArea rows={6}  />)
          }
        </FormItem>
        <FormItem
          label="申请附件"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
            { this.state.fileList.map((item)=>{
              let url=URI.baseResUrl+item.filePath;
              return (<div key={item.id}><Icon type="link" /><a href={url} target='_blank' >{item.fileName}</a></div>);
             })
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
