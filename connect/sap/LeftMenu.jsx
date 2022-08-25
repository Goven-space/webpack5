import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//sap左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.CONNECT.SAPRFC.menu;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:true,
        menuId:'home',
        menuNodeObj:{},
        menuData:{RfcCategory:[],RuleCategory:[]},
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
          let title=<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <SubMenu key={item.nodeId} title={title} >{loop(item.children)}</SubMenu>;
        }else{
          let icon='profile';
          if(item.id=='all'){
            icon='unordered-list';
          }
          return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}} ><Icon type={icon}  /><span>{item.label}</span></Menu.Item>;
        }
    });

    let menus= loop(this.state.menuData.RfcCategory);
    let ruleMenus= loop(this.state.menuData.RuleCategory);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['all#所有函数列表']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            {menus}
            <Menu.Item key='ListServicesByAppId' style={{fontSize:'14px'}} ><span><Icon type="api" style={{fontSize:'14px'}} />所有创建API</span></Menu.Item>
            <SubMenu  key='ListSapRule'  title={<span style={{fontSize:'14px'}} ><Icon type='code' style={{fontSize:'14px'}} /><span>规则管理</span></span>}>
              <Menu.Item style={{fontSize:'14px'}}  key='rule#all#所有规则列表' ><Icon type='profile' style={{fontSize:'14px'}} />所有规则列表</Menu.Item>
              {ruleMenus}
            </SubMenu>
            <SubMenu  key='setting'  title={<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>分类管理</span></span>}>
              <Menu.Item key='ruleCategory' style={{fontSize:'14px'}} ><span><Icon type="file" style={{fontSize:'14px'}} />规则分类</span></Menu.Item>
              <Menu.Item key="sapRfcCategory" >
                <Icon type="file" style={{fontSize:'14px'}} />
                <span style={{fontSize:'14px'}} >函数分类</span>
              </Menu.Item>
            </SubMenu>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
