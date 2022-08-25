import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import PageFooter from '../../core/components/PageFooter';
import LeftMenu from './LeftMenu';
import UserProfile from '../../portal/UserProfile';
import ListApiByManager from './grid/ListApiByManager';
import ListAppPropertiesByAppId from './grid/ListAppPropertiesByAppId'
import ListApiCategoryNode from '../../apiportal/grid/ListApiCategoryNode';
import ListBeansByInterface from './grid/ListBeansByInterface';
import ListDataFiltersRule from './grid/ListDataFiltersRule';
import ListAuthentication from '../../gateway/security/grid/ListAuthentication';
import LayoutPage from "../../core/components/layout";

//系统链接器布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const checkAclUrl=URI.LIST_APP.checkAppAcl;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.location.query.appid;
    this.state={
        mask:true,
        collapsed: false,
        reload:true,
        menuNodeObj:{},
        leftMenuWidth:200,
        menuId:'*#所有API列表',
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    let url=checkAclUrl+"?appId="+this.appId;
    AjaxUtils.get(url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({mask:false});
          document.title=data.appName+"-开发";
          this.setState({appName:data.appName});
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
  handleClick=(key)=>{
    this.setState({menuId:key,categoryId:key});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

 close=()=>{
   this.setState({menuId:'new'});
 }

  render(){
    let content;
    let menuId=this.state.menuId;
    let menuItemArray=menuId.split("#");
    menuId=menuItemArray[0];
    let nodeName=menuItemArray[1];
    let title="";
    if(menuId==='authConfig'){
      title='链接器认证信息';
      content=<ListApiByManager appId={this.appId} />;
    }else if(menuId==='rules'){
      title='集成插件管理';
      content=<ListBeansByInterface appId={this.appId} />;
    }else if(menuId==='category'){
      title='API分类管理';
      content=<ListApiCategoryNode categoryId={this.appId+'.ServiceCategory'}  appId={this.appId} />;
    }else if(menuId==='variantConfig'){
      title='链接器配置';
      content=<ListAppPropertiesByAppId appId={this.appId} />;
    }else if(menuId==='reqDataFilters'){
      title='请求数据转换规则';
      content=<ListDataFiltersRule appId={this.appId} dataDirection='IN' />;
    }else if(menuId==='resDataFilters'){
      title='返回数据转换规则';
      content=<ListDataFiltersRule appId={this.appId} dataDirection='OUT' />;
    }else if(menuId==='ListAuthentication'){
      title='认证插件管理';
      content=<ListAuthentication appId={this.appId} />;
    }else{
      title="API列表/"+nodeName;
      content=<ListApiByManager appId={this.appId} categoryId={menuId} />;
    }
    this.menuPath=title.split("/");


    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
				<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} appId={this.appId}></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					headerConfigBtn = {{
						home: true,
						logout:true,
						profile:true,
					}}
        />
      </Spin>
    );
  }
}

export default IndexLayout;
