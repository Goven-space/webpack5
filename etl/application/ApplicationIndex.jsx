import React from "react";
import {
  Layout,
  Menu,
  Icon,
  Input,
  Badge,
  Breadcrumb,
  Avatar,
  Card,
  Row,
  Col,
  Popover,
  Modal,
  Spin,
} from "antd";
import { browserHistory } from "react-router";
import * as URI from "../../core/constants/RESTURI";
import * as AjaxUtils from "../../core/utils/AjaxUtils";
import ChangeServer from "../../core/components/ChangeServer";
import PageFooter from "../../core/components/PageFooter";
import LeftMenu from "./ApplicationLeftMenu";
import HomepageAllApps from "./HomepageAllApps";
import ListApplicationsManager from "./grid/ListApplicationsManager";
import UserProfile from "../../portal/UserProfile";
import ListTemplateNodeCategory from "../setting/ListTemplateNodeCategory";
import ToDayLog from "../monitor/form/ToDayLog";
import ScheduleDistributionCharts from "../report/ScheduleDistributionCharts";
import DataTransmissionCharts from "../report/DataTransmissionCharts";
import ListClusterServer from "../../monitor/apimonitor/grid/ListClusterServer";
import ShowJvmInfo from "../../monitor/jvm/ShowJvmInfo";
import ListProcessRunReport from "../monitor/grid/ListProcessRunReport";
import DataSourceDependencies from "../relationship/form/DataSourceDependencies";
import ListDataSource from "../relationship/grid/ListDataSource";
import ListApplicationErrorDataReport from "../dataquality/datalog/ListApplicationErrorDataReport";
import ListProcessTask from "../task/grid/ListProcessTask";
import ServerCountCharts from "../task/form/ServerCountCharts";
import ListProcessRule from "../datarule/grid/ListProcessRule";
import ListEngineMemroyIndocs from "../monitor/grid/ListEngineMemroyIndocs";
import ListUserLoginLogs from "../../monitor/log/ListUserLoginLogs";
import ListErrorBeans from "../../monitor/beanmonitor/grid/ListErrorBeans";
import LayoutPage from "../../core/components/layout";

//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class ApplicationIndex extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "etl";
    this.menuId = ["ListApplications"];
    this.applicationId = "ETL01";
    this.state = {
      key: "home",
      mask: true,
      visible: false,
      collapsed: false,
      userInfo: AjaxUtils.getUserId() + " 您好 " + this.getTime(),
      menuId: "ListApplications",
      appName: "Home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
    // window.document.title="API网关-"+window.document.title;
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules === undefined || data.modules.indexOf("etl") !== -1) {
        //包含etl模块时打开mask
        this.setState({ mask: false });
      }
    });
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 75,
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
    let menuItemArray = menuId.split("#");
    menuId = menuItemArray[0];
    let categoryId = menuItemArray[1];
    let nodeName = menuItemArray[2];

    if (this.state.menuId === "ListMyApps") {
      title = "我的应用";
      content = <HomepageAllApps categoryId="myapps" />;
    } else if (this.state.menuId === "ListApplications") {
      title = "所有应用";
      content = <HomepageAllApps categoryId="*" />;
    } else if (this.state.menuId === "ListApplicationsManager") {
      title = "应用管理";
      content = <ListApplicationsManager />;
    } else if (this.state.menuId === "UserProfile") {
      title = "帐号信息";
      content = <UserProfile />;
    } else if (this.state.menuId === "nodeTemplateCategory") {
      title = "组件库管理";
      content = (
        <ListTemplateNodeCategory
          appId={this.appId}
          categoryId={this.appId + ".nodeTemplateCategory"}
        />
      );
    } else if (menuId === "ToDayLog") {
      title = "控制台日志";
      content = <ToDayLog appId={this.appId} />;
    } else if (menuId === "ScheduleDistributionCharts") {
      title = "任务调度趋势";
      content = <ScheduleDistributionCharts />;
    } else if (menuId === "DataTransmissionCharts") {
      title = "数据传输趋势";
      content = <DataTransmissionCharts />;
    } else if (menuId === "RamAndThead") {
      title = "内存及线程监控";
      content = <ShowJvmInfo appId={this.appId} />;
    } else if (menuId === "ClusterServer") {
      title = "集群服务器监控";
      content = <ListClusterServer appId={this.appId} />;
    } else if (menuId === "LoginLog") {
      title = "用户登录日志";
      content = <ListUserLoginLogs appId={this.appId} />;
    } else if (menuId === "ErrorJavaBean") {
      title = "加载错误的JavaBean";
      content = <ListErrorBeans appId={this.appId} />;
    } else if (menuId === "ProcessReport") {
      title = "任务统计分析";
      content = (
        <ListProcessRunReport
          appId={this.appId}
          detailClick={this.handleClick}
          applicationId="*"
        />
      );
    } else if (menuId === "DataSourceDependencies") {
      title = "数据源关系分析";
      content = <DataSourceDependencies />;
    } else if (menuId === "TableDependencies") {
      title = "血缘关系分析";
      content = <ListDataSource />;
    } else if (menuId === "ListApplicationErrorDataReport") {
      title = "所有传输出错的数据";
      content = <ListApplicationErrorDataReport />;
    } else if (menuId === "ListProcessTask") {
      title = "所有任务列表";
      content = <ListProcessTask />;
    } else if (menuId === "ServerCountCharts") {
      title = "集群服务器任务领取占比统计";
      content = <ServerCountCharts />;
    } else if (menuId === "ListEngineMemroyIndocs") {
      title = "当前服务器内存数据流量监控";
      content = <ListEngineMemroyIndocs />;
    } else if (menuId === "rule") {
      title = "公共规则管理/" + nodeName;
      content = (
        <ListProcessRule
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else {
      title = "应用分类";
      content = <HomepageAllApps categoryId={menuId} />;
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

export default ApplicationIndex;
