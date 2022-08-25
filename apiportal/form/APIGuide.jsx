import React from 'react';
import {Spin,Input,Tag,Steps} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles/lowlight';

//新手调用指南

const codeUrl=URI.CORE_APIPORTAL_HOEMMENU.apiGuideValue;
const { Step } = Steps;
const stepStyle = {
  marginBottom: 60,
  boxShadow: '0px -1px 0 0 #e8e8e8 inset',
};

class APIGuide extends React.Component {
	constructor(props) {
	    super(props);
	    this.state={
	    	mask:true,
	    	htmlBody:'',
				javaCode:'',
				current: 0,
	    }
	}
	componentDidMount(){
      this.loadData();
  	}
  	//通过ajax远程载入数据
	loadData=()=>{
			AjaxUtils.post(codeUrl,{configId:'FrontendJavaScriptCallAPI'},(data)=>{
	    	this.setState({mask:false,htmlBody:data.configValue});
	    });
			AjaxUtils.post(codeUrl,{configId:'JavaRestClientDemo'},(data)=>{
				this.setState({mask:false,javaCode:data.configValue});
			});
	}

	onChange = current => {
	    console.log('onChange:', current);
	    this.setState({ current });
	  };

	render(){
		const { current } = this.state;
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
				<Steps
          type="navigation"
          current={current}
          onChange={this.onChange}
          style={stepStyle}
        >
          <Step
            title="注册帐号"
            subTitle="申请注册本平台帐号"
            description="请联系APIM平台管理员"
          />
          <Step
            title="创建应用"
            subTitle="创建自已的应用"
            description="登录平台在应用中发布API"
          />
          <Step
            title="调用API"
            subTitle="调用平台中的API"
            description="阅读下面的调用示例代码"
          />
        </Steps>

              <div style={{minHeight:600}}  className='apidoc' >
								<h2>调用API时的公共参数</h2>
								<table style={{width:'100%'}}><tbody>
								<tr>
									<th style={{width:'15%'}} >公共参数ID</th>
									<th style={{width:'20%'}} >参数名</th>
									<th style={{width:'10%'}} >位置</th>
									<th>备注及参考值</th>
								</tr>
								<tr><td>identitytoken</td><td>身份认证token</td><td>header</td><td>API选为token认证时传入,可以调用/rest/core/auth/login接口登录后返回此token</td></tr>
                <tr><td>appkey</td><td>身份认证key</td><td>url</td><td>API选为appkey认证时传入,在用户信息中可获取此key</td></tr>
                <tr><td>traceid</td><td>调用链跟踪traceid</td><td>header</td><td>一般由系统自动创建并加入</td></tr>
								<tr><td>spanid</td><td>调用链跟踪spanid</td><td>header</td><td>一般由系统自动创建并加入</td></tr>
								<tr style={{display:'none'}}><td>callBackURL</td><td>请求异步API后的回调API地址</td><td>query</td><td>请求异步API时传入此参数表示执行成功后回调(可以是API的配置ID或API的url)</td></tr>
								<tr style={{display:'none'}}><td>queueWaitTime</td><td>请求异步API后每次调度的时间间隔</td><td>query</td><td>请求异步API时如果API是属于等待类型则可以指定每次调度的间隔时间</td></tr>
								<tr style={{display:'none'}}><td>callBackToken</td><td>请求异步API后回调时带上此标识token</td><td>query</td><td>异步API执行成功后回调API时将带上此token</td></tr>
								</tbody></table>

							<br></br><h2>JS前端调用示例</h2>
              	<SyntaxHighlighter language='javascript' style={docco}>{this.state.htmlBody}</SyntaxHighlighter>
							   <br></br><h2>Java后端调用示例</h2>
								<SyntaxHighlighter language='java' style={docco}>{this.state.javaCode}</SyntaxHighlighter>
							</div>
        </Spin>
		);
	 }
}

export default APIGuide;
