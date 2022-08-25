import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//链接器左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.CORE_CONNECTOR.menuUrl;

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
    this.loadData();
  }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?appId="+this.appId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data.rows});
        }
    });
  }

  handleClick=(item)=>{
    this.menuClick(item.key);
  }

  render(){
    const loop = data => data.map((item) => {
        let icon="profile";
        if(item.icon!==undefined && item.icon!==null && item.icon!==''){  icon=item.icon;  }
        if (item.children!==null && item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){title=<span style={{fontSize:'14px'}} >{item.label}</span>;}
          return <SubMenu  key={item.key}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.parentNodeId==='root'){
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <Menu.Item key={item.key} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
            return <Menu.Item key={item.key} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
        }
    });
    const menus = loop(this.state.menuData);
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Menu  mode="inline"
            style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
            defaultSelectedKeys={['*#所有API列表']}
            onClick={this.handleClick}
            theme={URI.Theme.leftMenu}
          >
              <Menu.Item key="*#所有链接API" >
                <Icon type="unordered-list" style={{fontSize:'14px'}} />
                <span style={{ fontSize: '14px' }} >所有链接API</span>
              </Menu.Item>
              {menus}
              <SubMenu  key='setting'  title={<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>链接器配置</span></span>}>
                <Menu.Item key='ListAuthentication' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />认证插件管理</span></Menu.Item>
                <Menu.Item key='reqDataFilters' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />请求数据转换</span></Menu.Item>
                <Menu.Item key='resDataFilters' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />响应数据转换</span></Menu.Item>
                <Menu.Item key='rules' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />数据转换插件</span></Menu.Item>
                <Menu.Item key='variantConfig' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />应用变量配置</span></Menu.Item>
                <Menu.Item key='category' style={{fontSize:'14px'}} ><span><Icon type="file-text" style={{fontSize:'14px'}} />API分类管理</span></Menu.Item>
              </SubMenu>
          </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
