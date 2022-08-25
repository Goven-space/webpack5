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
import PageFooter from "../core/components/PublicPageFooter";
import LeftMenu from "./LeftMenu";
import RightHomepage from "./RightHomepage";
import ListTestCase from "./grid/ListTestCase";
import ListTestPlan from "./grid/ListTestPlan";
import ListTestReport from "./grid/ListTestReport";
import TestHome from "./form/Home";
import ListTestServicesLog from "./grid/ListTestServicesLog";
import PTS_ListTestConfig from "./grid/PTS_ListTestConfig";
import PTS_ListTestParams from "./grid/PTS_ListTestParams";
import UserProfile from "../portal/UserProfile";
import LayoutPage from "../core/components/layout";
//API测试平台布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: "home",
      mask: true,
      collapsed: false,
      menuId: "home",
      leftMenuWidth: 200,
      reload: true,
      menuNodeObj: {},
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules === undefined || data.modules.indexOf("test") !== -1) {
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

  render() {
    let content;
    let menuId = this.state.menuId;
    let menuItemArray = menuId.split("#");
    menuId = menuItemArray[0];
    let categoryId = menuItemArray[1];
    let nodeName = menuItemArray[2];
    // console.log("menuId=="+menuId+"==categoryId="+categoryId+"==nodeName==="+nodeName);
    let title = "";
    if (menuId === "home") {
      title = "系统首页";
      content = <RightHomepage detailClick={this.handleClick} />;
    } else if (menuId === "testcase") {
      title = "测试用例";
      content = <ListTestCase />;
    } else if (menuId === "testlog") {
      title = "测试记录";
      content = <ListTestServicesLog />;
    } else if (menuId === "testplan") {
      title = "测试计划";
      content = <ListTestPlan />;
    } else if (menuId === "testreport") {
      title = "测试报告";
      content = <ListTestReport />;
    } else if (menuId === "performanceTest") {
      title = "压力测试";
      content = <PTS_ListTestConfig />;
    } else if (menuId === "performanceTestParams") {
      title = "压测参数配置";
      content = <PTS_ListTestParams />;
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
					isNeedBreadcrumb={menuId !== "home"?true:false}
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
