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
import LeftMenu from "./LeftMenu_Org";
import Org_CompanyList from "./grid/ListCompany";
import Org_DeptList from "./grid/ListDepartments";
import Org_PersonList from "./grid/ListPersons";
import ListPersonsPartTimeDept from "./grid/ListPersonsPartTimeDept";
import ListRoles from "./grid/ListRoles";
import ListAllPermissions from "./grid/ListAllPermissions";
import ListMenuCategory from "../appmenu/grid/ListMenuCategory";
import LayoutPage from "../../core/components/layout";

//org首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "core";
    this.state = {
      mask: true,
      collapsed: false,
      reload: true,
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuId: "Org_CompanyList",
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
    if (menuId === "Org_CompanyList") {
      title = "机构管理";
      content = <Org_CompanyList />;
    } else if (menuId === "Org_DeptList") {
      title = "部门管理";
      content = <Org_DeptList />;
    } else if (menuId === "Org_PersonList") {
      title = "帐号管理";
      content = <Org_PersonList />;
    } else if (menuId === "ListRoles") {
      title = "角色管理";
      content = <ListRoles />;
    } else if (menuId === "ListAllPermissions") {
      title = "权限管理";
      content = <ListAllPermissions />;
    } else if (menuId === "ListMenuCategory") {
      title = "菜单管理";
      content = <ListMenuCategory appId="*" />;
    }
    this.menuPath = title.split("/");

    return (
			<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} appId={this.appId} pageId={this.pageId}
					></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					headerConfigBtn = {{
						home:true,
						profile:true,
						logout:true,
					}}
        />
    );
  }
}

export default IndexLayout;
