import React from "react";
import {
  Layout,
  Menu,
  Icon,
  Input,
  Badge,
  Breadcrumb,
  Dropdown,
  Avatar,
  Card,
  Row,
  Col,
  Popover,
  Spin,
} from "antd";
import { browserHistory } from "react-router";
import * as URI from "../core/constants/RESTURI";
import * as AjaxUtils from "../core/utils/AjaxUtils";
import PageFooter from "../core/components/PageFooter";
import LeftMenu from "./LeftMenu";
import UserProfile from "../portal/UserProfile";
import ListHttpConfig from "./grid/ListHttpConfig";
import ListTcpipConfig from "./grid/ListTcpipConfig";
import ListDatabaseConfig from "./grid/ListDatabaseConfig";
import ListAllSQL from "./grid/ListAllSQL";
import ListAllApis from "./grid/ListAllApis";
import LayoutPage from "../core/components/layout";

//proxy API录制产品布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "sapconnect";
    this.state = {
      key: "home",
      mask: true,
      collapsed: false,
      menuId: "home",
      reload: true,
      menuNodeObj: {},
      leftMenuWidth: 200,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules === undefined || data.modules.indexOf("proxy") !== -1) {
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

  close = () => {
    this.setState({ menuId: "new" });
  };

  render() {
    let content;
    let menuId = this.state.menuId;
    let menuItemArray = menuId.split("#");
    menuId = menuItemArray[0];
    let categoryId = menuItemArray[1];
    let nodeName = menuItemArray[2];
    let title = "";
    if (menuId === "httpConfig" || menuId === "home") {
      title = "HTTP代理配置";
      content = <ListHttpConfig />;
    } else if (menuId === "tcpipConfig") {
      title = "TCPIP代理配置";
      content = <ListTcpipConfig />;
    } else if (menuId === "databaseConfig") {
      title = "数据库代理配置";
      content = <ListDatabaseConfig />;
    } else if (menuId === "ListAllSQL") {
      title = "所有识别的SQL语句";
      content = <ListAllSQL />;
    } else if (menuId === "ListAllApis") {
      title = "所有识别的API接口";
      content = <ListAllApis />;
    } else if (this.state.menuId === "UserProfile") {
      this.state.menuNodeObj.menuPath = "帐号信息";
      content = <UserProfile />;
    }
    this.menuPath = title.split("/");

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

export default IndexLayout;
