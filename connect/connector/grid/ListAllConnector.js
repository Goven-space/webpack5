import React from 'react';
import { Modal, Card, Col, Row,Badge,Spin,List,Avatar,Tag} from 'antd';
import {Icon} from 'react-fa'
import * as URI from '../../../core/constants/RESTURI';
import { browserHistory } from 'react-router'
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

//列出所有链接器

const LISTURL=URI.CORE_CONNECTOR.listApps;
const appUrl=URI.rootPath+"/designer";
const { Meta } = Card;

class ListAllConnector extends React.Component{
	constructor(props) {
	    super(props);
	    this.categoryId=this.props.categoryId||'*';
	    this.state={
	      mask:false,
	      visible:false,
	      appRows:[],
				data:[],
	    };
	}

  componentDidMount(){
  	this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.categoryId=nextProps.categoryId||'*';
    this.loadData();
  }

   loadData=()=>{
  	this.setState({mask:true});
		let categoryId=this.categoryId;
		if(categoryId==='ListAllApps'){categoryId='*';}
  	let url=LISTURL+"?categoryId="+categoryId;
	  AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            // this.listAppRows(data);
            this.setState({data:data,mask:false});
          }
    });
	}

	openApp=(appId)=>{
		let url;
		if(appId==='sapconnect'){
		    url=URI.rootPath+"/sap";
		}else if(appId=='mongoconn'){
				url=URI.rootPath+"/mongo";
		}else{
			url=URI.rootPath+"/connector?appid="+appId;
		}
		//browserHistory.push(url);
		window.open(url,appId);
	}
	closeModal=(reload)=>{
	    this.setState({visible: false,});
		  if(reload===true){this.loadData();}
	}

	handleCancel=(e)=>{
	    this.setState({
	      visible: false,
	    });
	}

	render(){
		let defaultImg=webappsProjectName+'/res/iconres/images/portal/v1/app.png';
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
	  		<div style={{minHeight:'600px'}} >
						<List
		          grid={{ gutter: 16, column: 4 }}
		          dataSource={this.state.data}
		          renderItem={item => {
										return (
				            <List.Item>
				              <Card hoverable={true} style={{padding:'1px 0 3px 0',overflow:'hidden',height:'105px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openApp.bind(this,item.appId)}  >
				              <Meta
				                 avatar={<Badge count={item.serviceCount} showZero overflowCount={999}  style={{ backgroundColor: '#1db4eb' }} ><Avatar size={58}  src={item.src||defaultImg} /></Badge>}
				                 title={<b>{item.appName}</b>}
				                 description={<span>
													 创建者: {item.creatorName}
												 <br/>应用Id: {item.appId}
										 			</span>}
				               />
				              </Card>
				            </List.Item>
										);
		          }}
		        />

	        </div>
	    </Spin>
		);
	 }
};

export default ListAllConnector;
