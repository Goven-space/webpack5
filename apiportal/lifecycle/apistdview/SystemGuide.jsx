import React from 'react';
import {Spin,Input,Tag,Steps} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

//系统接入指引

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
				current: 0,
        htmlBody:'',
	    }
	}
	componentDidMount(){
    this.loadData();
  }

	onChange = current => {
      // console.log('onChange:', current);
	    this.setState({ current });
      this.loadData(current);
	};

  //通过ajax远程载入模板代码
	loadData=(current=0)=>{
    this.setState({mask:true});
    let templateId="SystemJoinGuideHtmlBody_"+(current+1);
		AjaxUtils.post(codeUrl,{configId:templateId},(data)=>{
    	this.setState({mask:false,htmlBody:data.configValue});
    });
	}

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
            title="准备阶段"
            description="技术规范确认"
          />
          <Step
            title="实施阶段"
            description="培训指导"
          />
          <Step
            title="试运行阶段"
            description="能力测试"
          />
          <Step
            title="推广验收阶段"
            description="推广运营"
          />
        </Steps>
        <div style={{minHeight:600}}   >
            <div dangerouslySetInnerHTML={{__html:this.state.htmlBody}} ></div>
        </div>
      </Spin>
		);
	 }
}

export default APIGuide;
