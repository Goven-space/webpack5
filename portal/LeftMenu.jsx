import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//portal开发左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const CountUrl=URI.CORE_HOMEPAGE.GetPortalLeftMenuCount;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.pageId=this.props.pageId;
    this.state={
        mask:false,
        menuId:'home',
        menuCount:{noticeCount:0,taskCount:0,warningCount:0,platform:true},
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    AjaxUtils.get(CountUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({mask:true});
          this.setState({menuCount:data,mask:false});
        }
    });
  }

  //清除定时器
  componentWillUnmount(){

  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.menuClick(e.key);
  }

  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
                <Menu  mode="inline"
                  style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
                  defaultSelectedKeys={[this.pageId]}
                  onClick={this.handleClick}
                  theme={URI.Theme.leftMenu}
                >
                    <Menu.Item key='ListNotices' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span>通知公告<Badge count={this.state.menuCount.noticeCount} overflowCount={999}  style={{ backgroundColor: '#f50' }} /></span></Menu.Item>
                    <Menu.Item key='TaskBoard' style={{fontSize:'14px'}} ><Icon type="project" style={{fontSize:'14px'}} /><span>任务看板<Badge count={this.state.menuCount.taskCount} overflowCount={999}  style={{ backgroundColor: '#f50' }} /></span></Menu.Item>
                    <Menu.Item key='LogCalendar' style={{fontSize:'14px'}} ><Icon type="pushpin" style={{fontSize:'14px'}} /><span>工作日记</span></Menu.Item>
                    {this.state.menuCount.platform?
                      <Menu.Item key='ListPublishCategorys' style={{fontSize:'14px'}} ><Icon type="database" style={{fontSize:'14px'}} /><span>数据迁移</span></Menu.Item>
                    :''}
                    {this.state.menuCount.platform?
                        <Menu.Item key='ListApproverData' style={{fontSize:'14px'}} ><Icon type="database" style={{fontSize:'14px'}} /><span>数据审核</span></Menu.Item>
                    :''}
                    {
                      this.state.menuCount.platform?
                        <SubMenu  key='gatewayConfig'  title={<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>平台配置</span></span>}>
                          <Menu.Item style={{fontSize:'14px'}} key='Setting_PlatformSetting'>平台参数配置</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key='Setting_Scheduler'>定时任务设置</Menu.Item>
                          <Menu.Item style={{ fontSize: '14px' }} key='BackupAndUpdate'>一键备份升级</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key='Set_ListLoadBalance'>负载均衡策略</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key='Set_ControllerStrategy'>服务控制策略</Menu.Item>
                          <Menu.Item style={{fontSize:'14px',display:'none'}} key='Setting_ListDB'>平台Mongo管理</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key='Setting_PlatformTemplate'>平台模板代码</Menu.Item>
                          <Menu.Item style={{fontSize:'14px'}} key='Set_ListEnvironments'>配置环境管理</Menu.Item>
                        </SubMenu>
                    :''}

                    <SubMenu  key='gatewMonitor'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>关于平台</span></span>} >
                      <Menu.Item style={{fontSize:'14px'}} key='Set_platforminfo'>平台版权信息</Menu.Item>
                        {
                          this.state.menuCount.platform?
                          <Menu.Item style={{fontSize:'14px'}} key='Set_NewSN'>平台序列号</Menu.Item>
                          :''
                      }
                    </SubMenu>
                </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
