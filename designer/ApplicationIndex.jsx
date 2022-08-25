import React from "react";
import {
  Layout,
  Menu,
  Spin,
} from "antd";
import { browserHistory } from "react-router";
import * as URI from "../core/constants/RESTURI";
import * as AjaxUtils from "../core/utils/AjaxUtils";
import ChangeServer from "../core/components/ChangeServer";
import PageFooter from "../core/components/PageFooter";
import LeftMenu from "./ApplicationLeftMenu";
import ListAllApps from "./AppManager/AllApps";
import AppManager from "./AppManager/grid/ListAllApps";
import AppVersionManager from "./AppManager/grid/ListAppVersions";
import LayoutPage from "../core/components/layout";
import UserProfile from "../portal/UserProfile";

//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class ApplicationIndex extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "portal";
    this.menuId = ["ListAllApps"];
    this.state = {
      key: "home",
      mask: true,
      visible: false,
      collapsed: false,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
      menuId: "ListAllApps",
      appName: "Home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
    // window.document.title="API网关-"+window.document.title;
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules.indexOf("designer") !== -1) {
        this.setState({ mask: false });
      }
    });
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 80,
    });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl);
    } else if (key === "profile") {
      this.setState({ menuId: "UserProfile" }); //切换服务器
    }
  };

  getTime = () => {
    let show_day = new Array(
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六"
    );
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();
    let day = today.getDay();
    let now_time = month + 1 + "月" + date + "日" + " " + show_day[day] + " ";
    return now_time;
  };

  //左则菜单子组件中点击执行本函数
  handleClick = (key) => {
    this.setState({ menuId: key });
  };

  handleCancel = (e) => {
    this.setState({ visible: false });
  };

  render() {
    let content, title;
    let menuId = this.state.menuId;
    if (this.state.menuId === "ListMyApps") {
      title = "我的应用";
      content = <ListAllApps categoryId="myapps" />;
    } else if (this.state.menuId === "AppManager") {
      title = "应用管理";
      content = <AppManager />;
    } else if (this.state.menuId === "AppVersionManager") {
      title = "版本管理";
      content = <AppVersionManager />;
    } else if (this.state.menuId === "UserProfile") {
      title = "帐号信息";
      content = <UserProfile />;
    } else {
      title = "所有应用";
      content = <ListAllApps categoryId={menuId} />;
    }
    this.menuPath = title.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					headerConfigBtn = {{
						home:true,
						logout:true,
						profile:true,
					}}
        />
      </Spin>
    );
  }
}

export default ApplicationIndex;
