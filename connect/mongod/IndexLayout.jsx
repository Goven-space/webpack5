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
import * as URI from "../../core/constants/RESTURI";
import * as AjaxUtils from "../../core/utils/AjaxUtils";
import PageFooter from "../../core/components/PageFooter";
import LeftMenu from "./LeftMenu";
import RightHome from "./RightHome";
import ListAppServiceCategoryNode from "./obj/grid/ListMongoOBJCategoryNode";
import ListMongoOBJ from "./obj/grid/ListMongoOBJ";
import ListApisByAppId from "./obj/grid/ListApisByAppId";
import UserProfile from "../../portal/UserProfile";
import LayoutPage from "../../core/components/layout";

//mongodb产品布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "mongo";
    this.state = {
      key: "home",
      mask: true,
      collapsed: false,
      menuId: "mongoObj_all",
      reload: true,
      menuNodeObj: {},
      leftMenuWidth: 200,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (
        data.modules === undefined ||
        data.modules.indexOf("mongo") !== -1 ||
        data.connector == undefined ||
        data.connector.indexOf("mongo") !== -1 ||
        data.connector == "*"
      ) {
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
    } else if (key === "Import") {
      this.setState({ visible: true });
    } else if (this.state.menuId === "UserProfile") {
      this.state.menuNodeObj.menuPath = "帐号信息";
      content = <UserProfile />;
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
    // let menuItemArray=menuId.split("#");
    // menuId=menuItemArray[0];
    // let nodeName=menuItemArray[1];
    let title = "";
    if (menuId === "mongoObj_all") {
      title = "Mongo 数据对象/所有数据对象列表";
      content = <ListMongoOBJ appId={this.appId} categoryId="all" />;
    } else if (menuId === "mongoObjCategory") {
      title = "Mongo 数据对象管理/分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.appId + ".mongoObjCategory"}
          id=""
        />
      );
    } else if (menuId === "mongoScriptCategory") {
      title = "Mongo 数据脚本管理/分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.appId + ".mongoScriptCategory"}
          id=""
        />
      );
    } else if (menuId === "all.mongoScript") {
      title = "Mongo 数据脚本管理/所有脚本";
      content = (
        <ListMongoScript
          appId={this.appId}
          categoryId={this.appId + ".mongoScript"}
          id=""
        />
      );
    } else if (menuId === "mongoAllService") {
      title = "Mongo 数据脚本管理/所有脚本";
      content = <ListApisByAppId appId={this.appId} />;
    } else if (this.state.menuId === "UserProfile") {
      this.state.menuNodeObj.menuPath = "帐号信息";
      content = <UserProfile />;
    } else {
      title = "Mongo 数据对象管理/所有对象";
      content = <ListMongoOBJ appId={this.appId} categoryId={menuId} />;
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
