import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//etl左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

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

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Menu  mode="inline"
          style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
          defaultSelectedKeys={['home']}
          onClick={this.handleClick}
          theme={URI.Theme.leftMenu}
        >
            <Menu.Item key="home" >
              <Icon type="profile" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >概览</span>
            </Menu.Item>
            <Menu.Item key="ListCDCConsumer" >
              <Icon type="message" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >增量数据消费</span>
            </Menu.Item>
            <Menu.Item key="ListCDCProducer" >
              <Icon type="message" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >增量数据采集</span>
            </Menu.Item>
            <Menu.Item key="ListTopicManager" >
              <Icon type="setting" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >主题管理</span>
            </Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
