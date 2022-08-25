import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import * as ContextUtils from '../core/utils/ContextUtils';
import PageFooter from '../core/components/PublicPageFooter';
import RightHomepage from './RightHomepage';
import ListApplication from './grid/ListApplication';
import LeftMenu from './LeftMenu';
import ListAppPropertiesByAppId from '../designer/designer/grid/ListAppPropertiesByAppId';
import ListApiByApprover from './grid/ListApiByApprover';
import ListApiByAppyUser from './grid/ListApiByAppyUser';
import ListApiFollows from './grid/ListApiFollows';
import APIGuide from './form/APIGuide';
import ListTestServicesLog from './grid/ListTestServicesLog';
import ListApiByPublishUserId from './grid/ListApiByPublishUserId';
import ListApiByAppId from './grid/ListApiByAppId';
import UserProfile from '../portal/UserProfile';
import ListApiVersionChange from './grid/ListApiVersionChange';

//API内网门户首页布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='apiportal';
    if(URI.gotalApiPortalThemeList){
      this.Theme=URI.Theme;
    }else{
      this.Theme=URI.BlackLight;
    }
    this.state={
        key:'home',
        mask:false,
        collapsed: false,
        menuId:'home',
        reload:true,
        isDesigner:false,
        menuNodeObj:{},
        leftMenuWidth:200,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
    ContextUtils.getContext((data)=>{
      if(data.permissionId.indexOf('core.superadmin')!=-1 || data.permissionId.indexOf('core.appdesigner')!=-1){
        this.setState({isDesigner:true});
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
    if(key=='allapis'){
      browserHistory.push(URI.adminIndexUrl+"/apiportal/view");
    }else{
      this.setState({menuId:key});
    }
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }else if(key==='apiguide'){
      this.setState({menuId:"apiguide"});
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let menuItemArray=menuId.split("#");
    menuId=menuItemArray[0];
    let title="";
    if(menuId==='home'){
      title='系统首页';
      content=<RightHomepage appId={this.appId} detailClick={this.handleClick} />;
    }else if(menuId==='appConfig'){
        title='应用管理';
      content=<ListApplication />;
    }else if(menuId==='variantConfig'){
      title="变量配置管理";
      content=<ListAppPropertiesByAppId appId={this.appId}  />;
    }else if(menuId==='todolist'){
      title="待审批API";
      content=<ListApiByApprover appId={this.appId}  />;
    }else if(menuId==='myappyapi'){
      title="我申请的API";
      content=<ListApiByAppyUser appId={this.appId}  />;
    }else if(menuId==='followapi'){
      title="我关注的API";
      content=<ListApiFollows appId={this.appId}  />;
    }else if(menuId==='apiguide'){
      title="API调用指南";
      content=<APIGuide appId={this.appId}  />;
    }else if(menuId==='testapi'){
      title="API测试记录";
      content=<ListTestServicesLog appId={this.appId}  />;
    }else if(menuId==='mypublishs'){
      title="我发布的API列表";
      content=<ListApiByPublishUserId appId={this.appId}  />;
    }else if(menuId==='UserProfile'){
      title="帐号信息";
      content=<UserProfile />;
    }else if(menuId==='allapis'){
      title="所有API列表";
      content=<ListApiByAppId appId='' categoryId='' />;
    }else if(menuId==='changeapi'){
      title="API变更通知";
      content=<ListApiVersionChange  />;
    }

    this.menuPath=title.split("/");

    if(menuId!=='home'){
      content=<span>
        <div style={{ margin: '2px 0 2px 0 ', padding: 15,  }}>
          <Breadcrumb style={{margin:'0 0 0 10px'}}>
             {this.menuPath.map((item)=>{
               return <Breadcrumb.Item key={item} >{item}</Breadcrumb.Item>;
             })}
           </Breadcrumb>
         </div>
         <Content style={{ minHeight:'600px',margin: '1px 16px', padding:'15px 24px 2px 24px', background: '#fff' }}>
           {content}
         </Content>
     </span>;
   }else{
     content=<Content style={{ margin: '10px 10px', padding:'20px 20px 2px 20px'}}>
       {content}
     </Content>;
   }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
              <Sider
                trigger={null}
                width={this.state.leftMenuWidth}
                collapsible
                collapsed={this.state.collapsed}
                className="title-menu-min"
                style={{background:URI.Theme.leftLayoutBackground,overflow: 'auto',height:'100vh',position: 'fixed',left: 0}}
              >
              <div style={{height:'64px'}}>
                <div className={URI.Theme.logoClass} />
              </div>
              <LeftMenu memuClick={this.handleClick} appId={this.appId} isDesigner={this.state.isDesigner} ></LeftMenu>
              </Sider>
              <Layout style={{ marginLeft: this.state.leftMenuWidth }} >
                <Header style={{padding:0,background:this.Theme.topLayoutBackground,borderBottom:'1px solid #ccc'}} >
                  <Icon
                    className={this.Theme.monitorTrigger}
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                <span dangerouslySetInnerHTML={{__html:AjaxUtils.getEnvironmentInfo()}}  style={{height:'60px',color:this.Theme.userInfoColor}}></span>
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                      <span className={this.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                      <span className={this.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'apiguide')} ><Icon type="question-circle" />新手指引</span>
                      <span className={this.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                 </div>
                 <div  style={{padding:0,margin:'0 20px 0 0',float:'right',fontSize:'12px',color:this.Theme.userInfoColor}}>
                        <Avatar src={URI.userAvatarUrl}  size="small" style={{ backgroundColor: '#7265e6' }}  />{' '}
                        <Popover content={URI.currentServerHost} title="当前服务器">
                           <span onClick={this.topMenuClick.bind(this,'profile')} style={{cursor:'pointer'}}>{this.state.userInfo}</span>
                        </Popover>{' '}
                  </div>
                </Header>
                {content}
                <Footer style={{  padding: 15, minHeight: 90,background: '#f0f2f5' }} >
                  <PageFooter />
                </Footer>
              </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout;
