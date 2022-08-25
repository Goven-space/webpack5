import React from 'react';
import {Icon} from 'antd';
import * as ContextUtils from '../utils/ContextUtils';

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
		ContextUtils.getSystemPermissions((data)=>{
			this.setState({footer:data.footer,footUrl:data.footUrl})
		});
  }

	render(){
		let today=new Date();
		let CopyrightYear=today.getFullYear();
		let footer=this.state.footer;
		let footUrl=this.state.footUrl;
		if(footer===''||footer===undefined||footer===null){footer="";}
		if(footUrl===''||footUrl===undefined||footUrl===null){footUrl="";}
	  return (
	  	<div style={{width:'100%',textAlign:'center'}}>
	  		<div style={{width:'100%',textAlign:'center',minHeight: 80,marginLeft:0,overflow:'hidden'}} >
	                    <div style={{fontSize:'14px',fontWeight:500}}>Copyright © {CopyrightYear}</div>
											<div  >{footer}</div>
											<div  ><a href={footUrl} target='_blank' style={{color:'#666'}} >{footUrl}</a></div>
         </div>
        </div>
		);
	 }
}

export default pageFooter;
