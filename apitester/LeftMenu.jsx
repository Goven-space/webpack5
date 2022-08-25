import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//api测试左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const leftmenuCountUrl=URI.CORE_TESTREPORT.menuCount;


class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
        data:{approverCount:0,appyCount:0}
      }
  }

  componentDidMount(){
    this.loadData();
  }

  //清除定时器
  componentWillUnmount(){

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
              <Icon type="profile" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >概览</span>
            </Menu.Item>
            <Menu.Item style={{fontSize:'14px'}} key='testcase' ><Icon type="tag" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >测试用例<Badge count={this.state.data.caseCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
            <Menu.Item key='testlog' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >测试记录<Badge  overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
            <Menu.Item key='testplan' style={{fontSize:'14px'}} ><Icon type="clock-circle" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}}  >测试计划<Badge count={this.state.data.planCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
            <Menu.Item key='testreport' style={{fontSize:'14px'}} ><Icon type="project" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >测试结果<Badge count={this.state.data.reportCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
            <Menu.Item key='performanceTest' style={{fontSize:'14px'}} ><Icon type="project" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >压力测试<Badge count={this.state.data.ptsCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></span></Menu.Item>
            <Menu.Item key='performanceTestParams' style={{fontSize:'14px'}} ><Icon type="project" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >压测变量</span></Menu.Item>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
