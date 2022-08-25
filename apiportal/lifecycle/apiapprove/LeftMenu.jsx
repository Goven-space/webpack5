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
          defaultSelectedKeys={['todolist']}
          defaultOpenKeys={['approvelist']}
          onClick={this.handleClick}
          theme='light'
        >
        <SubMenu  key='approvelist'  title={<span style={{fontSize:'14px'}} ><Icon type='solution' style={{fontSize:'14px'}} /><span>我的审核记录</span></span>}>
            <Menu.Item key='todolist' style={{fontSize:'14px'}} >待我审核的API</Menu.Item>
            <Menu.Item key='passedlist' style={{fontSize:'14px'}} >已通过API列表</Menu.Item>
            <Menu.Item key='rejectedlist' style={{fontSize:'14px'}} >已拒绝API列表</Menu.Item>
        </SubMenu>
        <SubMenu  key='appylist'  title={<span style={{fontSize:'14px'}} ><Icon type='user' style={{fontSize:'14px'}} /><span>我的申请记录</span></span>}>
            <Menu.Item key='my_approveing' style={{fontSize:'14px'}} >审核中的API</Menu.Item>
            <Menu.Item key='my_passedlist' style={{fontSize:'14px'}} >通过审核的API</Menu.Item>
            <Menu.Item key='my_rejectedlist' style={{fontSize:'14px'}} >被拒绝的API</Menu.Item>
            <Menu.Item key='my_overduelist' style={{fontSize:'14px'}} >已过期的API</Menu.Item>
        </SubMenu>
          <Menu.Item key="approverApis" >
            <Icon type="profile" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >API调用申请</span>
          </Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
