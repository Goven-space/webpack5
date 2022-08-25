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
import ListServicesByAppId from "./api/ListServicesByAppId";
import ListProcessRule from "./datarule/grid/ListProcessRule";
import ListCompensateProcess from "./monitor/grid/ListCompensateProcess";
import ListCompensateFailed from "./monitor/grid/ListCompensateFailed";
import ListAppPropertiesByAppId from "./setting/ListAppPropertiesByAppId";
import ListApproverProcess from "./monitor/grid/ListApproverProcess";
import ListCompensateNodeIns from "./monitor/grid/ListCompensateNodeIns";
import ListCompensateNodeInsFailed from "./monitor/grid/ListCompensateNodeInsFailed";
import UserProfile from "../portal/UserProfile";
import ListAsyncQueueProcess from "./monitor/grid/ListAsyncQueueProcess";
import ListJoinApis from "./api/ListJoinApis";
import ListDataMappingCategory from "./mapping/grid/ListDataMappingCategory";
import ListProcessHistory from "./monitor/grid/ListProcessHistory";
import ListProcessInstanceLog from "./monitor/grid/ListProcessInstanceLog";
import ListProcessTask from "./task/grid/ListProcessTask";
import LayoutPage from "../core/components/layout";

//esb应用-流程设计首页布局

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const ApplicationListUrl = URI.rootPath + "/esb";
const ApplicationInfoUrl = URI.ESB.APPLICATION.info;

//home page
class ApiFlowLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "esb";
    this.applicationId = this.props.location.query.appid;
    this.state = {
      key: "home",
      mask: true,
      collapsed: false,
      menuId: "home",
      reload: true,
      menuNodeObj: {},
      leftMenuWidth: 200,
      userInfo: AjaxUtils.getUserId() + " 您好 " + this.getTime(),
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
        document.title = "编排应用:" + data.applicationName;
        this.setState({ applicationName: data.applicationName });
      }
    });
  };

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
  handleClick = (key, processId) => {
    this.setState({ menuId: key, processId: processId });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(ApplicationListUrl);
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
    } else if (menuId === "allProcessIns") {
      title = "流程监控/所有运行记录";
      content = (
        <ListProcessInstanceLog
          runType="2"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "successProcessIns") {
      title = "流程监控/所有成功运行记录";
      content = (
        <ListProcessInstanceLog
          runType="3"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "errorProcessIns") {
      title = "流程监控/所有失败运行记录";
      content = (
        <ListProcessInstanceLog
          runType="4"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "compensateProcessIns") {
      title = "流程监控/待补偿流程";
      content = (
        <ListProcessInstanceLog
          runType="5"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "runingProcessIns") {
      title = "流程监控/运行中流程";
      content = (
        <ListProcessInstanceLog
          runType="1"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "CompensateProcess") {
      title = "流程监控/所有待补偿流程";
      content = (
        <ListCompensateProcess
          runType="5"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "CompensateFailed") {
      title = "流程监控/补偿失败流程";
      content = (
        <ListCompensateFailed
          runType="6"
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ListCompensateNodeIns") {
      title = "流程监控/待补偿节点";
      content = (
        <ListCompensateNodeIns
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ListCompensateNodeInsFailed") {
      title = "流程监控/补偿失败节点";
      content = (
        <ListCompensateNodeInsFailed
          appId={this.appId}
          processId={this.state.processId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ApproverProcess") {
      title = "流程监控/待审批确认的流程";
      content = (
        <ListApproverProcess
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "StopProcess") {
      title = "流程监控/已结束流程";
      content = (
        <ListStopProcess
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "RuningProcess") {
      title = "流程监控/所有未结束流程";
      content = (
        <ListRuningProcess
          appId={this.appId}
          runType="1"
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "AsyncQueue") {
      title = "流程监控/异步调度队列";
      content = (
        <ListAsyncQueueProcess
          appId={this.appId}
          runType="24"
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "process") {
      title = "编排流程/" + nodeName;
      content = (
        <ListProcess
          appId={this.appId}
          categoryId={categoryId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "apiMgr") {
      title = "编排流程发布的API";
      content = (
        <ListServicesByAppId
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
    } else if (menuId === "processCategory") {
      title = "流程分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + ".processCategory"}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "apiCategory") {
      title = "API分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + ".ServiceCategory"}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "ruleCategory") {
      title = "规则分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.applicationId + ".ruleCategory"}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "mappingCategory") {
      title = "数据映射模板设置";
      content = (
        <ListDataMappingCategory
          appId={this.appId}
          applicationId={this.applicationId}
        />
      );
    } else if (menuId === "variantConfig") {
      title = "变量配置管理";
      content = (
        <ListAppPropertiesByAppId
          applicationId={this.applicationId}
          appId={this.appId}
        />
      );
    } else if (menuId === "joinApis") {
      title = "被编排的API列表";
      content = <ListJoinApis applicationId={this.applicationId} />;
    } else if (menuId === "UserProfile") {
      title = "帐号信息";
      content = <UserProfile />;
    } else if (menuId === "ListProcessHistory") {
      title = "已归档流程";
      content = <ListProcessHistory applicationId={this.applicationId} />;
    } else if (menuId === "ListProcessTask") {
      title = "待执行任务列表";
      content = (
        <ListProcessTask
          appId={this.appId}
          categoryId={this.applicationId + ".ruleCategory"}
          applicationId={this.applicationId}
        />
      );
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

export default ApiFlowLayout;
