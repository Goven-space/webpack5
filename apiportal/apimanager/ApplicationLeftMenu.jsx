import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as ContextUtils from '../../core/utils/ContextUtils';

//API注册管理左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl = URI.CORE_APIREG_MANAGER.leftMenus;

class ApplicationLeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
        menuData:[],
        allCount:0,
        reqCount:0,
        isAdminFlag:false,
      }
  }

  componentDidMount(){
    this.loadData();
  }

  //载入菜单
  loadData=()=>{
    this.setState({mask:true});
    let url=MenuUrl+"?appId="+this.appId+"&categoryId="+this.appId+".ServiceCategory";
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          for(let i=0;i<data.length;i++){
            data[i].key=data[i].value;
          }
          this.setState({menuData:data.rows,isAdminFlag:data.isAdminFlag});
        }
    });
  }

    handleClick=(item)=>{
      let key=item.key;
      //点击共他菜单时根据key找到点击的菜单对象
      let menuNodeObj; //用户点击的菜单对象
      let findFlag=false;
      let menuItems=this.state.menuData;
      for(let i=0;i<menuItems.length;i++){
        menuNodeObj=this.getMenuObj(menuItems[i],key);
        // console.log("找到一个菜单menuNodeObj="+menuNodeObj);
        if(menuNodeObj!==false){
          findFlag=true;
          break;
        }
        if(findFlag){break;}
      }
      this.menuClick(key,menuNodeObj);
    }

    getMenuObj=(menuItem,key)=>{
      let mainMenuObj=false;
      let findFlag=(menuItem.key===key);
      //console.log(menuItem.id+"==="+key+" =>"+findFlag);
      if(findFlag===true){
        //console.log("找到菜单="+menuItem);
        mainMenuObj=menuItem;
      }else if(menuItem.children!==null && menuItem.children!==undefined){
        for(let j=0;j<menuItem.children.length;j++){
          let menuObj=this.getMenuObj(menuItem.children[j],key);
          if(menuObj!==false){
            mainMenuObj=menuObj;
            break;
          }
        }
      }
      //console.log(mainMenuObj);
      return mainMenuObj;
    }

  render(){
    const loop = data => data.map((item) => {
        let icon="appstore";
        if (item.children!==null && item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label} <Badge count={item.count} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></span>;
          if(item.isAppFlag!==true){
            title=<span style={{fontSize:'14px'}} >{item.label}</span>;
          }
          return <SubMenu  key={item.key}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.isAppFlag===true || this.appId!==''){
          let tmpIcon=item.isAppFlag?"appstore":'api';
          let title=<span style={{fontSize:'14px'}} ><Icon type={tmpIcon} style={{fontSize:'14px'}} /><span>{item.label} <Badge count={item.count} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></span>;
          return <Menu.Item key={item.key} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
          if(item.count!==undefined){
            return <Menu.Item key={item.key} style={{fontSize:'14px'}} >{item.label} <Badge count={item.count} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></Menu.Item>;
          }else{
            return <Menu.Item key={item.key} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
          }
        }
    });
    const menus = loop(this.state.menuData);

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
              <span style={{fontSize:'14px'}} >应用管理<Badge count={this.state.appCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span>
            </Menu.Item>
            <SubMenu  key='bjmgr'  title={<span style={{fontSize:'14px'}} ><Icon type='profile' style={{fontSize:'14px'}} /><span>标准管理</span></span>}>
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
                  <span style={{fontSize:'14px'}} >主数据管理</span>
                </Menu.Item>
                <Menu.Item key="mockData" >
                  <Icon type="database" style={{fontSize:'14px'}} />
                  <span style={{fontSize:'14px'}} >模拟数据管理</span>
                </Menu.Item>
                <Menu.Item key="serverHost" >
                  <Icon type="profile" style={{fontSize:'14px'}} />
                  <span style={{fontSize:'14px'}} >后端服务管理<Badge count={this.state.appCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key="allapis" >
                <Icon type="unordered-list" style={{fontSize:'14px'}} />
                <span style={{fontSize:'14px'}} >所有注册API</span>
              </Menu.Item>
              {menus}
        </Menu>
        </Spin>
    );
  }
}

export default ApplicationLeftMenu;
