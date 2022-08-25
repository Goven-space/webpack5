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
import LayoutPage from "../core/components/layout";
import Iframe from "../core/components/Iframe";
import Homepage from "./RightHomepage";
import ListRouter from "./grid/ListRouter";
import ListApplication_Gateway from "../apiportal/grid/ListApplication";
import ListRouterCategory from "./grid/ListRouterCategory";
import ListLoadBalance from "../core/setting/grid/ListLoadBalance";
import ListGrayRelease from "./grid/ListGrayRelease";
import ListMockResponseConfigs from "./grid/ListMockResponseConfigs";
import ListLocalCacheServer from "./grid/ListLocalCacheServer";
import ListBeansByInterface from "./grid/ListBeansByInterface";
import ListRouterForHystrix from "./monitor/ListRouterForHystrix";
import TopologicalGraph from "./monitor/TopologicalGraph";
import ListClusterServer from "../monitor/apimonitor/grid/ListClusterServer";
import ListAPIControlStrategy from "../core/setting/grid/ListServiceControlStrategy";
import SettingLayout from "./SettingLayout";
import ImportData from "../designer/components/ImportData";
import ListAppPropertiesByAppId from "../designer/designer/grid/ListAppPropertiesByAppId";
import LeftMenu from "./LeftMenu";
import ListAppServiceCategoryNode from "../apiportal/grid/ListApiCategoryNode";
import ListTimeoutWaringRule from "./waring/grid/ListTimeoutWaringRule";
import ListResponseCodeRule from "./waring/grid/ListResponseCodeRule";
import ListRequestSpeedRule from "./waring/grid/ListRequestSpeedRule";
import ListBusinessDataRule from "./waring/grid/ListBusinessDataRule";
import ListRealTimeRequestInfo from "./monitor/ListRealTimeRequestInfo";
import ToDayLog from "./monitor/ToDayLog";
import TopologicalGraphForHost from "./monitor/TopologicalGraphForHost";

//安全配置
import ListIPSecurityRule from "./security/grid/ListIPSecurityRule";
import ListblackWordSecurityRule from "./security/grid/ListblackWordSecurityRule";
import ListDataEncryptionRule from "./security/grid/ListDataEncryptionRule";
import ListRequestLimiterRule from "./security/grid/ListRequestLimiterRule";
import ListDataFiltersRule from "./security/grid/ListDataFiltersRule";
import ListPerimissionRule from "./security/grid/ListPerimissionRule";
import ListDataCacheRule from "./security/grid/ListDataCacheRule";
import ListHystrixConfigRule from "./security/grid/ListHystrixConfigRule";
import ListResubmitRule from "./security/grid/ListResubmitRule";
import ListGrayRule from "./security/grid/ListGrayRule";
import ListNetworkMonitor from "../monitor/servermonitor/grid/ListNetworkMonitor";
import ListRealTimeLinks from "./monitor/ListRealTimeLinks";
import ListAuthentication from "./security/grid/ListAuthentication";

//services配置
import ListServices from "./grid/ListServices";

import UserProfile from "../portal/UserProfile";

//API网关布局首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "gateway";
    this.menuPath = ["Home"];
    this.searchKeyword = "";
    this.state = {
      key: "home",
      mask: true,
      isSuperAdmin: false,
      visible: false,
      collapsed: false,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
      menuId: "home",
      appName: "Home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
    // window.document.title="API网关-"+window.document.title;
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (
        data.modules === undefined ||
        data.modules.indexOf("gateway") !== -1
      ) {
        this.setState({ mask: false });
      }
    });
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 85,
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
  handleClick = (key, menuNodeObj) => {
    this.searchKeyword = "";
    this.setState({ menuId: key, menuNodeObj: menuNodeObj });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl);
    } else if (key === "Import") {
      this.setState({ visible: true });
    } else if (key === "profile") {
      this.setState({ menuId: "UserProfile" }); //切换服务器
    }
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  searchApi = (e) => {
    let value = e.target.value;
    let menuNodeObj = {
      props: "Rest",
      nodeId: "searchApi",
      label: "API搜索结果",
      id: "searchApi",
      menuPath: "API搜索结果",
      searchKeyword: value,
    };
    this.setState({ menuId: "searchApi", menuNodeObj: menuNodeObj });
  };

  render() {
    let content;
    let menuId = this.state.menuId;
    if (this.state.menuNodeObj === false) {
      this.state.menuNodeObj = {};
    }
    if (menuId === "SettingLayout") {
      this.state.menuNodeObj.menuPath = "系统设置";
      content = <SettingLayout />;
    } else if (
      this.state.menuNodeObj.openType !== undefined &&
      this.state.menuNodeObj.openType === "4"
    ) {
      content = <Iframe url={this.state.menuNodeObj.url} />;
    } else if (this.state.menuNodeObj.props === "router") {
      let appId = this.state.menuNodeObj.nodeId;
      if (appId === "router.all") {
        appId = "all";
      }
      content = <ListRouter gatewayAppId={appId} appId={this.appId} />;
    } else if (menuId === "ListApplication_Gateway") {
      this.state.menuNodeObj.menuPath = "API网关/API注册";
      content = <ListApplication_Gateway appId={this.appId} />;
    } else if (menuId === "GatewayAppList") {
      this.state.menuNodeObj.menuPath = "网关配置/路由分类管理";
      content = <ListRouterCategory />;
    } else if (menuId === "ApiCategoryList") {
      this.state.menuNodeObj.menuPath = "网关配置/API分类管理";
      content = (
        <ListAppServiceCategoryNode
          categoryId={this.appId + ".ServiceCategory"}
          appId={this.appId}
        />
      );
    } else if (menuId === "LoadBalanceStrategy") {
      this.state.menuNodeObj.menuPath = "网关配置/负载均衡策略";
      content = <ListLoadBalance />;
    } else if (menuId === "GatewayGrayRelease") {
      this.state.menuNodeObj.menuPath = "网关配置/灰度发布策略";
      content = <ListGrayRelease />;
    } else if (menuId === "GrayRuleRelease") {
      this.state.menuNodeObj.menuPath = "网关配置/灰度发布规则";
      content = <ListGrayRule />;
    } else if (menuId === "ListAuthentication") {
      this.state.menuNodeObj.menuPath = "网关配置/API统一认证管理";
      content = <ListAuthentication />;
    } else if (menuId === "MockData") {
      this.state.menuNodeObj.menuPath = "数据管理/模拟数据管理";
      content = <ListMockResponseConfigs appId={this.appId} />;
    } else if (menuId === "VariantConfig") {
      this.state.menuNodeObj.menuPath = "网关配置/网关变量配置";
      content = <ListAppPropertiesByAppId appId={this.appId} />;
    } else if (menuId === "APIControllerStrategy") {
      this.state.menuNodeObj.menuPath = "网关配置/网关控制策略";
      content = <ListAPIControlStrategy appId={this.appId} />;
    } else if (menuId === "TopologicalGraph") {
      this.state.menuNodeObj.menuPath = "网关监控/网关拓朴图";
      content = <TopologicalGraph />;
    } else if (menuId === "LocalServiceCache") {
      this.state.menuNodeObj.menuPath = "网关监控/服务实例缓存";
      content = <ListLocalCacheServer />;
    } else if (menuId === "Hystrix") {
      this.state.menuNodeObj.menuPath = "网关监控/Hystrix监控";
      content = <ListRouterForHystrix />;
    } else if (menuId === "ClusterServer") {
      this.state.menuNodeObj.menuPath = "网关监控/网关集群服务器";
      content = <ListClusterServer />;
    } else if (menuId === "ClusterServer") {
      this.state.menuNodeObj.menuPath = "网关监控/网关集群服务器";
      content = <ListClusterServer />;
    } else if (menuId === "RealTimeRequestInfo") {
      this.state.menuNodeObj.menuPath = "插件管理/实时请求流量监控";
      content = <ListRealTimeRequestInfo />;
    } else if (menuId === "ControlStrategyBeans") {
      this.state.menuNodeObj.menuPath = "插件管理/控制策略插件管理";
      content = (
        <ListBeansByInterface
          beanType="ControlStrategy"
          interface="cn.restcloud.framework.core.base.IBaseServiceControlStrategy"
        />
      );
    } else if (menuId === "LoadbalanceBeans") {
      this.state.menuNodeObj.menuPath = "插件管理/负载均衡插件";
      content = (
        <ListBeansByInterface interface="cn.restcloud.framework.blance.base.ILoadBlanceStrategy" />
      );
    } else if (menuId === "GrayPluginBeans") {
      this.state.menuNodeObj.menuPath = "插件管理/灰度发布插件";
      content = (
        <ListBeansByInterface interface="cn.restcloud.gateway.base.IGrayReleaseStrategy" />
      );
    } else if (menuId === "APIParamsCheckBeans") {
      this.state.menuNodeObj.menuPath = "插件管理/API参数验证插件";
      content = (
        <ListBeansByInterface
          beanType="Validate"
          interface="cn.restcloud.framework.core.base.IBaseValidateBean"
        />
      );
    } else if (menuId === "LocalServiceNamesBeans") {
      this.state.menuNodeObj.menuPath = "插件管理/本地服务实例维护";
      content = (
        <ListBeansByInterface interface="cn.restcloud.framework.core.base.ILocalServiceNameCachePlugin" />
      );
    } else if (menuId === "IGatewayDataFilters") {
      this.state.menuNodeObj.menuPath = "插件管理/数据过滤插件";
      content = (
        <ListBeansByInterface
          beanType="IGatewayDataFilters"
          interface="cn.restcloud.gateway.base.IGatewayDataFilters"
        />
      );
    } else if (menuId === "IGatewayDataWaring") {
      this.state.menuNodeObj.menuPath = "插件管理/业务数据预警插件";
      content = (
        <ListBeansByInterface interface="cn.restcloud.gateway.base.IGatewayDataWaring" />
      );
    } else if (menuId === "timeoutWaring") {
      this.state.menuNodeObj.menuPath = "预警设置/响应超时预警";
      content = <ListTimeoutWaringRule appId={this.appId} />;
    } else if (menuId === "responseCodeWaring") {
      this.state.menuNodeObj.menuPath = "预警设置/错误码预警";
      content = <ListResponseCodeRule appId={this.appId} />;
    } else if (menuId === "speedWaring") {
      this.state.menuNodeObj.menuPath = "预警设置/请求速率预警";
      content = <ListRequestSpeedRule appId={this.appId} />;
    } else if (menuId === "businessDataRule") {
      this.state.menuNodeObj.menuPath = "预警设置/业务数据异常预警";
      content = <ListBusinessDataRule appId={this.appId} />;
    } else if (menuId === "ipConfig") {
      this.state.menuNodeObj.menuPath = "安全设置/IP黑白名单配置";
      content = <ListIPSecurityRule appId={this.appId} />;
    } else if (menuId === "wordConfig") {
      this.state.menuNodeObj.menuPath = "安全设置/敏感字符配置";
      content = <ListblackWordSecurityRule appId={this.appId} />;
    } else if (menuId === "encryConfig") {
      this.state.menuNodeObj.menuPath = "安全设置/数据加解密配置";
      content = <ListDataEncryptionRule appId={this.appId} />;
    } else if (menuId === "qpsConfig") {
      this.state.menuNodeObj.menuPath = "安全设置/请求速率规则配置";
      content = <ListRequestLimiterRule appId={this.appId} />;
    } else if (menuId === "permissionConfig") {
      this.state.menuNodeObj.menuPath = "安全设置/批量权限配置";
      content = <ListPerimissionRule appId={this.appId} />;
    } else if (menuId === "ListHystrixConfigRule") {
      this.state.menuNodeObj.menuPath = "安全设置/Hystrix熔断配置";
      content = <ListHystrixConfigRule appId={this.appId} />;
    } else if (menuId === "ListResubmitRule") {
      this.state.menuNodeObj.menuPath = "安全设置/防重复提交配置";
      content = <ListResubmitRule appId={this.appId} />;
    } else if (menuId === "reqDataFilters") {
      this.state.menuNodeObj.menuPath = "数据管理/请求数据转换规则";
      content = <ListDataFiltersRule appId={this.appId} dataDirection="IN" />;
    } else if (menuId === "resDataFilters") {
      this.state.menuNodeObj.menuPath = "数据管理/响应数据转换规则";
      content = <ListDataFiltersRule appId={this.appId} dataDirection="OUT" />;
    } else if (menuId === "dataCacheConfig") {
      this.state.menuNodeObj.menuPath = "数据管理/数据缓存规则";
      content = <ListDataCacheRule appId={this.appId} />;
    } else if (menuId === "log") {
      this.state.menuNodeObj.menuPath = "API网关/控制台日志";
      content = <ToDayLog appId={this.appId} />;
    } else if (this.state.menuId === "UserProfile") {
      this.state.menuNodeObj.menuPath = "API网关/帐号信息";
      content = <UserProfile />;
    } else if (this.state.menuId === "TopologicalGraphForHost") {
      this.state.menuNodeObj.menuPath = "API网关/后端服务器实时链接监控";
      content = <TopologicalGraphForHost />;
    } else if (this.state.menuId === "ListRealTimeLinks") {
      this.state.menuNodeObj.menuPath = "API网关/API实时链接排行";
      content = <ListRealTimeLinks />;
    } else if (this.state.menuId === "ListServices") {
      this.state.menuNodeObj.menuPath = "API网关/后端服务管理";
      content = <ListServices />;
    } else if (menuId === "ListNetworkMonitor") {
      this.state.menuNodeObj.menuPath = "API网关/网络连通性预警";
      content = <ListNetworkMonitor />;
    } else {
      this.state.menuNodeObj.menuPath = "API网关首页";
      content = <Homepage />;
    }

    // console.log(this.state.menuNodeObj);
    this.menuPath = this.state.menuNodeObj.menuPath.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<Modal
            key={Math.random()}
            title="导入设计"
            maskClosable={false}
            visible={this.state.visible}
            footer=""
            width="760px"
            onOk={this.handleCancel}
            onCancel={this.handleCancel}
          >
            <ImportData close={this.handleCancel} />
          </Modal>
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
