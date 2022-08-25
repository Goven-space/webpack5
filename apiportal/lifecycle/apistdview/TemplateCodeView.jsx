import React from 'react';
import {Spin,Input,Tag,Steps} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

//根据模板显示html code

const codeUrl=URI.CORE_APIPORTAL_HOEMMENU.apiGuideValue;

class TemplateCodeView extends React.Component {
	constructor(props) {
	    super(props);
      this.templateId=this.props.templateId;
	    this.state={
	    	mask:true,
	    	htmlBody:'',
	    }
	}
	componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(nextProps.templateId!==this.templateId){
        this.templateId=nextProps.templateId;
        this.loadData();
    }
  }

  //通过ajax远程载入模板代码
	loadData=()=>{
			AjaxUtils.post(codeUrl,{configId:this.templateId},(data)=>{
	    	this.setState({mask:false,htmlBody:data.configValue});
	    });
	}

	render(){
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
              <div style={{minHeight:600}}   >
									<div dangerouslySetInnerHTML={{__html:this.state.htmlBody}} ></div>
							</div>
        </Spin>
		);
	 }
}

export default TemplateCodeView;
