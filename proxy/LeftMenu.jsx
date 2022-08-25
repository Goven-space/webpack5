import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//proxy左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
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
          defaultSelectedKeys={['httpConfig']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            <Menu.Item key='httpConfig' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />HTTP代理配置</span></Menu.Item>
            <Menu.Item key='databaseConfig' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />数据库代理配置</span></Menu.Item>
            <Menu.Item key='tcpipConfig' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />TCPIP代理配置</span></Menu.Item>
            <Menu.Item key='ListAllApis' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />识别到的API</span></Menu.Item>
            <Menu.Item key='ListAllSQL' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />识别到的SQL</span></Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
