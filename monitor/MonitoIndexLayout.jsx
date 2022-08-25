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
  Modal,
  Spin,
} from "antd";
import { browserHistory } from "react-router";
import * as URI from "../core/constants/RESTURI";
import * as AjaxUtils from "../core/utils/AjaxUtils";
import ChangeServer from "../core/components/ChangeServer";
import PageFooter from "../core/components/PageFooter";
import LeftMenu from "./LeftMenu";
import RightHomePage from "./RightHomePage";
import MonitorHomePage from "./charts/home";
import ListServices from "./apimonitor/grid/ListCoreServices";
import ListException from "./apimonitor/grid/ListServiceExceptions";
import ListStopServices from "./apimonitor/grid/ListStopServices";
import ListCluserServers from "./apimonitor/grid/ListClusterServer";
import ListLocalCacheServer from "./apimonitor/grid/ListLocalCacheServer";
import JvmMonitor from "./jvm/ShowJvmInfo";
import ASYNCQUEUE_Request from "./apimonitor/grid/ListAsyncRequestQueue";
import ASYNCQUEUE_CallBack from "./apimonitor/grid/ListCallBackQueue";
import ASYNCQUEUE_Wait from "./apimonitor/grid/ListWaitQueue";
import ASYNCQUEUE_Error from "./apimonitor/grid/ListAsyncErrorQueue";
import ListBeans from "./beanmonitor/grid/ListCoreBeans";
import ListErrorBeans from "./beanmonitor/grid/ListErrorBeans";
import ListBeanObjCache from "./beanmonitor/grid/ListBeanObjCache";
import ListBeanConfigCache from "./beanmonitor/grid/ListBeanConfigCache";
import ListServiceConfigCache from "./beanmonitor/grid/ListServiceConfigCache";
import ListAllCaches from "./beanmonitor/grid/ListAllCaches";
import ListSpringBean from "./beanmonitor/grid/ListSpringBean";
import ListLoadJarFiles from "./beanmonitor/grid/ListLoadJarFiles";
import ToDayLog from "./apimonitor/form/ToDayLog";
import TestOverRate from "./charts/TestOverRate";
import ServiceTypeCharts from "./charts/ServiceTypeCharts";
import ListReportApiAccessLog from "./log/ListReportApiAccessLog";
import ListAllApiLog from "./log/ListAllApiLog";
import ListInvalidApiParams from "./apimonitor/grid/ListInvalidApiParams";
import ListInvalidApis from "./apimonitor/grid/ListInvalidApis";
import ClientTypeGroup from "./charts/ClientTypeGroup";
import ApmLogByUserId from "./apm/ApmLogByUserId";
import ApmLogByApi from "./apm/ApmLogByApi";
import ApmLogByUserIdAndApi from "./apm/ApmLogByUserIdAndApi";
import ApmLogByServiceName from "./apm/ApmLogByServiceName";
import ApmServiceNameDependencies from "./apm/ApmServiceNameDependencies";
import ApmLogByTraceIdReport from "./apm/ApmLogByTraceIdReport";
import ListReportApiPerformanceChart from "./charts/ListReportApiPerformanceChart";
import AllServicePerformanceChart from "./charts/AllServicePerformanceChart";
import ListRecycleDocs from "./apimonitor/grid/ListRecycleDocs";
import AllAppCallStatisChart from "./charts/AllAppCallStatisChart";
import ListApiCallStatisTop from "./log/ListApiCallStatisTop";
import UserCallStatisTopChart from "./charts/UserCallStatisTopChart";
import SearchApiLogs from "./log/SearchApiLogs";
import JvmRamAndThreadTrend from "./charts/JvmRamAndThreadTrend";
import ListRealTimeRequestInfo from "./apimonitor/grid/ListRealTimeRequestInfo";
import ApiCallsByWeekChart from "./charts/ApiCallsByWeekChart";
import ServerCallStatisChart from "./charts/ServerCallStatisChart";
import ErrorCodeCharts from "./charts/ErrorCodeCharts";
import ListErrorResponseCode from "./log/ListErrorResponseCode";
import ListLogDbManager from "./log/ListLogDbManager";
import ListUserLoginLogs from "./log/ListUserLoginLogs";
import UserProfile from "../portal/UserProfile";
import BusinessApiLog from "./businesslog/BusinessApiLog";
import ControlPanelLog from "./businesslog/Controlpanel";
import ListRealTimeLinks from "../gateway/monitor/ListRealTimeLinks";
import LayoutPage from "../core/components/layout";

//API监控平台首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class MonitoIndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "daas";
    this.menuPath = ["监控首页"];
    this.state = {
      key: "home",
      mask: true,
      visible: false,
      collapsed: false,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
      menuId: "home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
    // window.document.title="API监控平台-"+window.document.title;
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      //console.log(data.modules.indexOf("monitor"));
      if (
        data.modules === undefined ||
        data.modules.indexOf("monitor") !== -1
      ) {
        //包含monitor时打开mask
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

  handleClick = (key) => {
    this.setState({ menuId: key });
  };

  render() {
    let content;
    let menuId = this.state.menuId;
    if (menuId === "home") {
      this.menuPath = ["监控首页"];
      content = <RightHomePage appId={this.appId} />;
    } else if (menuId === "ListServices") {
      this.menuPath = ["监控首页", "API运行数据"];
      content = <ListServices />;
    } else if (menuId === "ListException") {
      this.menuPath = ["监控首页", "API异常监控"];
      content = <ListException />;
    } else if (menuId === "ListStopServices") {
      content = <ListStopServices />;
    } else if (menuId === "ListClusterServer") {
      this.menuPath = ["监控首页", "集群服务器"];
      content = <ListCluserServers />;
    } else if (menuId === "ListLocalCacheServer") {
      this.menuPath = ["监控首页", "本地服务实例缓存"];
      content = <ListLocalCacheServer />;
    } else if (menuId === "JvmMonitor") {
      this.menuPath = ["监控首页", "内存及线程监控"];
      content = <JvmMonitor />;
    } else if (menuId === "ASYNCQUEUE_Request") {
      this.menuPath = ["监控首页", "待处理队列"];
      content = <ASYNCQUEUE_Request />;
    } else if (menuId === "ASYNCQUEUE_CallBack") {
      this.menuPath = ["监控首页", "待回调队列"];
      content = <ASYNCQUEUE_CallBack />;
    } else if (menuId === "ASYNCQUEUE_Wait") {
      this.menuPath = ["监控首页", "等待队列"];
      content = <ASYNCQUEUE_Wait />;
    } else if (menuId === "ASYNCQUEUE_Error") {
      this.menuPath = ["监控首页", "错误队列"];
      content = <ASYNCQUEUE_Error />;
    } else if (menuId === "ListBeans") {
      this.menuPath = ["监控首页", "所有JavaBean"];
      content = <ListBeans />;
    } else if (menuId === "ListErrorBeans") {
      this.menuPath = ["监控首页", "错误的Bean"];
      content = <ListErrorBeans />;
    } else if (menuId === "ListBeanObjCache") {
      this.menuPath = ["监控首页", "Bean对象缓存"];
      content = <ListBeanObjCache />;
    } else if (menuId === "ListBeanConfigCache") {
      this.menuPath = ["监控首页", "Bean配置缓存"];
      content = <ListBeanConfigCache />;
    } else if (menuId === "ListServiceConfigCache") {
      this.menuPath = ["监控首页", "API配置缓存"];
      content = <ListServiceConfigCache />;
    } else if (menuId === "ListSpringBean") {
      this.menuPath = ["监控首页", "SpringBean对象"];
      content = <ListSpringBean />;
    } else if (menuId === "ListAllCaches") {
      this.menuPath = ["监控首页", "所有缓存"];
      content = <ListAllCaches />;
    } else if (menuId === "ToDayLog") {
      this.menuPath = ["监控首页", "控制台日志"];
      content = <ToDayLog />;
    } else if (menuId === "ListReportApiAccessLog") {
      this.menuPath = ["监控首页", "API调用次数及性能统计"];
      content = <ListReportApiAccessLog appId="*" />;
    } else if (menuId === "ListAllUserActionLog") {
      this.menuPath = ["监控首页", "系统操作日志"];
      content = <ListAllApiLog appId="*" logType="2" />;
    } else if (menuId === "ListAllApiLog") {
      this.menuPath = ["监控首页", "API调用日志"];
      content = <ListAllApiLog appId="*" logType="0" />;
    } else if (menuId === "ListReportApiPerformance") {
      this.menuPath = ["监控首页", "API平均性能分布图"];
      content = <ListReportApiPerformance appId="*" />;
    } else if (menuId === "ListInvalidApis") {
      this.menuPath = ["监控首页", "无效的API列表"];
      content = <ListInvalidApis />;
    } else if (menuId === "clientGroupCharts") {
      content = <ClientTypeGroup />;
    } else if (menuId === "apmbyuser") {
      this.menuPath = ["监控首页", "用户调用链路"];
      content = <ApmLogByUserId />;
    } else if (menuId === "apmbyservice") {
      this.menuPath = ["监控首页", "按服务实例跟踪"];
      content = <ApmLogByServiceName />;
    } else if (menuId === "ServiceNameDependencies") {
      this.menuPath = ["监控首页", "服务依赖关系"];
      content = <ApmServiceNameDependencies />;
    } else if (menuId === "apmbytraceId") {
      this.menuPath = ["监控首页", "按TraceId跟踪"];
      content = <ApmLogByTraceIdReport />;
    } else if (menuId === "ApiPerformanceChart") {
      this.menuPath = ["监控首页", "API平均性能分布图"];
      content = <ListReportApiPerformanceChart />;
    } else if (menuId === "ServicePerformanceChart") {
      content = <AllServicePerformanceChart />;
    } else if (menuId === "TrashDoc") {
      this.menuPath = ["监控首页", "回收站"];
      content = <ListRecycleDocs />;
    } else if (menuId === "ListLoadJarFiles") {
      this.menuPath = ["监控首页", "JAR包加载列表"];
      content = <ListLoadJarFiles />;
    } else if (menuId === "AppCallStatis") {
      this.menuPath = ["监控首页", "应用调用TOP统计"];
      content = <AllAppCallStatisChart />;
    } else if (menuId === "ApiCallStatisTop") {
      this.menuPath = ["监控首页", "API调用TOP统计"];
      content = <ListApiCallStatisTop />;
    } else if (menuId === "UserCallTopStatis") {
      content = <UserCallStatisTopChart />;
      this.menuPath = ["监控首页", "用户调用TOP统计"];
    } else if (menuId === "SearchApiLog") {
      this.menuPath = ["监控首页", "搜索API日志"];
      content = <SearchApiLogs />;
    } else if (menuId === "ApmUserAndAPI") {
      this.menuPath = ["监控首页", "按用户显示链路"];
      content = <ApmLogByUserIdAndApi />;
    } else if (menuId === "ApmBySystemName") {
      this.menuPath = ["监控首页", "查看API依赖关系"];
      content = <ApmLogByApi />;
    } else if (menuId === "JvmTrend") {
      this.menuPath = ["监控首页", "JVM监控"];
      content = <JvmRamAndThreadTrend />;
    } else if (menuId === "ListRealTimeRequestInfo") {
      this.menuPath = ["监控首页", "API实时请求监控"];
      content = <ListRealTimeRequestInfo />;
    } else if (menuId === "ListRealTimeLinks") {
      this.menuPath = ["监控首页", "API实时链接数Top200排行"];
      content = <ListRealTimeLinks />;
    } else if (menuId === "ApiCallsByWeekChart") {
      this.menuPath = ["监控首页", "API每日调用次数"];
      content = <ApiCallsByWeekChart />;
    } else if (menuId === "ServerCallStatisChart") {
      this.menuPath = ["监控首页", "各集群服务器调用次数"];
      content = <ServerCallStatisChart />;
    } else if (menuId === "ErrorCodeCharts") {
      this.menuPath = ["监控首页", "错误码分布统计"];
      content = <ErrorCodeCharts />;
    } else if (menuId === "ListErrorResponseCode") {
      this.menuPath = ["监控首页", "非200状态码请求"];
      content = <ListErrorResponseCode />;
    } else if (menuId === "ListLogDbManager") {
      this.menuPath = ["监控首页", "日志库管理"];
      content = <ListLogDbManager />;
    } else if (menuId === "UserLoginLog") {
      this.menuPath = ["监控中心", "用户登录日志"];
      content = <ListUserLoginLogs />;
    } else if (menuId === "UserProfile") {
      this.menuPath = ["监控中心", "帐号信息"];
      content = <UserProfile />;
    } else if (menuId === "BusinessApiLog") {
      this.menuPath = ["监控首页", "业务操作日志"];
      content = <BusinessApiLog appId="*" logType="0" />;
    } else if (menuId === "ControlPanelLog") {
      this.menuPath = ["监控首页", "控制面板"];
      content = <ControlPanelLog appId="*" />;
    }

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

export default MonitoIndexLayout;
