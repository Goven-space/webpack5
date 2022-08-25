import React from 'react';
import { Modal, Card, Col, Row,Badge,Spin,List,Avatar,Tag} from 'antd';
import {Icon} from 'react-fa'
import * as URI from '../../core/constants/RESTURI';
import NewApp from './form/NewApp'
import {hashHistory} from 'react-router';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//列出当前用户所有具有开发权限的应用


const LISTURL=URI.LIST_APP.list;
const appUrl=URI.rootPath+"/designer";
const { Meta } = Card;

class AllApps extends React.Component{
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
		if(appId==='new'){
		    this.setState({visible: true});
		}else{
			let url=appUrl+"?appid="+appId;
			window.open(url);
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
		          <NewApp ref="NewAppForm" categoryId={this.categoryId} close={this.closeModal} />
		        </Modal>

						<List
		          grid={{ gutter: 16, column: 4 }}
		          dataSource={this.state.data}
		          renderItem={item => {
								let styleColor='orange';
								if(item.state==='系统'){
									styleColor='#b6dff3';
								}
								if(item.appId==='new'){
									//新建应用
										return (
										<List.Item>
											<Card hoverable={true} style={{padding:'3px 0 3px 0',height:'105px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openApp.bind(this,item.appId)}  >
											<Meta
												 avatar={<Avatar size={64}  src={item.icon||defaultImg} />}
												 title={<b>{item.appName}</b>}
												 description='创建一个新的应用'
											 />
											</Card>
										</List.Item>
										);
								}else{
									//普通应用
											return (
					            <List.Item>
					              <Card hoverable={true} style={{padding:'1px 0 3px 0',overflow:'hidden',height:'105px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openApp.bind(this,item.appId)}  >
					              <Meta
					                 avatar={<Badge count={item.serviceCount} showZero overflowCount={999}  style={{ backgroundColor: item.countColor||'#1db4eb' }} ><Avatar size={58}  src={item.src||defaultImg} /></Badge>}
					                 title={<b>{item.appName}</b>}
					                 description={<span>
														 创建者: {item.creatorName}
														 {' '}状态: <span className="ant-tag ant-tag-has-color" style={{backgroundColor: styleColor,fontSize:'4px',height:'16px',margin:0,padding:0,lineHeight:'13px'}}  >{item.state}</span>
													 <br/>应用Id: {item.appId}
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

export default AllApps;
