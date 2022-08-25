import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import * as ContextUtils from '../core/utils/ContextUtils';

//esb左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const leftmenuCountUrl=URI.CORE_TESTREPORT.menuCount;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
        isSuperAdmin:false,
        data:{approverCount:0,appyCount:0}
      }
  }

  componentDidMount(){
    this.loadData();
    ContextUtils.getContext((data)=>{
      if(data.permissionId.indexOf("core.appdesigner")!=-1 || data.permissionId.indexOf("core.superadmin")!=-1){
        this.setState({isSuperAdmin:true}); //是否是超级管理员
      }
    });
  }

  //清除定时器
  componentWillUnmount(){

  }

  //载入菜单
  loadData=()=>{
    AjaxUtils.get(leftmenuCountUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  handleClick=(item)=>{
    this.menuClick(item.key);
  }

  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['home']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            <Menu.Item key="home" >
              <Icon type="home" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >Home</span>
            </Menu.Item>
            <Menu.Item key='myfavapis' style={{fontSize:'14px'}} ><Icon type="star" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >我收藏的API</span></Menu.Item>
            <Menu.Item key='apilog' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API调用日志</span></Menu.Item>
            <Menu.Item key='errorlog' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API错误日志</span></Menu.Item>
            <Menu.Item key='ListAuthenticationType' style={{fontSize:'14px'}} ><Icon type="setting" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}}  >代理认证配置</span></Menu.Item>
            <Menu.Item key='UserProfile' style={{fontSize:'14px'}} ><Icon type="user" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}}  >个人信息修改</span></Menu.Item>
            {this.state.isSuperAdmin?
                <Menu.Item key='ListApplication' style={{fontSize:'14px'}} ><Icon type="api" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}}  >发布API</span></Menu.Item>
            :''}

        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
