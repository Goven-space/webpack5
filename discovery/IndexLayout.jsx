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
import ChangeServer from "../core/components/ChangeServer";
import PageFooter from "../core/components/PageFooter";
import LayoutPage from "../core/components/layout";

//注册中心菜单
import Home from "./homepage/ContentHome";
import Message from "./message/ListMessages";
import ListActiveServer from "./server/grid/ListActiveServer";
import ListStopServer from "./server/grid/ListStopServer";
import ListClusterServer from "./monitor/grid/ListClusterServer";
import ListMonitorPage from "./monitor/Homepage";
import LeftMenu from "./LeftMenu";

//配置中心菜单
import Config_Home from "./config/Homepage";
import Config_ListEnvironments from "./mysetting/ListEnvironments";
import Config_ListApplication from "./config/grid/ListApplication";
import Config_ListConfigs from "./config/grid/ListConfigs";
import Config_ListConfigsByAppId from "./config/grid/ListConfigsByAppId";
import Config_ListConfigLog from "./config/grid/ListConfigLog";
import Config_ListNoPublishConfigs from "./config/grid/ListNoPublishConfigs";
import Config_ListSnapshotData from "./config/grid/ListSnapshotData";
import Config_EditConfigsProps from "./config/grid/EditConfigsProps";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "etl";
    this.state = {
      key: "home",
      mask: true,
      collapsed: false,
      menuId: "DiscoveryHome",
      reload: true,
      menuNodeObj: {},
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
			leftMenuWidth: 200,
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (
        data.modules === undefined ||
        data.modules.indexOf("discovery") !== -1
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
  handleClick = (key, processId) => {
    this.setState({ menuId: key, processId: processId });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl);
    } else if (key === "Import") {
      this.setState({ visible: true });
    }
  };

  onMenuSelected = (menuId) => {
    this.setState({ menuId: menuId });
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
    if (menuId === "DiscoveryHome") {
      title = "系统首页";
      content = <Home appId={this.appId} />;
    } else if (menuId === "OnlineServer") {
      title = "服务注册中心/在线服务实例";
      content = <ListActiveServer appId={this.appId} />;
    } else if (menuId === "DropServer") {
      title = "服务注册中心/下线服务实例";
      content = <ListStopServer appId={this.appId} />;
    } else if (menuId === "ClusterServer") {
      title = "服务注册中心/集群服务器";
      content = <ListClusterServer appId={this.appId} />;
    } else if (menuId === "ServerMonitor") {
      title = "服务注册中心/服务实例监控";
      content = <ListMonitorPage appId={this.appId} />;
    } else if (menuId === "ServerMessage") {
      title = "服务注册中心/系统事件列表";
      content = <Message appId={this.appId} />;
    } else if (menuId === "Config_Home") {
      title = "配置中心/配置统计";
      content = (
        <Config_Home appId={this.appId} onMenuSelected={this.onMenuSelected} />
      );
    } else if (menuId === "Config_ListConfigs") {
      title = "配置中心/所有配置列表";
      content = <Config_ListConfigs appId={this.appId} />;
    } else if (menuId === "Config_ListNoPublishConfigs") {
      title = "配置中心/待发布配置";
      content = <Config_ListNoPublishConfigs appId={this.appId} />;
    } else if (menuId === "Config_PublicConfigs") {
      title = "配置中心/公共配置";
      content = <Config_ListConfigsByAppId appId="ALL" />;
    } else if (menuId === "Config_EditConfigsProps") {
      title = "配置中心/编辑配置";
      content = <Config_EditConfigsProps appId={this.appId} />;
    } else if (menuId === "Config_ListConfigLog") {
      title = "配置中心/变更日志";
      content = <Config_ListConfigLog appId={this.appId} />;
    } else if (menuId === "Config_ListSnapshotData") {
      title = "配置中心/配置快照";
      content = <Config_ListSnapshotData appId={this.appId} />;
    } else if (menuId === "Config_ListEnvironments") {
      title = "配置中心/环境管理";
      content = <Config_ListEnvironments appId={this.appId} />;
    } else if (menuId === "Config_ListApplication") {
      title = "配置中心/应用管理";
      content = <Config_ListApplication appId={this.appId} />;
    } else {
      title = "配置中心/配置管理";
      content = <Config_ListConfigsByAppId appId={menuId} />;
    }
    this.menuPath = title.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<LayoutPage
          menu={<LeftMenu memuClick={this.handleClick} appId={this.appId}></LeftMenu>}
					content={content}
					menuPath={this.menuPath}
					isNeedBreadcrumb={menuId !== "home"?true:false}
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
