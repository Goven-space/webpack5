import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import PageFooter from '../../core/components/PublicPageFooter';
import RightHomepage from '../RightHomepage';
import LeftMenu from './ApplicationLeftMenu_all';
import ListApiByRequireAppy from '../grid/ListApiByRequireAppy';
import UserProfile from '../../portal/UserProfile';
import ShowApiDoc from '../form/ShowApiDoc';
import ApplicationRightHome from './ApplicationRightHome';

//API-所有应用API展示浏览页

const isAdminUrl=URI.LIST_APIPORTAL_APPLICATION.isAdminUrl;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;


class ApplicationLayout_all extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.location.query.appid||'';
    this.menuPath=['API浏览'];
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
        leftMenuWidth:200,
        menuNodeObj:{},
        userInfo:AjaxUtils.getUserId()+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
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
  handleClick=(key,menuNodeObj={})=>{
    if(menuNodeObj.isAppFlag && menuNodeObj.isLeaf){key="*";}
    this.setState({menuId:key,menuNodeObj:menuNodeObj});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl+"/apiportal");
    }else if(key==='ApiManager'){
      browserHistory.push(URI.adminIndexUrl+"/apiportal/application?appid="+this.appId);
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let categoryId=this.state.menuNodeObj.key;
    let nodeName=this.state.menuNodeObj.text;
    let appId=this.state.menuNodeObj.appId||'';
    if(menuId==='home'){
      this.menuPath=['API浏览',this.appId,'所有已发布API'];
      content=<ApplicationRightHome appId={this.appId} categoryId='*' />;
    }else if(menuId==='approverApis'){
      this.menuPath=['API浏览','需要申请的API',this.appId,nodeName];
      content=<ListApiByRequireAppy  appId={this.appId} categoryId={menuId} />;
    }else if(menuId==='UserProfile'){
      this.menuPath=['API浏览','帐号信息'];
      content=<UserProfile />;
    }else if(menuId=='ShowApiDoc'){
      this.menuPath=['API文档',nodeName];
      content=<ShowApiDoc id={categoryId} />;
    }else{
      this.menuPath=['API浏览',this.appId,nodeName];
      content=<ApplicationRightHome appId={appId}  categoryId={menuId} />;
    }

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
              <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout  style={{ marginLeft: this.state.leftMenuWidth }}>
                <Header style={{padding:0,background:this.Theme.topLayoutBackground,borderBottom:'1px solid #ccc'}} >
                  <Icon
                    className={this.Theme.monitorTrigger}
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                <span dangerouslySetInnerHTML={{__html:AjaxUtils.getEnvironmentInfo()}}  style={{height:'60px',color:this.Theme.userInfoColor}}></span>
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                      <span className={this.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="appstore" />API管理门户</span>
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

export default ApplicationLayout_all;
