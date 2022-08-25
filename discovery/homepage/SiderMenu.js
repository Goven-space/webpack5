import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const basePath=URI.rootPath;
const home=basePath+"/discovery";
const activeServer=basePath+"/discovery/servers/active";
const stopServer=basePath+"/discovery/servers/stop";
const clusterServer=basePath+"/discovery/servers/cluster";
const reportServer=basePath+"/discovery/servers/report";

class SiderMenu extends React.Component{

  constructor(props){
    super(props);
    this.state={
      current: URI.getCurrentPath(),
    };
  }

  handleClick=(e)=>{
    // window.location.hash =e.key; // 被点击元素的‘key’的值
    browserHistory.push(e.key);
    this.setState({current: e.key});
  }

  render() {
    return (
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['ServerManager','ServerReport']}
        selectedKeys={[this.state.current]}
        mode="inline"
      >
        <SubMenu key="ServerManager" title={<span><Icon type="appstore" />注册服务实例</span>}>
          <Menu.Item key={home}>home</Menu.Item>
          <Menu.Item key={activeServer}>活跃的服务实例</Menu.Item>
          <Menu.Item key={stopServer}>已失效服务实例</Menu.Item>
          <Menu.Item key={clusterServer}>集群服务器</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }

}

export default SiderMenu;
