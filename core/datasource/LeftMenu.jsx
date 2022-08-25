import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//etl左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.CORE_DATASOURCE.letMenuUrl;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:true,
        menuId:'home',
        menuNodeObj:{},
        menuData:[],
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo();
    this.loadData();
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
    const loop = data => data.map((item) => {
        if (item.children!==null && item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type='database' style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <SubMenu key={item.nodeId} title={title} >{loop(item.children)}</SubMenu>;
        }else{
          let icon='database';
          if(item.id=='all'){
            icon='unordered-list';
          }
          return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}} ><Icon type={icon}  /><span>{item.label}</span></Menu.Item>;
        }
    });
    let menus= loop(this.state.menuData);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['all#所有数据源']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            {menus}
            <Menu.Item key="dataSourceCategory" >
              <Icon type="setting" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >分类管理</span>
            </Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
