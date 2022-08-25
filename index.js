// index.jsx 文件
import Promise from "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Link, browserHistory, IndexRoute } from "react-router";
import moment from "moment";
import * as AjaxUtils from "./core/utils/AjaxUtils";
import * as URI from "./core/constants/RESTURI";
import "./core/css/monitor.less";

// 推荐在入口文件全局设置 locale
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const requireAuth = (nextState, replace) => {
  let identitytoken = AjaxUtils.getCookie(URI.cookieId);
  if (identitytoken === "") {
    replace({ pathname: URI.loginUrl });
  }
};
const setTitle = (title) => {
  document.title = title;
};

//系统登录
import Login from "./core/login/Login";
import NoRoute from "./core/components/NoRoute";

//Portal首页
import PortalHome from "./portal/IndexLayout";
//应用管理主界面
import ApplicationIndex from "./designer/ApplicationIndex";
//应用开发主界面
import DesignerIndex from "./designer/DesignerIndex";
//组织权限管理
import Org_IndexLayout from "./designer/org/IndexLayout";
//平台监控**********************************
import MonitoIndexLayout from "./monitor/MonitoIndexLayout";
//服务注册与发现路由开始
import Discovery_IndexLayout from "./discovery/IndexLayout";
//API-网关
import NewGatewayIndexLayout from "./gateway/IndexLayout";
//esb平台主界面
import ESBDesignerLayout from "./apiflow/ApiFlowLayout";
import ESBApplicationLayout from "./apiflow/application/ApplicationIndex";

//apiportal内网门户管理界面
import apiportal from "./apiportal/IndexLayout";
import apiportal_ApplicationLayout_view from "./apiportal/view/ApplicationLayout_all";
import apiportal_ApplicationLayout_manager from "./apiportal/apimanager/ApplicationLayout";

//api测试平台
import apitest from "./apitester/IndexLayout";
//etl平台
import ETLDesignerIndexLayout from "./etl/IndexLayout";
import ETLApplicationLayout from "./etl/application/ApplicationIndex";

//数据源管理
import DataSourceIndex from "./core/datasource/IndexLayout";

//链接器
import ConnectSAP_Index from "./connect/sap/IndexLayout";
import ConnectMongo_Index from "./connect/mongod/IndexLayout";

//API市场管理界面布局
import Market_Index from "./market/IndexLayout";

//proxy代理服务录制API
import Proxy_Index from "./proxy/IndexLayout";

//消息总线
import MqBusIndex from "./mqbus/IndexLayout";

//系统链接器
import ConnectorIndex from "./connect/connector/IndexLayout";

//实时数据
import CDC_Index from "./cdc/IndexLayout";

//API生命周期管理门户
import LIFECYCLE_Index from "./apiportal/lifecycle/IndexLayout";

//bpm平台主界面
import BPMDesignerLayout from './bpm/BPMIndexLayout';
import BPMApplicationLayout from './bpm/application/ApplicationIndex';


function App() {
  try {
    if (SystemTheme === "light") {
      URI.Theme = URI.ThemeLight;
			document.body.style.setProperty('--themeColor', URI.ThemeLight.leftLayoutBackground);
    } else if (SystemTheme === "blue") {
      URI.Theme = URI.ThemeBlue;
			document.body.style.setProperty('--themeColor', URI.ThemeBlue.leftLayoutBackground);
    } else if (SystemTheme === "other") {
      URI.Theme = URI.ThemeOther;
			document.body.style.setProperty('--themeColor', URI.ThemeOther.leftLayoutBackground);
    } else if (SystemTheme === "blacklight") {
      URI.Theme = URI.BlackLight;
			document.body.style.setProperty('--themeColor', URI.BlackLight.leftLayoutBackground);
    } else if (SystemTheme === "custom") {
      URI.Theme = {
        leftMenu: "other",
        logoClass: "monitorlogo-w",
        topHeaderButton: "topHeaderButton-blue",
        monitorTrigger: "monitorTrigger-w",
        topLine: "1px solid #ebedee",
        userInfoColor: "#fff",
        leftLayoutBackground: themeColor,
        topLayoutBackground: themeColor,
      };
			document.body.style.setProperty('--themeColor', URI.Theme.leftLayoutBackground);
    }
  } catch (e) {} //修改样式
  return (
    <Router history={browserHistory}>
      <Route path={URI.loginUrl} component={Login}>
        <IndexRoute component={Login} />
      </Route>
      <Route path={URI.rootPath} component={PortalHome} onEnter={requireAuth} />{/* 首页 */}
      <Route path={URI.rootPath + "/application"} component={ApplicationIndex} />{/*API低代码开发平台*/}
      <Route path={URI.rootPath + "/designer"} component={DesignerIndex} />{/*低代码的应用*/}
      <Route path={URI.rootPath + "/org"} component={Org_IndexLayout} />{/*组织权限中心*/}
      <Route path={URI.rootPath + "/esb/application"} component={ESBDesignerLayout}/>{/* 编排应用 */}
      <Route path={URI.rootPath + "/esb"} component={ESBApplicationLayout} />{/* API可视化编排平台 */}
      <Route path={URI.rootPath + "/discovery"} component={Discovery_IndexLayout} />{/* 服务发现中心*/}
      <Route path={URI.rootPath + "/gateway"} component={NewGatewayIndexLayout}></Route>{/*API网关*/}
      <Route path={URI.rootPath + "/monitor"} component={MonitoIndexLayout} />{/* API监控中心 */}
      <Route path={URI.rootPath + "/apiportal/v1"} component={apiportal} />{/*  */}
      <Route path={URI.rootPath + "/apiportal/view"} component={apiportal_ApplicationLayout_view} />{/*  */}
      <Route path={URI.rootPath + "/apimanager"} component={apiportal_ApplicationLayout_manager} />{/*  */}
      <Route path={URI.rootPath + "/apitest"} component={apitest} />{/* API测试平台 */}
      <Route path={URI.rootPath + "/etl"} component={ETLApplicationLayout} />{/* ETL数据集成平台 */}
      <Route path={URI.rootPath + "/etl/application"} component={ETLDesignerIndexLayout} />{/* etl应用 */}
      <Route path={URI.rootPath + "/datasource"} component={DataSourceIndex} />{/*数据源管理*/}
      <Route path={URI.rootPath + "/sap"} component={ConnectSAP_Index} />{/* SAP链接器 */}
      <Route path={URI.rootPath + "/mongo"} component={ConnectMongo_Index} />{/*MongoDB链接器 */}
      <Route path={URI.rootPath + "/market"} component={Market_Index} />{/*  */}
      <Route path={URI.rootPath + "/proxy"} component={Proxy_Index} />{/* API智能识别平台 */}
      <Route path={URI.rootPath + "/mqbus"} component={MqBusIndex} />{/* MQ消息集成平台 */}
      <Route path={URI.rootPath + "/connector"} component={ConnectorIndex} />{/*应用连接器*/}
      <Route path={URI.rootPath + "/cdc"} component={CDC_Index} />{/* DataStream实时数据传输平台 */}
      <Route path={URI.rootPath + "/apiportal"} component={LIFECYCLE_Index} />{/* API管理平台 */}
      <Route path={URI.rootPath+'/bpm/application'} component={BPMDesignerLayout} />
      <Route path={URI.rootPath+'/bpm'} component={BPMApplicationLayout} />
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("content"));
