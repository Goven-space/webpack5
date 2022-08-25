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
import ListStopProcess from "./monitor/grid/ListStopProcess";
import ListRuningProcess from "./monitor/grid/ListRuningProcess";
import ListProcess from "./process/grid/ListProcess";
import RightHomepage from "./RightHomepage";
import LeftMenu from "./LeftMenu";
import ListAppServiceCategoryNode from "./setting/ListAppServiceCategoryNode";
import ListTemplateNodeCategory from "./setting/ListTemplateNodeCategory";
import ListEntryModels from "./metadata/grid/ListEntryModels";
import ListProcessRule from "./datarule/grid/ListProcessRule";
import ListAppPropertiesByAppId from "./setting/ListAppPropertiesByAppId";
import ListApproverProcess from "./monitor/grid/ListApproverProcess";
import ListApproverProcessEnd from "./monitor/grid/ListApproverProcessEnd";
import ListDataFolder from "./datafile/grid/ListDataFolder";
import ListServicesByAppId from "./api/ListServicesByAppId";
import UserProfile from "../portal/UserProfile";
import ListCompensateProcess from "./monitor/grid/ListCompensateProcess";
import ListProcessErrorDataReport from "./dataquality/datalog/ListProcessErrorDataReport";
import ListDataCountRule from "./dataquality/datacount/grid/ListDataCountRule";
import ListDataChangeRule from "./dataquality/datachange/grid/ListDataChangeRule";
import ListDataContentRule from "./dataquality/datacontent/grid/ListDataContentRule";
import ListMetaChangeRule from "./dataquality/metachange/grid/ListMetaChangeRule";
import ListProcesStatusRule from "./dataquality/processStatus/grid/ListProcesStatusRule";
import ListProcessTask from "./task/grid/ListProcessTask";
import LayoutPage from "../core/components/layout";

//etl首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const ApplicationInfoUrl = URI.ETL.APPLICATION.info;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "etl";
    this.applicationId = this.props.location.query.appid;
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
    this.loadData();
  }

  loadData = () => {
    let url = ApplicationInfoUrl + "?applicationId=" + this.applicationId;
    AjaxUtils.get(url, (data) => {
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else if (data.designer == false) {
        AjaxUtils.showError("你没有对本应用的管理权限!");
      } else {
        this.setState({ mask: false });
        document.title = "数据应用:" + data.applicationName;
        this.setState({ applicationName: data.applicationName });
      }
    });
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 240 : 75,
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
  handleClick = (key, processId) => {
    this.setState({ menuId: key, processId: processId });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl + "/etl");
    } else if (key === "Import") {
      this.setState({ visible: true });
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
      content = (
        <RightHomepage
          appId={this.appId}
          detailClick={this.handleClick}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ErrorProcessIns") {
      title = "流程监控/所有失败运行记录";
      content = (
        <ListStopProcess
          runType="4"
          appId={this.appId}
          title="失败的流程"
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "WaringProcess") {
      title = "流程监控/所有警告流程";
      content = (
        <ListStopProcess
          runType="9"
          title="带有警告的流程"
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "StopProcess") {
      title = "流程监控/已结束流程";
      content = (
        <ListStopProcess
          runType="0"
          title="所有已结束流程"
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ApproverProcess") {
      title = "流程监控/待审批数据";
      content = (
        <ListApproverProcess
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ApproverProcessEnd") {
      title = "任务监控/已审批数据";
      content = (
        <ListApproverProcessEnd
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "RuningProcess") {
      title = "任务监控/未结束任务";
      content = (
        <ListRuningProcess
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ClusterServer") {
      title = "任务监控/集群服务器监控";
      content = (
        <ListClusterServer
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "RamAndThead") {
      title = "流程监控/内存及线程监控";
      content = (
        <ShowJvmInfo appId={this.appId} applicationId={this.applicationId} />
      );
    } else if (menuId === "process") {
      title = "数据流程/" + nodeName;
      content = (
        <ListProcess
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "metadata") {
      title = "元数据管理/" + nodeName;
      content = (
        <ListEntryModels
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "rule") {
      title = "规则管理/" + nodeName;
      content = (
        <ListProcessRule
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "api") {
      title = "API接口管理/API列表";
      content = (
        <ListServicesByAppId
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "fileMgr") {
      title = "文件管理";
      content = (
        <ListDataFolder
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "processCategory") {
      title = "流程分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + "." + menuId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "metadataCategory") {
      title = "元数据分类管理";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + "." + menuId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ruleCategory") {
      title = "规则分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + "." + menuId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "nodeTemplateCategory") {
      title = "自定义节点管理";
      content = (
        <ListTemplateNodeCategory
          appId={this.appId}
          categoryId={this.applicationId + "." + menuId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "variantConfig") {
      title = "变量配置管理";
      content = (
        <ListAppPropertiesByAppId
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "UserProfile") {
      title = "帐号信息";
      content = <UserProfile />;
    } else if (menuId === "DataSourceDependencies") {
      title = "数据源关系分析";
      content = <DataSourceDependencies applicationId={this.applicationId} />;
    } else if (menuId === "TableDependencies") {
      title = "血缘关系分析";
      content = <ListDataSource applicationId={this.applicationId} />;
    } else if (menuId === "ScheduleDistributionCharts") {
      title = "任务调度量分布图";
      content = (
        <ScheduleDistributionCharts applicationId={this.applicationId} />
      );
    } else if (menuId === "ListCompensateProcess") {
      title = "所有重跑任务";
      content = <ListCompensateProcess applicationId={this.applicationId} />;
    } else if (menuId === "DataTransQuality") {
      title = "所有传输出错的数据";
      content = (
        <ListProcessErrorDataReport applicationId={this.applicationId} />
      );
    } else if (menuId === "ListDataCountRule") {
      title = "数量对比分析规则";
      content = <ListDataCountRule applicationId={this.applicationId} />;
    } else if (menuId === "ListDataChangeRule") {
      title = "数量异动监控规则";
      content = <ListDataChangeRule applicationId={this.applicationId} />;
    } else if (menuId === "ListDataContentRule") {
      title = "数量质量分析规则";
      content = <ListDataContentRule applicationId={this.applicationId} />;
    } else if (menuId === "ListMetaChangeRule") {
      title = "元数据变更监测规则";
      content = <ListMetaChangeRule applicationId={this.applicationId} />;
    } else if (menuId === "ListProcesStatusRule") {
      title = "任务运行状态监测规则";
      content = <ListProcesStatusRule applicationId={this.applicationId} />;
    } else if (menuId === "ListProcessTask") {
      title = "所有任务队列";
      content = <ListProcessTask applicationId={this.applicationId} />;
    }
    this.menuPath = title.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} applicationId={this.applicationId}></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					isNeedBreadcrumb={menuId !== "home"?true:false}
					headerConfigBtn = {{
						otherBtn:([<span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this, "Portal")}>
						<Icon type="home" />应用</span>]),
						logout:true,
						profile:true,
					}}
        />
      </Spin>
    );
  }
}

export default IndexLayout;
