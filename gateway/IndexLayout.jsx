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

//????????????
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

//services??????
import ListServices from "./grid/ListServices";

import UserProfile from "../portal/UserProfile";

//API??????????????????

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
      userInfo: AjaxUtils.getCookie("userName") + " ?????? " + this.getTime(),
      menuId: "home",
      appName: "Home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
    // window.document.title="API??????-"+window.document.title;
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
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????"
    );
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();
    let day = today.getDay();
    let now_time = month + 1 + "???" + date + "???" + " " + show_day[day] + " ";
    return now_time;
  };

  //?????????????????????????????????????????????
  handleClick = (key, menuNodeObj) => {
    this.searchKeyword = "";
    this.setState({ menuId: key, menuNodeObj: menuNodeObj });
  };

  //????????????????????????
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    } else if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl);
    } else if (key === "Import") {
      this.setState({ visible: true });
    } else if (key === "profile") {
      this.setState({ menuId: "UserProfile" }); //???????????????
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
      label: "API????????????",
      id: "searchApi",
      menuPath: "API????????????",
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
      this.state.menuNodeObj.menuPath = "????????????";
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
      this.state.menuNodeObj.menuPath = "API??????/API??????";
      content = <ListApplication_Gateway appId={this.appId} />;
    } else if (menuId === "GatewayAppList") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListRouterCategory />;
    } else if (menuId === "ApiCategoryList") {
      this.state.menuNodeObj.menuPath = "????????????/API????????????";
      content = (
        <ListAppServiceCategoryNode
          categoryId={this.appId + ".ServiceCategory"}
          appId={this.appId}
        />
      );
    } else if (menuId === "LoadBalanceStrategy") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListLoadBalance />;
    } else if (menuId === "GatewayGrayRelease") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListGrayRelease />;
    } else if (menuId === "GrayRuleRelease") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListGrayRule />;
    } else if (menuId === "ListAuthentication") {
      this.state.menuNodeObj.menuPath = "????????????/API??????????????????";
      content = <ListAuthentication />;
    } else if (menuId === "MockData") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListMockResponseConfigs appId={this.appId} />;
    } else if (menuId === "VariantConfig") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListAppPropertiesByAppId appId={this.appId} />;
    } else if (menuId === "APIControllerStrategy") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListAPIControlStrategy appId={this.appId} />;
    } else if (menuId === "TopologicalGraph") {
      this.state.menuNodeObj.menuPath = "????????????/???????????????";
      content = <TopologicalGraph />;
    } else if (menuId === "LocalServiceCache") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListLocalCacheServer />;
    } else if (menuId === "Hystrix") {
      this.state.menuNodeObj.menuPath = "????????????/Hystrix??????";
      content = <ListRouterForHystrix />;
    } else if (menuId === "ClusterServer") {
      this.state.menuNodeObj.menuPath = "????????????/?????????????????????";
      content = <ListClusterServer />;
    } else if (menuId === "ClusterServer") {
      this.state.menuNodeObj.menuPath = "????????????/?????????????????????";
      content = <ListClusterServer />;
    } else if (menuId === "RealTimeRequestInfo") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = <ListRealTimeRequestInfo />;
    } else if (menuId === "ControlStrategyBeans") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = (
        <ListBeansByInterface
          beanType="ControlStrategy"
          interface="cn.restcloud.framework.core.base.IBaseServiceControlStrategy"
        />
      );
    } else if (menuId === "LoadbalanceBeans") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = (
        <ListBeansByInterface interface="cn.restcloud.framework.blance.base.ILoadBlanceStrategy" />
      );
    } else if (menuId === "GrayPluginBeans") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = (
        <ListBeansByInterface interface="cn.restcloud.gateway.base.IGrayReleaseStrategy" />
      );
    } else if (menuId === "APIParamsCheckBeans") {
      this.state.menuNodeObj.menuPath = "????????????/API??????????????????";
      content = (
        <ListBeansByInterface
          beanType="Validate"
          interface="cn.restcloud.framework.core.base.IBaseValidateBean"
        />
      );
    } else if (menuId === "LocalServiceNamesBeans") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = (
        <ListBeansByInterface interface="cn.restcloud.framework.core.base.ILocalServiceNameCachePlugin" />
      );
    } else if (menuId === "IGatewayDataFilters") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = (
        <ListBeansByInterface
          beanType="IGatewayDataFilters"
          interface="cn.restcloud.gateway.base.IGatewayDataFilters"
        />
      );
    } else if (menuId === "IGatewayDataWaring") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = (
        <ListBeansByInterface interface="cn.restcloud.gateway.base.IGatewayDataWaring" />
      );
    } else if (menuId === "timeoutWaring") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListTimeoutWaringRule appId={this.appId} />;
    } else if (menuId === "responseCodeWaring") {
      this.state.menuNodeObj.menuPath = "????????????/???????????????";
      content = <ListResponseCodeRule appId={this.appId} />;
    } else if (menuId === "speedWaring") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListRequestSpeedRule appId={this.appId} />;
    } else if (menuId === "businessDataRule") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = <ListBusinessDataRule appId={this.appId} />;
    } else if (menuId === "ipConfig") {
      this.state.menuNodeObj.menuPath = "????????????/IP??????????????????";
      content = <ListIPSecurityRule appId={this.appId} />;
    } else if (menuId === "wordConfig") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListblackWordSecurityRule appId={this.appId} />;
    } else if (menuId === "encryConfig") {
      this.state.menuNodeObj.menuPath = "????????????/?????????????????????";
      content = <ListDataEncryptionRule appId={this.appId} />;
    } else if (menuId === "qpsConfig") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = <ListRequestLimiterRule appId={this.appId} />;
    } else if (menuId === "permissionConfig") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListPerimissionRule appId={this.appId} />;
    } else if (menuId === "ListHystrixConfigRule") {
      this.state.menuNodeObj.menuPath = "????????????/Hystrix????????????";
      content = <ListHystrixConfigRule appId={this.appId} />;
    } else if (menuId === "ListResubmitRule") {
      this.state.menuNodeObj.menuPath = "????????????/?????????????????????";
      content = <ListResubmitRule appId={this.appId} />;
    } else if (menuId === "reqDataFilters") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = <ListDataFiltersRule appId={this.appId} dataDirection="IN" />;
    } else if (menuId === "resDataFilters") {
      this.state.menuNodeObj.menuPath = "????????????/????????????????????????";
      content = <ListDataFiltersRule appId={this.appId} dataDirection="OUT" />;
    } else if (menuId === "dataCacheConfig") {
      this.state.menuNodeObj.menuPath = "????????????/??????????????????";
      content = <ListDataCacheRule appId={this.appId} />;
    } else if (menuId === "log") {
      this.state.menuNodeObj.menuPath = "API??????/???????????????";
      content = <ToDayLog appId={this.appId} />;
    } else if (this.state.menuId === "UserProfile") {
      this.state.menuNodeObj.menuPath = "API??????/????????????";
      content = <UserProfile />;
    } else if (this.state.menuId === "TopologicalGraphForHost") {
      this.state.menuNodeObj.menuPath = "API??????/?????????????????????????????????";
      content = <TopologicalGraphForHost />;
    } else if (this.state.menuId === "ListRealTimeLinks") {
      this.state.menuNodeObj.menuPath = "API??????/API??????????????????";
      content = <ListRealTimeLinks />;
    } else if (this.state.menuId === "ListServices") {
      this.state.menuNodeObj.menuPath = "API??????/??????????????????";
      content = <ListServices />;
    } else if (menuId === "ListNetworkMonitor") {
      this.state.menuNodeObj.menuPath = "API??????/?????????????????????";
      content = <ListNetworkMonitor />;
    } else {
      this.state.menuNodeObj.menuPath = "API????????????";
      content = <Homepage />;
    }

    // console.log(this.state.menuNodeObj);
    this.menuPath = this.state.menuNodeObj.menuPath.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<Modal
            key={Math.random()}
            title="????????????"
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
