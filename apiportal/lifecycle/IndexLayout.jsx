import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Dropdown,Avatar,Card,Row,Col,Popover,Spin,Typography} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as ContextUtils from '../../core/utils/ContextUtils';
import PageFooter from '../../core/components/PublicPageFooter';
import ApiListLayout from './apisearch/ApiListLayout';
import ListApiByAppId_List from './apisearch/ListApiByAppId_List';
import ApiRegLayout from './apiregister/IndexLayout';
import ApiStdmgrLayout from './apistdmgr/IndexLayout';
import ApiApproveLayout from './apiapprove/IndexLayout';
import ApiStdViewLayout from './apistdview/IndexLayout';
import ListApiFollows from '../grid/ListApiFollows';
import ListApiVersionChange from '../grid/ListApiVersionChange';
import ListApiByPublishUserId from '../grid/ListApiByPublishUserId';
import moduleCss from "./css/topmenu.css";

//API管理门户首页
const { Title } = Typography;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const CountUrl=URI.CORE_APIPORTAL_HOEMMENU.leftmenuCount;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='apiportal';
    this.state={
        mask:false,
        isDesigner:false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好!",
        menuKey:'LeftMenu_System',
        searchKeyWords:'',
        data:{"approverCount":0,"appyCount":0,"followCount":0,"publishCount":0,"changeCount":0}
      }
  }

  componentDidMount(){
    ContextUtils.getContext((data)=>{
      if(data.permissionId.indexOf('core.superadmin')!=-1 || data.permissionId.indexOf('core.appdesigner')!=-1){
        this.setState({isDesigner:true});
      }
      this.loadData();
    });
  }

  //载入菜单
  loadData=()=>{
    AjaxUtils.get(CountUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  handleClick=(item)=>{
    this.setState({menuKey:item.key,searchKeyWords:''});
  }

  search=(searchKeyWords)=>{
    this.setState({searchKeyWords:searchKeyWords});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }else if(key==='ListApiVersionChange'){
      this.setState({menuKey:'ListApiVersionChange',searchKeyWords:''});
    }
  }

  render(){
    let content='';
    let menuKey=this.state.menuKey;
    let searchKeyWords=this.state.searchKeyWords;
    if(searchKeyWords!=''){
      content=<div style={{margin:'10px 0 0 0'}}>
      <center><Title level={3}>API搜索结果</Title></center>
      <ListApiByAppId_List searchKeyWords={searchKeyWords} />
      </div>;
    }else if(menuKey=='LeftMenu_System'){
      content=<ApiListLayout menuType='LeftMenu_System' />;
    }else if(menuKey=='LeftMenu_BUArea'){
      content=<ApiListLayout menuType='LeftMenu_BUArea' />;
    }else if(menuKey=='LeftMenu_ApiTags'){
      content=<ApiListLayout menuType='LeftMenu_TagsName' />;
    }else if(menuKey=='apireg'){
      content=<ApiRegLayout />;
    }else if(menuKey=='apistdmgr'){
      content=<ApiStdmgrLayout />;
    }else if(menuKey=='apiapprove'){
      content=<ApiApproveLayout />;
    }else if(menuKey=='apistdview'){
      content=<ApiStdViewLayout />;
    }else if(menuKey=='ListApiFollows'){
      content=<Card title={<Title level={4}>我关注的API</Title>} size='small' style={{margin:'20px'}} ><ListApiFollows /></Card>;
    }else if(menuKey=='ListApiVersionChange'){
      content=<Card title={<Title level={4}>API版本变更通知</Title>} size='small' style={{margin:'20px'}} ><ListApiVersionChange /></Card>;
    }else if(menuKey=='ListApiByPublishUserId'){
      content=<Card title={<Title level={4}>我发布的API</Title>} size='small' style={{margin:'20px'}} ><ListApiByPublishUserId /></Card>;
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
                <Header style={{height:'65px',padding:0}} >
                  <div  style={{margin:0,position:'fixed',top:0,zIndex:100,width:'100%',background:URI.Theme.topLayoutBackground,padding:0,borderBottom:'1px solid #ccc'}} >
                    <div style={{width:'199px',float:'left'}}>
                      <div className={URI.Theme.logoClass} />
                    </div>
                    <div style={{width:'450px',float:'left'}} className="apiPortal-menu">
                      <Menu
                        mode="horizontal"
                        defaultSelectedKeys={['LeftMenu_System']}
                        style={{ lineHeight: '64px'}}
                        onClick={this.handleClick}
                        className={moduleCss.topantmenu}
                      >
                       <SubMenu key="1" title={<span style={{fontSize:'14px'}}>API能力中心</span>} >
                          <Menu.Item style={{fontSize:'14px'}} key="LeftMenu_System">按应用系统</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key="LeftMenu_BUArea">按业务域</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key="LeftMenu_ApiTags">按API标签</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key="ListApiByPublishUserId">我发布的API</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key="ListApiFollows">我关注的API</Menu.Item>
                        </SubMenu>
                        {this.state.isDesigner?
                        <SubMenu key="2" title={<span style={{fontSize:'14px'}}>服务注册</span>} >
                            <Menu.Item style={{fontSize:'14px'}} key="apistdmgr">标准管理</Menu.Item>
                           <Menu.Item style={{fontSize:'14px'}} key="apireg">API注册</Menu.Item>
                         </SubMenu>
                         :''}
                        <Menu.Item  key="apiapprove"><span style={{fontSize:'14px'}}>服务审核</span><Badge count={this.state.data.approverCount} overflowCount={99}  style={{ backgroundColor: 'green',marginTop:'-4px',marginLeft:'3px' }} ></Badge></Menu.Item>
                        <Menu.Item style={{fontSize:'14px'}} key="apistdview">接入规范</Menu.Item>
                      </Menu>
                    </div>
                    <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                          <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                          <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'ListApiVersionChange')} ><Badge count={this.state.data.changeCount} overflowCount={99}  style={{ backgroundColor: '#f50',marginTop:'-6px' }} ><Icon type="bell" style={{fontSize:'16px'}} /></Badge></span>
                          <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                     </div>
                     <div className='header-userInfo'  style={{padding:0,margin:'0 20px 0 0',float:'right',fontSize:'12px',color:URI.Theme.userInfoColor}}>
                            <Avatar src={URI.userAvatarUrl}  size="small" style={{ backgroundColor: '#7265e6' }}  />{' '}{this.state.userInfo}
                      </div>
                      <div style={{float:'right',margin:'0 20px 0 0'}}>
                        <Search
                         placeholder="搜索URL|名称|标签|发布者|日期"
                         style={{ width: 260 }}
                         onSearch={value => this.search(value)}
                       />
                      </div>
                    </div>
                </Header>
                <div style={{minHeight:'600px',background:'#fff'}}>
                {content}
                </div>
                <Footer style={{  padding: 15, minHeight: 90,background: '#f0f2f5' }} >
                  <PageFooter />
                </Footer>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout;
