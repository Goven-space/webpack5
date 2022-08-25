import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';

//按标签查看=列出所有标签

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl = URI.CORE_ApiTagsConfig.listAll;

class LeftMenu_TagsName extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId||'';
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
    let url=MenuUrl;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          for(let i=0;i<data.length;i++){
            data[i].key=data[i].value;
          }
          this.setState({menuData:data});
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
          let title=<span style={{fontSize:'14px'}} ><Icon type='tag' style={{fontSize:'14px'}} />{item.text}</span>;
          return <Menu.Item key={item.text} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
    });
    const menus = loop(this.state.menuData);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['listAllApis']}
          onClick={this.handleClick}
          theme='light'
        >
            <Menu.Item key="listAllApis" >
              <Icon type="unordered-list" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >所有发布API<Badge count={this.state.allCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span>
            </Menu.Item>
            {menus}
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu_TagsName;
