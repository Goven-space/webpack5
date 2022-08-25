import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import LeftMenu from './LeftMenu';
import ListApiByManager from './ListApiByManager';
import ListApplication from '../apistdmgr/ListApplication';

//API注册管理主入口

const isAdminUrl=URI.LIST_APIPORTAL_APPLICATION.isAdminUrl;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.menuPath=['API注册'];
    if(URI.gotalApiPortalThemeList){
      this.Theme=URI.Theme;
    }else{
      this.Theme=URI.BlackLight;
    }
    this.state={
        key:'home',
        mask:false,
        menuId:'home',
        reload:true,
        leftMenuWidth:200,
        menuNodeObj:{},
      }
  }

  componentDidMount(){
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key,menuNodeObj={})=>{
    if(menuNodeObj.isAppFlag && menuNodeObj.isLeaf){key="*";}
    this.setState({menuId:key,menuNodeObj:menuNodeObj});
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let categoryId=this.state.menuNodeObj.key||'';
    let nodeName=this.state.menuNodeObj.text||'我注册的API';
    let appId=this.state.menuNodeObj.appId||'';
    let appName=this.state.menuNodeObj.appName||'';
    let isAppFlag=this.state.menuNodeObj.isAppFlag;
    if(isAppFlag){
      categoryId=""; //是应用的情况下不能按categoryId去查找api列表
    }
    this.menuPath=['API注册',appName,nodeName];
    if(menuId=='ListApplication'){
      content=<ListApplication />;
    }else{
      content=<ListApiByManager appId={appId}  categoryId={categoryId} />;
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
                className="title-menu-min-w"
                style={{background:URI.Theme.leftLayoutBackground,overflow: 'auto',height:'100vh',position: 'fixed',left: 0}}
              >
              <LeftMenu memuClick={this.handleClick} ></LeftMenu>
              </Sider>
              <Layout  style={{ marginLeft: this.state.leftMenuWidth }}>
                {content}
              </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout;
