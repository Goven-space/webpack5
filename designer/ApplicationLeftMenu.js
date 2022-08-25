import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const basePath=URI.rootPath;
const listCategorys=URI.LIST_APP.listCategorys;

class ApplicationLeftMenu extends React.Component{

  constructor(props){
    super(props);
    this.menuClick=this.props.memuClick;
    this.state={
      mask:false,
      appCategoryData:[]
    };
  }

  componentDidMount(){
      AjaxUtils.get(listCategorys,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({appCategoryData:data});
          }
      });
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.menuClick(e.key);
  }

  render() {
    return (
      <div>
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['APPDesigner']}
        defaultSelectedKeys={['ListAllApps']}
        mode="inline"
        style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
        theme={URI.Theme.leftMenu}
      >
        <SubMenu key="APPDesigner"  title={<span><Icon type="appstore" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API开发平台</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ListAllApps'><Icon type="appstore" style={{fontSize:'14px'}} />所有应用</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListMyApps'><Icon type="solution" style={{fontSize:'14px'}} />我的应用</Menu.Item>
          {this.state.appCategoryData.map(item => <Menu.Item style={{fontSize:'14px'}} key={item.nodeId}><Icon type="tags" style={{fontSize:'14px'}} />{item.nodeText}{' '}<Badge count={item.number} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>)}
          <Menu.Item style={{fontSize:'14px'}} key='AppManager'><Icon type="appstore" style={{fontSize:'14px'}} />应用管理</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='AppVersionManager'><Icon type="flag" style={{fontSize:'14px'}} />版本管理</Menu.Item>
        </SubMenu>
      </Menu>
      </div>
    );
  }

}

export default ApplicationLeftMenu;
