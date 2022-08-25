import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';

//API注册管理左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'application',
        menuData:[],
        allCount:0,
        reqCount:0,
        isAdminFlag:false,
      }
  }

  componentDidMount(){
  }

  handleClick=(item)=>{
    let key=item.key;
    let text=item.item.node.innerText;
    this.menuClick(key,text);
  }

  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['application']}
          onClick={this.handleClick}
          theme='light'
        >
          <Menu.Item key="application" >
            <Icon type="unordered-list" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >接入系统管理</span>
          </Menu.Item>
          <Menu.Item key="ListBuinessDomain" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >业务域划分</span>
          </Menu.Item>
          <Menu.Item key="apitags" >
            <Icon type="profile" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >标签管理</span>
          </Menu.Item>
          <Menu.Item key="errorCode" >
            <Icon type="profile" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >错误码规范</span>
          </Menu.Item>
          <Menu.Item key="publicHeader" >
            <Icon type="profile" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >请求头规范</span>
          </Menu.Item>
          <Menu.Item key="masterData" >
            <Icon type="database" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >标准模型管理</span>
          </Menu.Item>
          <Menu.Item key="mockData" >
            <Icon type="database" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >模拟数据管理</span>
          </Menu.Item>
          <Menu.Item key="serverHost" >
            <Icon type="profile" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >后端服务管理<Badge count={this.state.appCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span>
          </Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
