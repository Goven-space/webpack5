import React from 'react';
import {Icon} from 'antd';
import * as URI  from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

//公共的所有用户权限的页脚

class pageFooter extends React.Component {
	constructor(props) {
    	super(props);
			this.state={
				mask:false,
				footer:'',
				footUrl:'',
			};
  	}


  componentDidMount(){
		let url=URI.CORE_APIPORTAL_HOEMMENU.getSystemInfo;
		AjaxUtils.get(url,(data)=>{
						if(data.state===false){
							message.error(data.msg);
						}else{
							this.setState({footer:data.footer,footUrl:data.footUrl});
						}
		});
  }

	render(){
		let today=new Date();
		let CopyrightYear=today.getFullYear();
		let footer=this.state.footer;
		let footUrl=this.state.footUrl;
		if(footer===''||footer===undefined||footer===null){footer="-未发现授权信息-";}
		if(footUrl===''||footUrl===undefined||footUrl===null){footUrl="-请联系管理员-";}
	  return (
	  	<div style={{width:'100%',textAlign:'center'}}>
	  		<div style={{width:'100%',textAlign:'center',minHeight: 80,marginLeft:0,overflow:'hidden'}} >
	                    <div style={{fontSize:'14px',fontWeight:500}}>Copyright © {CopyrightYear}</div>
											<div  >{footer}</div>
											<div  >{footUrl}</div>
         </div>
        </div>
		);
	 }
}

export default pageFooter;
