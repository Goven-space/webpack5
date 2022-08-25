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
import ListMqSubscribe from "./grid/ListMqSubscribe";
import ListMqProducer from "./grid/ListMqProducer";
import ListTopicManager from "./grid/ListTopicManager";
import LayoutPage from "../core/components/layout";

//daas产品布局
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "mqbus";
    this.state = {
      mask: true,
      collapsed: false,
      reload: true,
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuId: "subscribe",
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules === undefined || data.modules.indexOf("mqbus") !== -1) {
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
    this.setState({ menuId: key, categoryId: key });
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
    let nodeName = menuItemArray[1];
    let title = "";
    if (menuId === "subscribe") {
      title = "消息总线/消息订阅";
      content = <ListMqSubscribe appId={this.appId} />;
    } else if (menuId === "ListMqProducer") {
      title = "消息总线/消息发布";
      content = <ListMqProducer appId={this.appId} />;
    } else if (menuId === "ListTopicManager") {
      title = "消息总线/主题管理";
      content = <ListTopicManager appId={this.appId} />;
    } else if (menuId === "UserProfile") {
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
