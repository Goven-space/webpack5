import React from 'react';
import { Form, Input, Button, Spin} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormActions from '../../../core/utils/FormUtils';

const FormItem = Form.Item;
const loadDataUrl=URI.LIST_CORE_BEANS.listCacheItemsUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.cacheKey=this.props.cacheKey;
    this.url=loadDataUrl.replace("{cacheConfigId}",this.cacheKey);
    this.state={
      mask:false,
      jsonStr:'',
    };
  }

  componentDidMount(){
      this.setState({mask:true});
      AjaxUtils.get(this.url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            let objStr=data.ObjectStr;
            this.setState({jsonStr:objStr,mask:false});
          }
      });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 2 },wrapperCol: { span: 22 },};
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Input.TextArea autosize value={this.state.jsonStr} style={{maxHeight:'600px'}}/>
      </Spin>
    );
  }
}

const ShowCacheItems = Form.create()(form);

export default ShowCacheItems;
