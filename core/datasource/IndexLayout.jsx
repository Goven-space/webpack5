import React from "react";
import {Layout,Menu,Icon,
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
import * as URI from "../constants/RESTURI";
import * as AjaxUtils from "../utils/AjaxUtils";
import PageFooter from "../components/PageFooter";
import ListDataSource from "./grid/ListDataSource";
import LeftMenu from "./LeftMenu";
import RightHome from "./RightHome";
import ListAppServiceCategoryNode from "../../designer/ServiceCategory/grid/ListAppServiceCategoryNode";
import NewMongoDataSource from "./form/NewMongoDataSource";
import NewElasticsearch from "./form/NewElasticsearch";
import NewHBaseDataSource from "./form/NewHBaseDataSource";
import NewKafkaDataSource from "./form/NewKafkaDataSource";
import NewRedisDataSource from "./form/NewRedisDataSource";
import NewRdbsDataSource from "./form/NewRdbsDataSource";
import NewJdbcDriverDataSource from "./form/NewJdbcDriverDataSource";
import NewMqttDataSource from "./form/NewMqttDataSource";
import NewSapConn from "./form/NewSapConn";
import ListDataSourceMonitor from "../../mqbus/grid/ListMqSubscribe";
import UserProfile from "../../portal/UserProfile";
import NewJmsDataSource from "./form/NewJmsDataSource";
import NewRabbitMQDatasource from "./form/NewRabbitMQDataSource";
import NewRocketMq from "./form/NewRocketMq";
import NewRocketMqLocal from "./form/NewRocketMqLocal";
import LayoutPage from "../../core/components/layout";

//数据源管理布局
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId = "core";
    this.state = {
      key: "AllDataSourceList",
      mask: true,
      collapsed: false,
      menuId: "AllDataSourceList",
      reload: true,
      categoryId: "all",
      menuNodeObj: {},
      leftMenuWidth: 200,
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    AjaxUtils.getSystemInfo((data) => {
      if (data.modules === undefined || data.modules.indexOf("ds") !== -1) {
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
  handleClick = (key, categoryId) => {
    if (categoryId == undefined) {
      categoryId = key;
    }
    this.setState({ menuId: key, categoryId: categoryId });
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

  close = () => {
    this.setState({ menuId: "new" });
  };

  render() {
    let content;
    let menuId = this.state.menuId;
    let menuItemArray = menuId.split("#");
    menuId = menuItemArray[0];
    let nodeName = menuItemArray[1];
    let title = "";
    console.log(menuId);
    if (menuId === "new") {
      title = "新增数据源";
      content = (
        <RightHome
          memuClick={this.handleClick}
          categoryId={this.state.categoryId}
          appId={this.appId}
        />
      );
    } else if (menuId === "AllDataSourceList") {
      title = "数据源管理/所有数据源";
      content = (
        <ListDataSource
          appId={this.appId}
          categoryId="all"
          memuClick={this.handleClick}
        />
      );
    } else if (menuId === "dataSourceCategory") {
      title = "数据源管理/分类设置";
      content = (
        <ListAppServiceCategoryNode
          appId={this.appId}
          categoryId={this.appId + ".dataSourceCategory"}
          id=""
        />
      );
    } else if (menuId === "mongodb") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="MongoDB数据源配置">
          <NewMongoDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "elasticsearch") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="Elasticsearch数据源配置">
          <NewElasticsearch
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "kafka") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="Kafka数据源配置">
          <NewKafkaDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "redis") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="Redis数据源配置">
          <NewRedisDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "hbase") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="HBase数据源配置">
          <NewHBaseDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "jdbcpool") {
      title = "数据源管理/" + nodeName;
      content = (
          <NewRdbsDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
      );
    } else if (menuId === "jdbcdriver") {
      title = "数据源管理/" + nodeName;
      content = (
          <NewJdbcDriverDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
      );
    } else if (menuId === "mqtt") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="MQTT链接配置">
          <NewMqttDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "sap") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="SAP链接配置">
          <NewSapConn
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "jms") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="JMS链接配置">
          <NewJmsDataSource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "rabbitmq") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="RabbitMQ链接配置">
          <NewRabbitMQDatasource
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "rocketmq") {
      title = "数据源管理/" + nodeName;
      content = (
        <Card title="RocketMQ链接配置">
          <NewRocketMq
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      );
    } else if (menuId === "monitor") {
      title = "数据源管理/数据听监器";
      content = <ListDataSourceMonitor appId={this.appId} />;
    } else if (menuId === "UserProfile") {
      title = "数据源管理/帐号信息";
      content = <UserProfile />;
    } else if (menuId === "RocketMQ_Local"){
      title = "数据源管理/" + nodeName;
      content= (
        <Card title="Apache RocketMQ">
          <NewRocketMqLocal
            appId={this.appId}
            close={this.close}
            id=""
            categoryId={this.state.categoryId}
          />
        </Card>
      )
    } else {
      title = "数据源管理/" + nodeName;
      content = (
        <ListDataSource
          appId={this.appId}
          categoryId={menuId}
          memuClick={this.handleClick}
        />
      );
    }
    this.menuPath = title.split("/");

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

export default IndexLayout;
