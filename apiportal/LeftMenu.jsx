import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//esb左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const leftmenuCountUrl=URI.CORE_APIPORTAL_HOEMMENU.leftmenuCount;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.isDesigner=this.props.isDesigner;
    this.state={
        mask:false,
        menuId:'home',
        data:{approverCount:0,appyCount:0}
      }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    // console.log(nextProps.isDesigner);
      if(this.isDesigner!==nextProps.isDesigner){
        this.setState({isDesigner:nextProps.isDesigner});
      }
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
              <span style={{fontSize:'14px'}} >概览</span>
            </Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='changeapi' ><Icon type="tag" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API变更通知 <Badge count={this.state.data.changeCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='todolist' ><Icon type="idcard" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >待我审批API <Badge count={this.state.data.approverCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
              <Menu.Item key='myappyapi' style={{fontSize:'14px'}} ><Icon type="user-add" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >我申请的API <Badge count={this.state.data.appyCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
              <Menu.Item key='followapi' style={{fontSize:'14px'}} ><Icon type="heart" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >我关注的API <Badge count={this.state.data.followCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
              <Menu.Item key='mypublishs' style={{fontSize:'14px'}} ><Icon type="api" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >我发布的API <Badge count={this.state.data.publishCount} overflowCount={999}  style={{backgroundColor: '#52c41a' }} /></span></Menu.Item>
              <Menu.Item key='allapis' style={{fontSize:'14px'}} ><Icon type="api" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >所有发布的API</span></Menu.Item>
              <Menu.Item key='testapi' style={{fontSize:'14px'}} ><Icon type="clock-circle" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API测试记录</span></Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
