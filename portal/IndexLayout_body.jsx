import React from "react";
import {Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin} from "antd";
import { browserHistory } from "react-router";
import * as URI from "../core/constants/RESTURI";
import * as AjaxUtils from "../core/utils/AjaxUtils";
import PageFooter from "../core/components/PageFooter";
import LeftMenu from "./LeftMenu";

//任务看板等
import IndexLayout_Right from "./IndexLayout_Right";
import LogCalendar from "../designer/AppManager/grid/DevLogCalendar";
import ListAllApps from "../designer/AppManager/grid/ListAllApps";
import ListDevLogs from "../designer/AppManager/grid/ListDevLogs";
import TaskBoard from "../designer/AppManager/grid/TaskBoard";
import ListTasks from "../designer/AppManager/grid/ListTasks";
import ListNotices from "./notice/grid/ListNotices";
import ListMessage from "./message/grid/ListMessage";

//系统设置
import Set_platforminfo from "../core/setting/platforminfo";
import Set_NewSN from "../core/setting/form/NewSN";
import Set_ListBusinessSystems from "../core/setting/grid/ListBusinessSystems";
import Set_ListEnvironments from "../core/setting/grid/ListEnvironments";
import Set_ListDataSource from "../core/datasource/grid/ListDataSource";
import Set_ServiceControls from "../core/setting/grid/ListServiceControlStrategy";
import Set_ListLoadBalance from "../core/setting/grid/ListLoadBalance";

//admin-定时任务管理
import Setting_Scheduler from "../core/setting/grid/ListSchedulerTasks";
import Setting_PlatformSetting from "../core/setting/grid/ListPlatformSetting";
import Setting_Langs from "../core/setting/grid/ListMultiLangs";
import Setting_PlatformTemplate from "../core/setting/grid/ListPlatformTemplateCode";

//系统链接器
import ListAllConnector from "../connect/connector/grid/ListAllConnector";
//版本发布
import ListPublishCategorys from "../core/publish/grid/ListPublishCategorys";
import ListApproverData from "../core/publish/grid/ListApproverData";

import UserProfile from "./UserProfile";
import BackupAndUpdate from "./BackupAndUpdate";


//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const CountUrl = URI.CORE_HOMEPAGE.GetPortalTopWarningCount;

//home page
class IndexLayout_API extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "portal";
    this.menuPath = ["Home"];
    this.searchKeyword = "";
    this.pageId = "home";
    this.state = {
      categoryId:this.props.categoryId||'api',
      key: "home",
      mask: false,
      visible: false,
      collapsed: false,
      menuId: this.pageId,
      message: {},
      leftMenuWidth: 200,
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.state.categoryId!==nextProps.categoryId || this.state.menuId!==nextProps.menuId){
      this.setState({categoryId:nextProps.categoryId,menuId:nextProps.categoryId});
    }
  }


  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 80,
    });
  };

  //左则菜单子组件中点击执行本函数
  handleClick = (key) => {
    this.setState({ menuId: key });
  };

  //设置菜单点击执行
  topMenuClick = (key) => {
    if (key === "Logout") {
      AjaxUtils.logout();
    }else if (key === "warning") {
      this.setState({ menuId: "WarningMessage" }); //切换服务器
    } else if (key === "import") {
      this.setState({ visible: true, menuId: key }); //切换服务器
    } else if (key === "profile") {
      this.setState({ menuId: "UserProfile" }); //切换服务器
    }
  };

  handleCancel = (e) => {
    this.setState({ visible: false });
  };

  render() {
    let content, modalForm;
    let modalTitle = "";
    let menuId = this.state.menuId||'';
    if (menuId === "LogCalendar") {
      modalTitle = "工作日记";
      content = <LogCalendar menuClick={this.handleClick} />;
    } else if (menuId === "MoreLogCalendar") {
      modalTitle = "工作日记/所有日记";
      content = <ListDevLogs />;
    } else if (menuId === "ListNotices") {
      modalTitle = "通知公告";
      content = <ListNotices />;
    } else if (menuId === "TaskBoard") {
      modalTitle = "任务看板";
      content = <TaskBoard menuClick={this.handleClick} />;
    } else if (menuId === "WarningMessage") {
      modalTitle = "预警消息";
      content = <ListMessage />;
    } else if (menuId === "Setting_PlatformSetting") {
      modalTitle = "平台设置/平台参数设置";
      content = <Setting_PlatformSetting />;
    } else if (menuId === "Set_ListEnvironments") {
      modalTitle = "平台设置/环境管理";
      content = <Set_ListEnvironments />;
    } else if (menuId === "Set_ListDataSource") {
      modalTitle = "平台设置/数据源管理";
      content = <Set_ListDataSource />;
    } else if (this.state.menuId === "Setting_Scheduler") {
      modalTitle = "平台设置/定时任务管理";
      content = <Setting_Scheduler />;
    } else if (menuId === "Set_ListBusinessSystems") {
      modalTitle = "平台设置/业务系统注册";
      content = <Set_ListBusinessSystems />;
    } else if (menuId === "Setting_Langs") {
      modalTitle = "平台设置/多语言标签";
      content = <Setting_Langs />;
    } else if (menuId === "Setting_PlatformTemplate") {
      modalTitle = "平台设置/平台模板代码";
      content = <Setting_PlatformTemplate />;
    } else if (menuId === "Set_ListLoadBalance") {
      modalTitle = "平台设置/负载均衡策略";
      content = <Set_ListLoadBalance />;
    } else if (menuId === "Set_ControllerStrategy") {
      modalTitle = "平台设置/服务控制策略";
      content = <Set_ServiceControls />;
    }else if (menuId === "Set_platforminfo") {
      modalTitle = "关于平台/版权信息";
      content = <Set_platforminfo />;
    } else if (menuId === "Set_NewSN") {
      modalTitle = "关于平台/系统序列号";
      content = <Set_NewSN />;
    } else if (menuId === "Task_1") {
      modalTitle = "任务看板/任务列表";
      content = <ListTasks status="1" />;
    } else if (menuId === "Task_2") {
      modalTitle = "任务看板/待确认任务";
      content = <ListTasks status="2" />;
    } else if (menuId === "Task_5") {
      modalTitle = "任务看板/已关闭任务";
      content = <ListTasks status="5" />;
    }else if (menuId=== "UserProfile") {
      modalTitle = "帐号信息";
      content = <UserProfile />;
    } else if (menuId.toLowerCase() === "connector") {
      modalTitle = "";
      content = <ListAllConnector />;
    } else if (menuId === "ListPublishCategorys") {
      modalTitle = "数据迁移到其他环境";
      content = <ListPublishCategorys />;
    } else if (menuId === "ListApproverData") {
      modalTitle = "审核迁移的数据并更新";
      content = <ListApproverData />;
    } else if (menuId === "BackupAndUpdate") {
      modalTitle = "备份平台数据及升级";
      content = <BackupAndUpdate />;
    } else {
      modalTitle = "";
      content = <IndexLayout_Right categoryId={this.state.categoryId} />;
    }
    this.menuPath = modalTitle.split("/");
    return (
      <Spin spinning={this.state.mask} tip="Loading...">
        <Layout>
          <Layout style={{ marginLeft: this.state.leftMenuWidth }}>
            <Sider
              trigger={null}
              width={this.state.leftMenuWidth}
              collapsible
              collapsed={this.state.collapsed}
              className="title-menu-min"
              style={{
								background: URI.ThemeLight.leftLayoutBackground,
                overflow: "auto",
                position: "fixed",
                top: "64px",
                left: 0,
                height:"93%"
              }}
            >
              <LeftMenu
                memuClick={this.handleClick}
                appId={this.appId}
                pageId={this.pageId}
              ></LeftMenu>
            </Sider>
            <Content>
              <div className="portal-breadcrumb-style">
                <Breadcrumb style={{ margin: "0 0 0 10px" }}>
                  {this.menuPath.map((item) => {
                    return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
                  })}
                </Breadcrumb>
              </div>
							<div className="main-content-style" style={{padding:'30px'}}>
								{content}
							</div>
            </Content>
          </Layout>
					<Footer style={{ padding: 15, minHeight: 90, background: "#f0f2f5" }}  >
              <PageFooter />
            </Footer>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout_API;
