import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//etl左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=host+"/rest/etl/menu/leftnav";

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
        menuNodeObj:{},
        menuData:{},
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo();
  }

  handleClick=(item)=>{
    this.menuClick(item.key);
  }

  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['DiscoveryHome']}
          defaultOpenKeys={['discovery']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            <SubMenu  key='discovery'  title={<span style={{fontSize:'14px'}} ><Icon type='project' style={{fontSize:'14px'}} /><span>服务注册中心</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='DiscoveryHome'>注册中心首页</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='OnlineServer'>在线服务实例</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='DropServer'>下线服务实例</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ClusterServer'>集群服务器</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ServerMessage'>所有事件列表</Menu.Item>
            </SubMenu>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
