import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//etl左则菜单
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
        menuNodeObj:{},
        menuData:[],
      }
  }

  componentDidMount(){
  }

  //清除定时器
  componentWillUnmount(){
  }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?appId="+this.appId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data});
        }
    });
  }

  handleClick=(item)=>{
    this.menuClick(item.key);
  }

  render(){

    return (
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['Org_CompanyList']}
          defaultOpenKeys={['orglayout']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
          <SubMenu  key="orglayout" title={<span style={{fontSize:'14px'}} ><Icon type="appstore" style={{fontSize:'14px'}} /><span>组织权限管理</span></span>}>
            <Menu.Item style={{fontSize:'14px'}} key='Org_CompanyList'><Icon type="tags" style={{fontSize:'14px'}} />机构管理</Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='Org_DeptList'><Icon type="solution" style={{fontSize:'14px'}} />部门管理</Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='Org_PersonList'><Icon type="user" style={{fontSize:'14px'}} />帐号管理</Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='ListRoles'><Icon type="team" style={{fontSize:'14px'}} />角色管理</Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='ListAllPermissions'><Icon type="security-scan" style={{fontSize:'14px'}} />权限管理</Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='ListMenuCategory'><Icon type="profile" style={{fontSize:'14px'}} />菜单管理</Menu.Item>
          </SubMenu>
        </Menu>
    );
  }
}

export default LeftMenu;
