import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Dropdown,Avatar,Card,Row,Col,Popover,Spin,Typography,Modal} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import * as ContextUtils from '../core/utils/ContextUtils';
import PageFooter from '../core/components/PublicPageFooter';
import IndexLayout_body from './IndexLayout_body';
import ImportData from './ImportData';
import ChangeServer from '../core/components/ChangeServer';
import UserProfile from './UserProfile';
import ListMessage from './message/grid/ListMessage';
import moduleCss from "../apiportal/lifecycle/css/topmenu.css";

//系统首页

const { Title } = Typography;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const loadDataUrl=host+"/rest/base/portal/modules/level/1"; //URI.CORE_HOMEPAGE.GetPortalModules;
const CountUrl=URI.CORE_HOMEPAGE.GetPortalTopWarningCount;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='rc';
    this.state={
        mask:false,
        isDesigner:false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好!",
        menuId:'',
        searchKeyWords:'',
        data:{data:[{menuId:'api'}]},
        messageData:{warningCount:0}
      }
  }

  componentDidMount(){
    this.loadData();
    this.setState({mask:true});
    AjaxUtils.get(loadDataUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  //载入菜单
  loadData=()=>{
    AjaxUtils.get(CountUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({messageData:data});
        }
    });
  }

  handleClick=(item)=>{
    if(item.key=='apiportal'){
      let url=URI.rootPath+"/apiportal";
      let openurl=window.location.protocol+"//"+window.location.host+url;
      if(item.url!='' && item.url!==undefined){openurl=item.url;}
      window.open(openurl,"apiportal");
    }else{
      this.setState({menuId:item.key});
    }
  }

  search=(searchKeyWords)=>{
    this.setState({searchKeyWords:searchKeyWords});
  }

  //设置菜单点击执行
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(key==='changeServer'){
      this.setState({visible:true,menuId:key});//切换服务器
    }else if(key==='warning'){
      this.setState({menuId:'WarningMessage'});//切换服务器
    }else if(key==='import'){
      this.setState({visible:true,menuId:key});//切换服务器
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

  handleCancel = (e) => {
    this.setState({ visible: false });
  }

  render(){
    let content,modalForm;
    let modalTitle='';
    let menuId=this.state.menuId==''?this.state.data.data[0].menuId:this.state.menuId;
    if(menuId==='import'){
      modalForm=<ImportData close={this.handleCancel} />;
      modalTitle='导入设计';
      content=<IndexLayout_body  categoryId={this.state.data.data[0].menuId} />;
    }else if(menuId==='UserProfile'){
      modalTitle='帐号信息';
      content=<IndexLayout_body  categoryId='UserProfile' />;
    }else if(menuId==='WarningMessage'){
        modalTitle='预警消息';
        content=<IndexLayout_body  categoryId='WarningMessage' />;
    }else if (menuId === "changeServer") {
      modalForm = <ChangeServer close={this.handleCancel} />;
      modalTitle = "切换服务器";
      content=<IndexLayout_body  categoryId={this.state.data.data[0].menuId} />;
    }else{
      modalTitle='平台首页';
      content=<IndexLayout_body  categoryId={menuId} />;
    }
    this.menuPath=modalTitle.split("/");


    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title={modalTitle} maskClosable={false}
          visible={this.state.visible}
          footer=''
          width='760px'
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          {modalForm}
      </Modal>
      <Layout >
                <Header style={{height:'65px',padding:0}} >
                  <div  style={{margin:0,position:'fixed',top:0,zIndex:100,width:'100%',background:URI.Theme.topLayoutBackground,padding:0,borderBottom:'1px solid #ccc'}} >
                    <div style={{width:'199px',float:'left'}}>
                      <div className={URI.Theme.logoClass} />
                    </div>
                    <div style={{width:'680px',float:'left'}} className="apiPortal-menu">
                      <Menu
                        mode="horizontal"
                        defaultSelectedKeys={[this.state.data.data[0].menuId]}
                        style={{ lineHeight: '64px'}}
                        onClick={this.handleClick}
                        className={moduleCss.topantmenu}
                      >{
                        this.state.data.data.map((item)=>{
                          return <Menu.Item style={{fontSize:'14px'}}  key={item.menuId}>{item.text}</Menu.Item>;
                        })
                      }
                      </Menu>
                    </div>
                    <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                    <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'warning')} ><Badge count={this.state.messageData.warningCount} overflowCount={99}  style={{ backgroundColor: '#f50',marginTop:'-6px' }} ><Icon type="bell" style={{fontSize:'16px'}} /></Badge></span>
                    <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'changeServer')} ><Icon type="sync" />切换</span>
                    <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'import')} ><Icon type="upload" />导入</span>
                          <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                     </div>
                     <div
										 	className='header-userInfo'
                       style={{
                         padding: 0,
                         margin: "0 20px 0 0",
                         float: "right",
                         fontSize: "12px",
                         color: URI.Theme.userInfoColor,
                       }}
                     >
                       <span  onClick={this.topMenuClick.bind(this, "profile")} style={{ cursor: "pointer" }}>
                         <Popover placement="bottom" content={URI.currentServerHost} title="当前服务器">
                             <Avatar
                               src={URI.userAvatarUrl}
                               size={32}
                               style={{ marginRight: "8px", backgroundColor: "#7265e6" }}
                             />
                         </Popover>
                         {" "}
                         {this.state.userInfo}
                       </span>
                     </div>
                    </div>
                </Header>
                <div style={{minHeight:'600px',background:'#fff'}}>
                {content}
                </div>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout;
