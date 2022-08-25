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
import Iframe from "../core/components/Iframe";
import DesignerHome from "./DesignerRigthHome";
import ImportData from "./components/ImportData";
import IndexLeftNavMenu from "./DesignerLeftMenu";
import LayoutPage from "../core/components/layout";

//应用开发布局首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const checkAclUrl = URI.LIST_APP.checkAppAcl;

//home page
class DesignerIndex extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.location.query.appid;
    this.menuPath = ["Home"];
    this.searchKeyword = "";
    this.state = {
      key: "home",
      mask: true,
      visible: false,
      collapsed: false,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
      menuId: "home",
      appName: "Home",
      menuNodeObj: {},
      leftMenuWidth: 200,
      menuData: [],
    };
  }

  componentDidMount() {
    try {
      if (SystemTheme === "light") {
        URI.Theme = URI.ThemeLight;
      }
    } catch (e) {}

    AjaxUtils.getSystemInfo((data) => {
      if (
        data.modules === undefined ||
        data.modules.indexOf("designer") !== -1
      ) {
        this.loadData();
      }
    });
  }

  loadData = () => {
    let url = checkAclUrl + "?appId=" + this.appId;
    AjaxUtils.get(url, (data) => {
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        this.setState({ mask: false });
        document.title = data.appName + "-开发";
        this.setState({ appName: data.appName });
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
  handleClick = (key, menuNodeObj) => {
    this.searchKeyword = "";
    this.setState({ menuId: key, menuNodeObj: menuNodeObj });
  };

  //顶部菜单点击事件
  topMenuClick = (key) => {
    if (key === "Portal") {
      browserHistory.push(URI.adminIndexUrl + "/application");
    } else if (key === "Import") {
      this.setState({ visible: true });
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
    // console.log(menuId);
    if (menuId === "home") {
      this.state.menuNodeObj = { props: "Home", nodeId: "", id: "Home" };
      this.state.menuNodeObj.menuPath = this.state.appName;
      content = (
        <DesignerHome appId={this.appId} menuNodeObj={this.state.menuNodeObj} />
      );
    } else if (this.state.menuNodeObj.openType === "4") {
      content = <Iframe url={this.state.menuNodeObj.url} />;
    } else {
      content = (
        <DesignerHome appId={this.appId} menuNodeObj={this.state.menuNodeObj} />
      );
    }
    // console.log(this.state.menuNodeObj);
    this.menuPath = this.state.menuNodeObj.menuPath.split("/");

    let modalTitle = "导入设计";
    let modalForm = <ImportData close={this.handleCancel} />;
    if (this.state.menuId === "changeServer") {
      modalForm = <ChangeServer close={this.handleCancel} />;
      modalTitle = "切换服务器";
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading...">
				<LayoutPage
          menu={<IndexLeftNavMenu memuClick={this.handleClick} appId={this.appId}></IndexLeftNavMenu>}
					content={content}
					menuPath={this.menuPath}
					topMenuClick={this.topMenuClick}
					headerConfigBtn = {{
						home:true,
						import:true,
						profile:true,
					}}
        />
      </Spin>
    );
  }
}

export default DesignerIndex;
