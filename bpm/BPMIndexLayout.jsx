import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import PageFooter from '../core/components/PageFooter';
import ListProcess from './process/grid/ListProcess';
import RightHomepage from './RightHomepage';
import LeftMenu from './LeftMenu';
import ListAppServiceCategoryNode from './setting/ListAppServiceCategoryNode';
import ListAppPropertiesByAppId from './setting/ListAppPropertiesByAppId';
import UserProfile from '../portal/UserProfile';
import ListProcessHistory from './monitor/grid/ListProcessHistory';
import ListProcessRule from "./datarule/grid/ListProcessRule";
import ListToDo from "./todo/grid/ListToDo";
import ListDone from "./todo/grid/ListDone";
import ListEndDocs from "./todo/grid/ListEndDocs";
import LayoutPage from "../core/components/layout";
import ListServicesByAppId from "./api/ListServicesByAppId";

//esb应用-流程设计首页布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const ApplicationListUrl=URI.rootPath+"/bpm";
const ApplicationInfoUrl=URI.BPM.APPLICATION.info;

//home page
class BPMIndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='bpm';
    this.applicationId=this.props.location.query.appid;
    this.state={
        key:'home',
        mask:true,
        collapsed: false,
        menuId:'home',
        reload:true,
        menuNodeObj:{},
        leftMenuWidth:200,
        userInfo:AjaxUtils.getUserId()+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    let url=ApplicationInfoUrl+"?applicationId="+this.applicationId;
    AjaxUtils.get(url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else if(data.designer==false){
          AjaxUtils.showError("你没有对本应用的管理权限!");
        }else{
          this.setState({mask:false});
          document.title="BPM应用:"+data.applicationName;
          this.setState({applicationName:data.applicationName});
        }
    });
  }

  toggle = () => {
      this.setState({
        collapsed: !this.state.collapsed,
        leftMenuWidth:this.state.collapsed?200:75,
      });
  }

  getTime=()=>{
    let show_day=new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六');
    let today=new Date();
    let year=today.getFullYear();
    let month=today.getMonth();
    let date=today.getDate();
    let day=today.getDay();
    let now_time=(month+1)+'月'+date+'日'+' '+show_day[day]+' ';
    return now_time;
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key,processId)=>{
    this.setState({menuId:key,processId:processId});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(ApplicationListUrl);
    }else if(key==='Import'){
      this.setState({visible:true});
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let menuItemArray=menuId.split("#");
    menuId=menuItemArray[0];
    let categoryId=menuItemArray[1];
    let nodeName=menuItemArray[2];
    // console.log("menuId=="+menuId+"==categoryId="+categoryId+"==nodeName==="+nodeName);
    let title="";
    if(menuId==='home'){
      title='系统首页';
      content=<RightHomepage appId={this.appId} detailClick={this.handleClick} applicationId={this.applicationId} />;
    }else if (menuId === "rule") {
      title = "规则管理/" + nodeName;
      content = (<ListProcessRule  appId={this.appId} categoryId={categoryId} applicationId={this.applicationId} />);
    }else if (menuId === "ruleCategory") {
      title = "规则分类设置";
      content = (<ListAppServiceCategoryNode  appId={this.appId} categoryId={this.applicationId + ".ruleCategory"} applicationId={this.applicationId} />
      );
    } else if (menuId === "apiMgr") {
      title = "流程中心服务API";
      content = (
        <ListServicesByAppId
          appId={this.appId}
          categoryId='bpmclientapi'
          applicationId={this.applicationId}
        />
      );
    }else if(menuId==='process'){
      title='流程管理/流程列表';
      content=<ListProcess appId={this.appId}  categoryId={categoryId} applicationId={this.applicationId}  />;
    }else if(menuId==='processCategory'){
      title='流程分类设置';
      content=<ListAppServiceCategoryNode appId={this.appId}  categoryId={this.applicationId+'.processCategory'} applicationId={this.applicationId}  />;
    }else if(menuId==='apiCategory'){
      title='API分类设置';
      content=<ListAppServiceCategoryNode appId={this.appId}  categoryId={this.applicationId+'.ServiceCategory'} applicationId={this.applicationId}  />;
    }else if(menuId==='variantConfig'){
      title="变量配置管理";
      content=<ListAppPropertiesByAppId applicationId={this.applicationId}   appId={this.appId} />;
    }else if(menuId==='UserProfile'){
      title="帐号信息";
      content=<UserProfile />;
    }else if(menuId==='ListProcessHistory'){
      title="已归档流程";
      content=<ListProcessHistory applicationId={this.applicationId}  />;
    }else if(menuId==='ListToDo'){
      title="待审批流程";
      content=<ListToDo applicationId={this.applicationId}  />;
    }else if(menuId==='ListDone'){
      title="待审批流程";
      content=<ListDone applicationId={this.applicationId}  />;
    }else if(menuId==='ListEndDocs'){
      title="待审批流程";
      content=<ListEndDocs applicationId={this.applicationId}  />;
    }
    this.menuPath=title.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} applicationId={this.applicationId}></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					isNeedBreadcrumb={menuId !== "home"?true:false}
					headerConfigBtn = {{
						otherBtn:([<span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this, "Portal")}>
						<Icon type="home" />应用</span>]),
						logout:true,
						profile:true,
					}}
        />
      </Spin>
    );
  }
}

export default BPMIndexLayout;
