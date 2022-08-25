import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Avatar,Card,Row,Col,Popover,Modal,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ChangeServer from '../../core/components/ChangeServer';
import PageFooter from '../../core/components/PageFooter';
import LeftMenu from './ApplicationLeftMenu';
import HomepageAllApps from './HomepageAllApps';
import ListApplicationsManager from './grid/ListApplicationsManager';
import UserProfile from '../../portal/UserProfile';
import ToDayLog from '../monitor/form/ToDayLog';
import ListClusterServer from '../monitor/grid/ListClusterServer';
import ShowJvmInfo from '../../monitor/jvm/ShowJvmInfo';
import ListProcessRunReport from '../monitor/grid/ListProcessRunReport';
import ListLocalCacheServer from '../../monitor/apimonitor/grid/ListLocalCacheServer';
import LayoutPage from "../../core/components/layout";

//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class ApplicationIndex extends React.Component {
  constructor(props) {
    super(props);
    this.appId="esb";
    this.menuId=['ListApplications'];
    this.state={
        key:'home',
        mask:true,
        visible:false,
        collapsed: false,
        userInfo:AjaxUtils.getUserId()+" 您好 "+this.getTime(),
        menuId:'ListApplications',
        appName:'Home',
        menuNodeObj:{},
        leftMenuWidth:200,
        menuData:[],
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo((data)=>{
      if(data.modules===undefined || data.modules.indexOf("bpm")!==-1){
        //包含esb模块时打开mask
        this.setState({mask: false});
      }
    });
  }

  toggle = () => {
      this.setState({
        collapsed: !this.state.collapsed,
        leftMenuWidth:this.state.collapsed?200:75,
      });
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
    this.setState({menuId:key});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    let content,title;
    let menuId=this.state.menuId;
    if(this.state.menuId==='ListMyApps'){
      title='我的应用';
      content=<HomepageAllApps categoryId='myapps' />;
    }else if(this.state.menuId==='ListApplications'){
      title='所有应用';
      content=<HomepageAllApps categoryId='*' />;
    }else if(this.state.menuId==='ListApplicationsManager'){
      title='应用管理';
      content=<ListApplicationsManager  />;
    }else if(this.state.menuId==='UserProfile'){
      title="帐号信息";
      content=<UserProfile />;
    }else if(menuId==='ToDayLog'){
      title="控制台日志";
      content=<ToDayLog appId={this.appId} />;
    }else if(menuId==='RamAndThead'){
      title='内存及线程监控';
      content=<ShowJvmInfo appId={this.appId}  applicationId={this.applicationId}  />;
    }else if(menuId==='ClusterServer'){
      title='集群服务器监控';
      content=<ListClusterServer appId={this.appId}  applicationId={this.applicationId}  />;
    }else if(menuId==='ListLocalCacheServer'){
      title='注册中心服务实例';
      content=<ListLocalCacheServer appId={this.appId}  applicationId={this.applicationId}  />;
    }else if(menuId==='ProcessReport'){
      title='流程统计分析';
      content=<ListProcessRunReport appId={this.appId} detailClick={this.handleClick} applicationId={this.applicationId}  />;
    }else{
      title='应用分类';
      content=<HomepageAllApps categoryId={menuId} />;
    }
    this.menuPath=title.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
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

export default ApplicationIndex;
