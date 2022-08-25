import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import PageFooter from '../core/components/PublicPageFooter';
import LeftMenu from './LeftMenu';
import RightHomepage from './RightHomepage';
import ListMyFavoriteApis from './grid/ListMyFavoriteApis';
import UserProfile from './form/UserProfile';
import ListApiReqeustLog from './grid/ListApiReqeustLog';
import ListApiErrorsLog from './grid/ListApiErrorsLog';
import ListMyPublishAPI from './grid/ListMyPublishAPI';
import ListAuthenticationType from './grid/ListAuthenticationType';
import ListApplication from '../apiportal/grid/ListApplication';

//API市场管理界面布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state={
        key:'home',
        mask:true,
        collapsed: false,
        menuId:'home',
        leftMenuWidth:240,
        reload:true,
        menuNodeObj:{},
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo((data)=>{
      if(data.modules===undefined || data.modules.indexOf("market")!==-1){
        this.setState({mask: false});
      }
    });
  }

  toggle = () => {
      this.setState({
        collapsed: !this.state.collapsed,
        leftMenuWidth:this.state.collapsed?240:75,
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
    this.setState({menuId:key});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      window.open('../market/index.html');
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
      content=<RightHomepage  detailClick={this.handleClick} />;
    }else if(menuId==='myfavapis'){
        title='我收藏的API';
      content=<ListMyFavoriteApis />;
    }else if(menuId==='UserProfile'){
        title='个人信息';
      content=<UserProfile />;
    }else if(menuId==='apilog'){
        title='API调用日志';
      content=<ListApiReqeustLog />;
    }else if(menuId==='errorlog'){
        title='API错误日志';
      content=<ListApiErrorsLog />;
    }else if(menuId==='ListMyPublishAPI'){
        title='我发布的API';
      content=<ListMyPublishAPI />;
    }else if(menuId==='ListAuthenticationType'){
        title='认证信息配置';
      content=<ListAuthenticationType />;
    }else if(menuId==='ListApplication'){
        title='应用管理';
        content=<ListApplication />;
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
                width={240}
                collapsible
                className="title-menu-min"
                collapsed={this.state.collapsed}
                style={{background:URI.Theme.leftLayoutBackground,overflow: 'auto',height: '100vh',position: 'fixed',left: 0}}
              >
                <div style={{height:'64px'}}>
                  <div className={URI.Theme.logoClass} />
                </div>
                <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout  style={{ marginLeft: this.state.leftMenuWidth }} >
                <Header style={{padding:0,background:URI.Theme.topLayoutBackground}} >
                  <Icon
                    className={URI.Theme.monitorTrigger}
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                  <span dangerouslySetInnerHTML={{__html:AjaxUtils.getEnvironmentInfo()}}  style={{height:'60px',color:URI.Theme.userInfoColor}}></span>
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                      <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                      <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                 </div>
                 <div  style={{padding:0,margin:'0 20px 0 0',float:'right',fontSize:'12px',color:URI.Theme.userInfoColor}}>
                        <Avatar src={URI.userAvatarUrl}  size="small" style={{ backgroundColor: '#7265e6' }}  />{' '}
                        <Popover content={URI.currentServerHost} title="当前服务器">
                           {this.state.userInfo}
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
