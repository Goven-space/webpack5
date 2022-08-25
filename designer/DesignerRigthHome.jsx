import React from 'react';
import { Tabs, Modal, Button,Card, Col, Row,Badge,Icon,Layout,Spin} from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//应用开发界面的右则应用图标统计

//数据模型设计
import ListEntryModelsForRdb from './datamodel/rdb/ListEntryModels';
import ListBusinessModelsForRdb from './datamodel/rdb/ListBusinessModels';
import ListViewModels from './datamodel/grid/ListViewModels';
//存储过程
import ListProcedureByAppId from './designer/grid/ListProcedureByAppId';
//API开发
import ListApisByAppId from './designer/grid/ListApisByAppId';
//sql管理
import ListSqlConfig from './datamodel/rdb/ListSqlConfig'
//角色权限
import ListPermissionsByAppId from './designer/grid/ListPermissionsByAppId';
import ListRolesByAppId from './designer/grid/ListRolesByAppId';
//JavaBean管理
import ListJavaBeansByAppId from './designer/grid/ListJavaBeansByAppId';
//视图模板
import ListHtmlTemplateByAppId from './designer/grid/ListHtmlTemplateByAppId';
//服务 测试
import ListTestServicesByAppId from '../apitester/grid/ListTestServicesByAppId';
import ListTestPlanTask from '../apitester/grid/ListTestPlan';
import ListTestReport from '../apitester/grid/ListTestReport';
import TestRateChart from '../apitester/form/Home';

//服务模拟
import ListMockConfigs from './mock/grid/ListMockConfigs';
import ListMockRules from './mock/grid/ListMockRules';
import ListMockDatas from './mock/grid/ListMockDatas';

//新增资源文件
import ListAppFilesByAppId from './designer/grid/ListAppFilesByAppId';
//应用配置
import ListAppPropertiesByAppId from './designer/grid/ListAppPropertiesByAppId'
import ListAppBaseDataCategory from './appbasedata/grid/ListCategory';
import ListAppServiceCategoryMgr from './ServiceCategory/grid/ListAppServiceCategoryMgr';
import ListMenuCategory from './appmenu/grid/ListMenuCategory';
import ListAppServiceCategoryNode from './ServiceCategory/grid/ListAppServiceCategoryNode';
import Setting_Langs from '../core/setting/grid/ListMultiLangs';
import ListApiCategoryNode from '../apiportal/grid/ListApiCategoryNode'; //API分类管理-引用API管理门户中的分类管理

const { Sider,Content } = Layout;
const TabPane = Tabs.TabPane;
const LISTURL=URI.LIST_APP.appres;

class DesignerRigthHome extends React.Component{
	constructor(props) {
	    super(props);
			this.appId=this.props.appId;
			this.menuNodeObj=this.props.menuNodeObj||{};
	    this.state={
	      visible:false,
	      appRows:[],
	      activeKey: 'devindex',
	      panes:[],
				mask:true,
	    };
	}

  componentDidMount(){
		this.loadData();
  }

	componentWillReceiveProps=(nextProps)=>{
		// console.log(nextProps.menuNodeObj);
		if(nextProps.menuNodeObj===undefined || nextProps.menuNodeObj.nodeId==='toggle'){return false;}
    if(nextProps.menuNodeObj.id!==this.menuNodeObj.id || nextProps.menuNodeObj.searchKeyword!==''){
			  //searchKeyword不为空表示需要搜索
        this.menuNodeObj=nextProps.menuNodeObj;
        this.addPane(this.menuNodeObj.props,this.menuNodeObj.label,this.menuNodeObj.nodeId);
    }
  }

  loadData=()=>{
		//this.setState({mask:true});
  	let url=LISTURL.replace("{appid}",this.appId);
		AjaxUtils.get(url,(data)=>{
						//this.setState({mask:false});
	          if(data.state===false){
	            AjaxUtils.showError(data.msg);
	          }else{
	            this.listAppRows(data);
	          }
	    });
  }

  listAppRows=(rowsData)=>{
   		let appRowList=rowsData;
   		let isLast=false;
    	let rowsApp=[];
    	let colsApp=[];
		let rowIndex=1;
    	let colIndex=0;
    	let maxCol=6;
    	let spanNum=24/maxCol;
    	let appNum=appRowList.length;
    	for(let i=0;i<appNum;i++){
    		colIndex++;
			if(colIndex<9){
				let iconPath=appRowList[i].icon;
				let resName=appRowList[i].resName;
				let resId=appRowList[i].resId;
				let resNum=appRowList[i].resNum;
				if(iconPath===undefined || iconPath===""){
					iconPath=URI.baseImageUrl+'/app.png';
				}else{
					iconPath=resHost+iconPath;
				}
				colsApp.push(
				<Col key={i} span={spanNum} style={{padding:'10px',cursor:'pointer'}} onClick={this.addPane.bind(this,resId,resName,'')}>
			      <Card bodyStyle={{ padding: 5 }} hoverable bordered={false} style={{textAlign:'center'}} >
				    <div>
				      <Badge count={resNum} overflowCount={999} style={{ backgroundColor: '#87d068',top:'3px' }} >
				      	<img src={iconPath} style={{height:'62px'}} />
				      </Badge>
				    </div>
				    <div>
				      <h3>{resName}</h3>
				    </div>
				  </Card>
				</Col>);
			}

			//每8个应用换一次行，最后的应用不足8个时也增加一行
			// console.log("colIndex="+colIndex);
			if(i===appNum-1){isLast=true;}
			if(colIndex>=maxCol || isLast ){
		    	rowsApp.push(<Row key={rowIndex}>{colsApp}</Row>);
		    	colsApp=[];
		    	rowIndex++;
		    	colIndex=0;
			}
    	}
      	this.setState({appRows:rowsApp});
  	}

	closeModal=()=>{
	    this.setState({
	      visible: false,
	    });
	}

	handleCancel=(e)=>{
	    this.setState({
	      visible: false,
	    });
	}

	onChange=(activeKey)=>{
		if(activeKey==='devindex'){this.loadData();}
    	this.setState({ activeKey });
  }
	onEdit=(targetKey, action)=>{
		if(action==="remove"){this.remove(targetKey);}
	}
	remove=(targetKey)=>{
	    let activeKey = this.state.activeKey;
	    let lastIndex;
	    this.state.panes.forEach((pane, i) => {
	      if (pane.key === targetKey) {
	        lastIndex = i - 1;
	      }
	    });
	    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
	    if (lastIndex >= 0 && activeKey === targetKey) {
	      activeKey = panes[lastIndex].key;
	    }else{
	    	activeKey="devindex";
	    }
	    this.setState({ panes, activeKey });
	}
	addPane=(resId,resName,nodeId)=>{
	    const panes = this.state.panes;
	    const activeKey = resId;
			let categoryId=this.menuNodeObj.nodeId||'';
	    let content;
			if(resId==='Home'){
				this.setState({panes:[],activeKey:'devindex'});
				return;
			}else if(resId==="Rest"){
		    content=(<ListApisByAppId appId={this.appId} categoryId={categoryId} searchKeyword={this.menuNodeObj.searchKeyword} />);
	    }else if(resId==="JavaBean"){
		    content=(<ListJavaBeansByAppId appId={this.appId} beanType={categoryId}  />);
	    }else if(resId==="DataModel"){
				if(nodeId==='ListBusinessModelsForRdb'){
		    	content=(<ListBusinessModelsForRdb appId={this.appId}/>);
				}else if(nodeId==='ListViewModels'){
		    	content=(<ListViewModels appId={this.appId}/>);
				}else{
		    	content=(<ListEntryModelsForRdb appId={this.appId}/>);
				}
	    }else if(resId==="Test"){
				if(nodeId==='TestRate'){
					 content=(<TestRateChart appId={this.appId}/>);
				}else if(nodeId==='TestTask'){
					 content=(<ListTestPlanTask appId={this.appId}/>);
				}else if(nodeId==='TestReport'){
					 content=(<ListTestReport appId={this.appId}/>);
				}else{
		    	content=(<ListTestServicesByAppId appId={this.appId}/>);
				}
	    }else if(resId==="Permission"){
				if(nodeId==='PermissionList'){
		    	content=(<ListPermissionsByAppId appId={this.appId}/>); //权限管理
				}else{
					 content=(<ListRolesByAppId appId={this.appId}/>); //角色管理
				}
	    }else if(resId==="Resources"){
		    content=(<ListAppFilesByAppId appId={this.appId}  categoryId={categoryId} />);
	    }else if(resId==="Mock"){
				if(nodeId==='MockGener'){
					content=(<ListMockConfigs appId={this.appId}/>);
				}else if(nodeId==='MockRule'){
					content=(<ListMockRules appId={this.appId}/>);
				}else{
					content=(<ListMockDatas appId={this.appId}/>);
				}
	    }else if(resId==="View"){
		    content=(<ListHtmlTemplateByAppId appId={this.appId} categoryId={categoryId} />);
	    }else if(resId==="procedure"){
		    content=(<ListProcedureByAppId appId={this.appId} categoryId={categoryId} />);
	    }else if(resId==="AppProperties"){
				if(nodeId==='DataDic'){
						content=<ListAppBaseDataCategory appId={this.appId} />;
				}else if(nodeId==='PropsConfig'){
						content=<ListAppPropertiesByAppId appId={this.appId} />;
				}else if(nodeId==='MenuConfig'){
						content=<ListMenuCategory appId={this.appId} />;
				}else if(nodeId==='ServiceCategory'){
						content=<ListApiCategoryNode appId={this.appId} categoryId={this.appId+'.ServiceCategory'}  />;
				}else if(nodeId==='ViewCategory'){
						content=<ListAppServiceCategoryNode categoryId={this.appId+'.TemplateCategory'} appId={this.appId}/>;
				}else if(nodeId==='FileCategory'){
						content=<ListAppServiceCategoryNode categoryId={this.appId+'.FileCategory'} appId={this.appId}  />;
				}else if(nodeId==='SqlCategory'){
						content=<ListAppServiceCategoryNode categoryId={this.appId+'.SqlCategory'} appId={this.appId}  />;
				}else if(nodeId==='LanguageTag'){
						content=<Setting_Langs  appId={this.appId}  />;
				}
	    }else if(resId==="SqlConfig"){
		    content=(<ListSqlConfig appId={this.appId} categoryId={categoryId} />); //sql管理
	    }else{
	    	content=(<Card title={resName}>不支持的类型</Card>);
			}
	    const paneItem={ title: resName, content: content, key: activeKey };
			let x=this.contains(panes,paneItem); //找到已经存在的位置,0表示不存在没有找到
	    if(x===-1){
	    		panes.push(paneItem); //新增加一个
		  }else{
				  panes.splice(x,1,paneItem);//更新pane
			}
			this.menuNodeObj={};
	    this.setState({ panes, activeKey});
	}

	contains=(panes, paneItem)=>{
		for(let i=0;i<panes.length;i++){
			// console.log(panes[i].key===paneItem.key);
			if(panes[i].key===paneItem.key){
				return i;
			}
		}
		return -1;
	}

	//type="editable-card"

	render(){
	  return (
	  		<div  >
		        <Tabs
			        onChange={this.onChange}
			        onEdit={this.onEdit}
			        activeKey={this.state.activeKey}
			        animated={false}
			        hideAdd={true}
							style={{fontSize:'16px',padding:0}}
							size='large'
							type="editable-card"
			      >
			      <TabPane tab="Home" key="devindex" style={{padding:'0px'}}  >
 				 			{this.state.appRows}
 				 		</TabPane>
 				 		{this.state.panes.map(pane => <TabPane tab={pane.title}  key={pane.key} >{pane.content}</TabPane>)}
 				</Tabs>
			</div>
		);
	 }
};

export default DesignerRigthHome;
