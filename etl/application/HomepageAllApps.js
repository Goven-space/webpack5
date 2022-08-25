import React from 'react';
import { Modal, Card, Col, Row,Badge,Spin,List,Avatar,Tag} from 'antd';
import {Icon} from 'react-fa'
import { browserHistory } from 'react-router'
import * as URI from '../../core/constants/RESTURI';
import NewApplication from './form/NewApplication'
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//列出当前用户所有具有开发权限的应用

const LISTURL=URI.ETL.APPLICATION.listapps;
const appUrl=URI.rootPath+"/etl/application";
const { Meta } = Card;

class HomepageAllApps extends React.Component{
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
		if(appId==='new'){
		    this.setState({visible: true});
		}else{
			let url=appUrl+"?appid="+appId;
			window.open(url);
			//browserHistory.push(url);
		}
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
	  		    <Modal key={Math.random()}  maskClosable={false}
		  		    visible={this.state.visible}
		  		    footer=''
		  		    style={{ top: 20 }}
		  		    width='850px'
		  		    onOk={this.handleCancel}
		  		    onCancel={this.handleCancel} >
		          <NewApplication categoryId={this.categoryId} close={this.closeModal} />
		        </Modal>
						<List
		          grid={{ gutter: 16, column: 4 }}
		          dataSource={this.state.data}
		          renderItem={item => {
								if(item.appId==='new'){
									//新建应用
										return (
										<List.Item>
											<Card hoverable={true} style={{padding:'3px 0 3px 0',height:'115px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openApp.bind(this,item.appId)}  >
											<Meta
												 avatar={<Avatar size={64}  src={item.icon||defaultImg} />}
												 title={<b>{item.applicationName}</b>}
												 description='创建一个新的应用'
											 />
											</Card>
										</List.Item>
										);
								}else{
									//普通应用
											return (
					            <List.Item>
					              <Card hoverable={true} size='small' style={{padding:'10px',overflow:'hidden',height:'115px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openApp.bind(this,item.applicationId)}  >
					              <Meta
					                 avatar={<Badge count={item.processCount} showZero overflowCount={999}  style={{ backgroundColor:'#1db4eb' }} ><Avatar size={64}  src={item.src||defaultImg} /></Badge>}
					                 title={<b>{item.applicationName}</b>}
					                 description={<span>
														 应用Id: {item.applicationId}<br/>创建者: {item.creatorName}
														 <br/>备注: {item.remark}
											 			</span>}
					               />
					              </Card>
					            </List.Item>
											);
								}
		          }}
		        />

	        </div>
	    </Spin>
		);
	 }
};

export default HomepageAllApps;
