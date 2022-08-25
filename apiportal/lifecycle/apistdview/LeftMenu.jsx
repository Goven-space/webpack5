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
            <span style={{fontSize:'14px'}} >已接入系统</span>
          </Menu.Item>
          <Menu.Item key="APIGuide" >
            <Icon type="file-markdown" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >API调用指引</span>
          </Menu.Item>
          <Menu.Item key="SystemGuide" >
            <Icon type="file-markdown" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >系统接入指引</span>
          </Menu.Item>
          <Menu.Item key="errorCode" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >错误码规范</span>
          </Menu.Item>
          <Menu.Item key="publicHeader" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >请求头规范</span>
          </Menu.Item>
          <Menu.Item key="masterData" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >主数据规范</span>
          </Menu.Item>
          <Menu.Item key="APIDevelopmentStandard" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >API开发规范</span>
          </Menu.Item>
          <Menu.Item key="APIManagerRules" >
            <Icon type="file-word" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >API管理制度</span>
          </Menu.Item>
          <Menu.Item key="APIServiceTemplate" >
            <Icon type="file-text" style={{fontSize:'14px'}} />
            <span style={{fontSize:'14px'}} >API梳理模板</span>
          </Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
