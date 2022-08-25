import React from 'react';
import {Spin,Input,Tag} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles/lowlight';

const frontendConstUrl=URI.LIST_APIPORTAL_APPLICATION.frontendConst;

class JsonConstants extends React.Component {
	constructor(props) {
	    super(props);
			this.appId=this.props.appId;
	    this.state={
	    	mask:true,
	    	htmlBody:'',
	    }
	}
	componentDidMount(){
      this.loadData();
  	}
  	//通过ajax远程载入数据
	loadData=()=>{
		let url=frontendConstUrl.replace("{appId}",this.appId);
	    AjaxUtils.ajax(url,'','GET','html','',(data)=>{
	    	this.setState({mask:false,htmlBody:data});
	    });
	}

	render(){
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
              <div style={{minHeight:600}} >
							<Tag>前端可直接引用:/rest/base/apidocs/front/{this.appId}/constants.js</Tag> <br/><br/>
              <SyntaxHighlighter language='javascript' style={docco}>{this.state.htmlBody}</SyntaxHighlighter>
              </div>
        </Spin>
		);
	 }
}

export default JsonConstants;
