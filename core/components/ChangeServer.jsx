import React from 'react';
import { Form, Input, Button, Spin,Icon,Select} from 'antd';
import * as AjaxUtils from '../utils/AjaxUtils';

const FormItem = Form.Item;
const Option = Select.Option;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      currentServerHost:host,
      serverList:[],
    };
  }

  componentDidMount(){
    //设置可选的服务器列表
    let serverList=localStorage.getItem("serverHost") || "";
    let serverListArray=serverList.split(",");
    let currentServerHost=localStorage.getItem("currentServerHost") || serverListArray[serverListArray.length-1]; //从最后一个登录成功的地址中取
    if(currentServerHost!==undefined && currentServerHost!==""){
      this.setState({serverList:serverListArray,currentServerHost:currentServerHost}); //登录地址改为最后一次登录的服务器地址
    }else{
      this.setState({serverList:serverListArray});
    }
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let serverHost=this.props.form.getFieldValue("serverHost");
        AjaxUtils.addServerHost(serverHost);
        AjaxUtils.setCurrentServerHost(serverHost);
        location.reload(); //重新载入本页面
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const optionsItem = this.state.serverList.map(item => <Option key={item} value={item}>{item}</Option>);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
          <FormItem  label="服务器地址" help="请选择或填写要链接的服务器的Host如:http://localhost:8080/restcloud"   {...formItemLayout4_16} >
            {
              getFieldDecorator('serverHost',{
                initialValue:this.state.currentServerHost,
                rules: [{ required: true}],
              })
              (<Select mode='combobox' size='large' >
               {optionsItem}
             </Select>)
            }
          </FormItem>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
              <Button type="primary" onClick={this.onSubmit}  >
                连接服务器
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

const changeServer = Form.create()(form);

export default changeServer;
