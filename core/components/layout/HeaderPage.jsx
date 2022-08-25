import React, { Component,Fragment } from "react";
import { Layout, Icon, Badge, Avatar, Popover } from "antd";

import * as AjaxUtils from "../../../core/utils/AjaxUtils";
import * as URI from "../../../core/constants/RESTURI";

const { Header } = Layout;
const CountUrl = URI.CORE_HOMEPAGE.GetPortalTopWarningCount;

export default class HeaderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: {},
      userInfo: AjaxUtils.getCookie("userName") + " 您好 " + this.getTime(),
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    //获取信息消息
    AjaxUtils.get(CountUrl, (data) => {
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (data.warningMessage !== "") {
          AjaxUtils.showInfo(data.warningMessage);
        }
        this.setState({ message: data, mask: false });
      }
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

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 80,
    });
  };

  /* 按钮：1.首页 ->home   2.警告 -> message  3.切换->changeServer   4.导入->import  5.logout->退出   6.当前服务器 -> profile  */

  render() {
    const { message, userInfo } = this.state;
    const {
      leftMenuWidth,
      collapsed,
      toggle,
      topMenuClick,
      headerConfigBtn = {},
      headerContent,
    } = this.props;
    return (
      <Header
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          overflow: "hidden",
          background: URI.Theme.topLayoutBackground,
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          {/* logo */}
          <div style={{ width: leftMenuWidth, height: "64px" }}>
            <div className={URI.Theme.logoClass} />
          </div>
          {/* 收缩按钮 */}
          <Icon
            className={URI.Theme.monitorTrigger}
            type={collapsed ? "menu-unfold" : "menu-fold"}
            onClick={toggle}
          />
          <span
            dangerouslySetInnerHTML={{
              __html: AjaxUtils.getEnvironmentInfo(),
            }}
            style={{ height: "60px", color: URI.Theme.userInfoColor }}
          ></span>
        </div>
        {/* 如果外部头右侧存在较大差异，直接自己传入，不用默认头 */}
        {headerContent ? (
          headerContent
        ) : (
          <Fragment>
            <div style={{ float: "right" }}>
              {headerConfigBtn.otherBtn ? headerConfigBtn.otherBtn : null}
              {/* 有特殊的按钮，通过otherBtn传入，是数组 */}

              {headerConfigBtn.home ? (
                <span
                  className={URI.Theme.topHeaderButton}
                  onClick={() => {
                    topMenuClick("Portal");
                  }}
                >
                  <Icon type="home" />
                  首页
                </span>
              ) : null}

              {headerConfigBtn.message ? (
                <span
                  className={URI.Theme.topHeaderButton}
                  onClick={() => {
                    topMenuClick("warning");
                  }}
                >
                  <Badge
                    count={message.warningCount}
                    overflowCount={99}
                    style={{ backgroundColor: "#f50", marginTop: "-6px" }}
                  >
                    <Icon type="bell" style={{ fontSize: "16px" }} />
                  </Badge>
                </span>
              ) : null}

              {headerConfigBtn.changeServer ? (
                <span
                  className={URI.Theme.topHeaderButton}
                  onClick={() => {
                    topMenuClick("changeServer");
                  }}
                >
                  <Icon type="sync" />
                  切换
                </span>
              ) : null}

              {headerConfigBtn.import ? (
                <span
                  className={URI.Theme.topHeaderButton}
                  onClick={() => {
                    topMenuClick("import");
                  }}
                >
                  <Icon type="upload" />
                  导入
                </span>
              ) : null}

              {headerConfigBtn.logout ? (
                <span
                  className={URI.Theme.topHeaderButton}
                  onClick={() => {
                    topMenuClick("Logout");
                  }}
                >
                  <Icon type="logout" />
                  退出
                </span>
              ) : null}
            </div>
            <div
							className='header-userInfo'
              style={{
                padding: 0,
                margin: "0 20px 0 0",
                float: "right",
                fontSize: "12px",
                color: URI.Theme.userInfoColor,
              }}
            >
              <Avatar
                src={URI.userAvatarUrl}
                size={32}
                style={{ backgroundColor: "#7265e6" }}
              />{" "}
              {headerConfigBtn.profile ? (
                <Popover content={URI.currentServerHost} title="当前服务器">
                  <span
                    onClick={() => {
                      topMenuClick("profile");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {userInfo}
                  </span>
                </Popover>
              ) : null}
            </div>
          </Fragment>
        )}
      </Header>
    );
  }
}
