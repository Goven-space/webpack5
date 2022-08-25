import React from 'react';
import { Form, Icon, Input, Button, Checkbox,Card,Spin,Select,Row,Col,AutoComplete} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import { browserHistory } from 'react-router'
import md5 from 'md5'
import PageFooter from '../components/PageFooter';

const FormItem = Form.Item;
const loginApi=URI.CONTEXT.loginApi;
const Option = Select.Option;

//登录界面相关的变量定义
let loginLogoUrl=webappsProjectName+"/res/iconres/images/logo.png"; //logo图片地址
let loginbgUrl=webappsProjectName+"/res/iconres/images/login-bg.png";
let  loginMessage="请使用谷歌或火狐浏览器登录本系统...";
let loginspan=4;
try{loginMessage=LOGINMESSAGE;}catch(e){}
try{loginspan=LOGINSPAN;}catch(e){}
try{loginbgUrl=LOGINBGURL;}catch(e){}
try{loginLogoUrl=LOGINLOGOURL;}catch(e){}


class NormalLoginForm extends React.Component {

  constructor(props){
    super(props);
    this.state={
      mask:false,
      loginUserId:'',
      serverList:[],
      currentServerHost:host,
    };
  }

  componentDidMount(){
    let loginUserId=AjaxUtils.getCookie("loginUserId");
    //设置可选的服务器列表
    let serverList=localStorage.getItem("serverHost") || "";
    let serverListArray=serverList.split(",");
    // let currentServerHost=localStorage.getItem("currentServerHost") || serverListArray[serverListArray.length-1]; //从最后一个登录成功的地址中取
    // if(currentServerHost!==undefined && currentServerHost!==""){
    //   this.setState({currentServerHost:currentServerHost}); //登录地址改为最后一次登录的服务器地址
    // }
    this.setState({loginUserId:loginUserId,serverList:serverListArray});
  }

  onSubmit = (e) => {
    let type=this.props.form.getFieldValue("userType");
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let remember=this.props.form.getFieldValue("remember");
          let loginUserId=this.props.form.getFieldValue("userName");
          let serverHost=this.props.form.getFieldValue("serverHost");
          let url=serverHost+loginApi;
          values.password=md5(values.password); //md5加密一次
          values.systemlogin="1";//表示是系统界面登录,隐藏的参数
          if(remember){AjaxUtils.setCookie("loginUserId",loginUserId,300);}
          this.setState({mask:true});
          AjaxUtils.post(url,values,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                let adminIndexUrl=data.adminIndexUrl; //登录成功后的转向页面
                let identitytoken=data[URI.cookieId]; //登录成功后系统返回的token
                AjaxUtils.setCookie(URI.cookieId,identitytoken); //把服务器返回的登录token放置到cookie中去
                AjaxUtils.setCookie("userName",data.userName);
                AjaxUtils.setCookie("userId",data.userId);
                // AjaxUtils.setCookie("deptName",data.deptName);
                // AjaxUtils.setCookie("deptCode",data.deptCode);
                // AjaxUtils.setCookie("jobDesc",data.jobDesc);
                AjaxUtils.addServerHost(serverHost); //追加到成功登录的服务器列表中
                AjaxUtils.setCurrentServerHost(serverHost); //修改全局变量到此服务器
                // alert("login ok="+document.cookie);
                if(adminIndexUrl===undefined || adminIndexUrl===null || adminIndexUrl===''){
                  adminIndexUrl=URI.adminIndexUrl;
                }
                // console.log("serverHost:"+serverHost+",host:"+host+",adminIndexUrl:"+adminIndexUrl);
                if(serverHost===host){
                  browserHistory.push(adminIndexUrl); //用户登录成功转入admin主界面，没有切换服务器
                }else{
                  location.replace(adminIndexUrl); //切换服务器
                }
              }
          });
      }
    });
  }


  render() {
    let clientHeight=document.body.clientHeight>850?'730px':'630px';
    const { getFieldDecorator } = this.props.form;
    const optionsItem = this.state.serverList.map(item => <Option key={item} value={item}>{item}</Option>);
    return (
      <div style={{width:'100%',minHeight:`${clientHeight}`,background:`#5e5e5e url(${loginbgUrl})`,backgroundPosition:'-35px' }} >
          <div style={{background:'#ffffff',padding:'5px',height:'70px'}} >
            <div style={{float:'left'}}><img src={loginLogoUrl} /> </div>
            <div style={{borderLeft:"1px solid #ebedee",position:'relative',left:'10px',height:"35px",top:'10px',float:'left'}} />
            <div style={{position:'relative',top:'10px',left:'20px',float:'left',fontSize:'22px',fontFamily:'Microsoft Yahei'}}>系统登录</div>
          </div>

          <Card  title="系统登录" style={{position:'absolute',left:'50%',top:'50%',margin:'-220px 0 0 -280px',width:'580px',float:'center'}}>
            <Spin spinning={this.state.mask} tip="Loading..." style={{width:'100%',height:'100%'}}>
              <Form onSubmit={this.onSubmit}>
                <FormItem label="服务器:"
                  help="请指定要登录的后端API服务器的URL地址"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                  >
                  {getFieldDecorator('serverHost', {
                    initialValue:this.state.currentServerHost,
                    rules: [{ required: true}],
                  })(
                    <AutoComplete  size='large' >
                     {optionsItem}
                    </AutoComplete>
                  )}
                </FormItem>
                <FormItem label="用户名:"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('userName', {
                    initialValue: this.state.loginUserId,
                    rules: [{ required: true, message: '请输入您的登录帐号!' }],
                  })(
                    <Input size='large' prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
                  )}
                </FormItem>
                <FormItem label="密码:"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                  >
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入您的登录密码!' }],
                  })(
                    <Input size='large' prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
                  )}
                </FormItem>
                <Row>
                  <Col span={loginspan}></Col>
                  <Col span={16}>
                    <Button type="primary" size='large' htmlType="submit" style={{width:'200px'}} >
                    登录
                  </Button>
                  <br/>{loginMessage}
                </Col>
                </Row>
              </Form>
              </Spin>
          </Card>

          <center>
            <div style={{position:'fixed',bottom:'20px',left:'45%',margin:'150px,0,50px,0'}}>
                <PageFooter />
            </div>
          </center>

      </div>
    );
  }
}

export default Form.create()(NormalLoginForm);
