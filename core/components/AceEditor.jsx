import React from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

class AceEditor extends React.Component{
  constructor(props){
    super(props);
    this.code=this.props.value; //显示代码
    this.codeType=this.props.mode||"java"; //代码类型
		this.onChange=this.props.onChange;
		this.height=this.props.height;
    this.codeUrl=webappsProjectName+"/res/ace/eventcode.html?codeType="+this.codeType;
    this.state={
      mask:false,
      visible:false,
    };
  }

  componentDidMount(){
  }

	componentWillReceiveProps=(nextProps)=>{
    if(this.code!==nextProps.value){
      this.code=nextProps.value;
			this.setCodeValue(this.code);
    }
  }

  getCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    return code;
  }

  setCode=()=>{
    this.setCodeValue(this.code);
  }

  setCodeValue=(value="")=>{
    this.codeOnChange(value);
    let mframe =this.refs.myframe;
		if(mframe.contentWindow.setCode){
    	mframe.contentWindow.setCode(value);
		}
  }

	codeOnChange=(code)=>{
    let mframe =this.refs.myframe;
    if(mframe.contentWindow.getEditor){
			mframe.contentWindow.getEditor().getSession().on('change', ()=>{
				let code=mframe.contentWindow.getCode();
				this.code=code;
				this.onChange(code);
			});
		}
	}

  render() {
    return (
        <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
        <iframe ref='myframe' onLoad={this.setCode} src={this.codeUrl} style={{minHeight:this.height,width:'100%',border:'none'}}/></div>
    );
  }
}

export default AceEditor;
