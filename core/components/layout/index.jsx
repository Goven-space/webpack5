import React, { Component, Fragment } from "react";
import { Layout, Breadcrumb } from "antd";

import PageFooter from "../PageFooter";
import * as URI from "../../../core/constants/RESTURI";
import HeaderPage from "./HeaderPage";

const { Footer, Sider, Content } = Layout;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftMenuWidth: 200,
      collapsed: false,
    };
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      leftMenuWidth: this.state.collapsed ? 200 : 80,
    });
  };

  render() {
    const { leftMenuWidth, collapsed } = this.state;
    const {
      menuPath = [],
      content,
      menu,
      topMenuClick,
      headerConfigBtn,
      isNeedBreadcrumb = true,
			otherContent,
			headerContent
    } = this.props;
    return (
      <Layout>
        <HeaderPage
          leftMenuWidth={leftMenuWidth}
          collapsed={collapsed}
          topMenuClick={topMenuClick}
          headerConfigBtn={headerConfigBtn}
          toggle={this.toggle}
					headerContent={headerContent}
        ></HeaderPage>
        <Layout style={{ marginLeft: leftMenuWidth }}>
          <Sider
            trigger={null}
            width={leftMenuWidth}
            collapsible
            collapsed={collapsed}
            className="title-menu-min"
            style={{
              background: URI.ThemeLight.leftLayoutBackground,
              overflow: "auto",
              position: "fixed",
              top: "64px",
              left: 0,
              height: "93%",
            }}
          >
            {menu}
          </Sider>

          <Content>
            {/*content也可以由外部传入，遇到特殊的情况就外部传入，有的需要面包屑有的不需要，默认需要，不需要的isNeedBreadcrumb属性给个false */}
            {otherContent ? (
              otherContent
            ) : (
              <Fragment>
                <div className="breadcrumb-style">
                  {isNeedBreadcrumb ? (
                    <Breadcrumb style={{ margin: "0 0 0 10px" }}>
                      {menuPath.map((item) => {
                        return (
                          <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                        );
                      })}
                    </Breadcrumb>
                  ) : null}
                </div>
                <div className="main-content-style">{content}</div>
              </Fragment>
            )}
          </Content>
        </Layout>
        <Footer style={{ padding: 15, minHeight: 90, background: "#f0f2f5" }}>
          <PageFooter />
        </Footer>
      </Layout>
    );
  }
}
