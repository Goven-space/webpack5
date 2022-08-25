import React from 'react';
import { Menu, Icon, Input, Badge, Breadcrumb, Spin } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//Mongo左则菜单
const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl = URI.CONNECT.MONGOD.menu;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.menuClick = this.props.memuClick;
    this.state = {
      mask: true,
      menuId: 'home',
      menuNodeObj: {},
      menuData: [],
    }
  }

  componentDidMount() {
    this.loadData();
  }

  //清除定时器
  componentWillUnmount() {
  }

  //载入菜单
  loadData = () => {
    let url = MenuUrl;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data});
        }
    });
    this.setState({ mask: false });
  }

  handleClick = (item) => {
    this.menuClick(item.key);
  }

  render() {
    const loop = data => data.map((item) => {
        let title = <span style={{ fontSize: '14px' }} >{item.nodeText}</span>;
        return <Menu.Item key={item.nodeId} >
        <Icon type="profile" style={{fontSize:'14px'}} /><span style={{ fontSize: '14px' }} >{item.nodeText}<Badge count={item.serviceCount} style={{ backgroundColor: '#87d068' }} /></span>
      </Menu.Item>;
    });
    let menus = loop(this.state.menuData);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu mode="inline"
          style={{ minHeight: '800px', fontSize: '16px', paddingTop: '20px' }}
          defaultSelectedKeys={['mongoObj_all']}
          defaultOpenKeys={['mongoObj']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
          <SubMenu key="mongoObj" title={<span><Icon type="bars" style={{fontSize:'14px'}} /><span style={{ fontSize: '14px' }}>数据对象</span></span>}>
            <Menu.Item key="mongoObj_all" >
              <Icon type="profile" style={{fontSize:'14px'}} />
              <span style={{ fontSize: '14px' }} >所有数据对象</span>
            </Menu.Item>
            {menus}
          </SubMenu>
            <Menu.Item key="mongoAllService" >
              <Icon type="api" style={{fontSize:'14px'}} />
              <span style={{ fontSize: '14px' }} >所有发布API</span>
            </Menu.Item>
            <Menu.Item key="mongoObjCategory" >
              <Icon type="file" style={{fontSize:'14px'}} />
              <span style={{ fontSize: '14px' }} >对象分类管理</span>
            </Menu.Item>
        </Menu>
      </Spin>
    );
  }
}

export default LeftMenu;
