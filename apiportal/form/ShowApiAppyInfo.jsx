import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import * as FormActions from '../../core/utils/FormUtils';

//显示API的审批信息

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_APIPORTAL_APPY.refuse;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.record.id;
    this.apiName=this.props.record.apiName;
    this.endDateTime=this.props.record.endDateTime;
    this.refuse=this.props.record.refuse;
    this.record=this.props.record;
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
          label="申请人"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.record.creatorName}
        </FormItem>
        <FormItem
          label="申时间"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.record.createTime}
        </FormItem>
        <FormItem
          label="申请期限"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.endDateTime===''?'永久':this.endDateTime}
        </FormItem>
        <FormItem
          label="申请备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          {this.record.remark}
        </FormItem>
        <FormItem
          label="审批意见"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
        {this.refuse}
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
      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
