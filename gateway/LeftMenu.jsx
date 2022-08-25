import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import * as ContextUtils from '../core/utils/ContextUtils';

//应用开发左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.CORE_GATEWAY_ROUTER.leftMenus

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
        isSuperAdmin:true,
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo();
    this.loadData();
    ContextUtils.getContext((data)=>{
      if(data.permissionId.indexOf("core.superadmin")==-1){
        this.setState({isSuperAdmin:false}); //是否是超级管理员
      }
    });
    // const self = this;
    // this.intervalId=setInterval(function(){
    //     self.loadData();
    // }, 10000);
  }

  //清除定时器
  componentWillUnmount(){
  //  window.clearInterval(this.intervalId);
  }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?appId="+this.appId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data.menus,appName:data.appName});
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
    if(menuNodeObj.openType==='2'){
        //在新窗口中打开
        window.open(menuNodeObj.url,menuNodeObj.id);
        return;
    }else if(menuNodeObj.openType==='3'){
        //覆盖当前窗口
        location.href(menuNodeObj.url);
        return;
    }
    this.menuClick(key,menuNodeObj);
  }

  getMenuObj=(menuItem,key)=>{
    let mainMenuObj=false;
    let findFlag=(menuItem.id===key);
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
        if(item.icon!==undefined && item.icon!==null && item.icon!==''){  icon=item.icon;  }
        if (item.children!=null && item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){title=<span style={{fontSize:'14px'}} >{item.label}</span>;}
          return <SubMenu  key={item.id}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.parentNodeId==='root'){
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <Menu.Item key={item.id} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
          if(item.count!=null && item.count!==undefined){
            return <Menu.Item key={item.id} style={{fontSize:'14px'}} >{item.label}<Badge count={item.count} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></Menu.Item>;
          }else{
            return <Menu.Item key={item.id} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
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
                      <Icon type="profile" style={{fontSize:'14px'}} />
                      <span style={{fontSize:'14px'}} >概览</span>
                    </Menu.Item>
                    <Menu.Item key="ListApplication_Gateway" >
                      <Icon type="api" style={{fontSize:'14px'}} />
                      <span style={{fontSize:'14px'}} >API注册</span>
                    </Menu.Item>
                    {menus}
                    <SubMenu  key='gatewayConfig'  title={<span style={{fontSize:'14px'}} ><Icon type='tag' style={{fontSize:'14px'}} /><span>网关配置</span></span>}>
                        <Menu.Item key='ListServices' style={{fontSize:'14px'}} >后端服务管理</Menu.Item>
                        <Menu.Item key='ListAuthentication' style={{fontSize:'14px'}} >统一认证管理</Menu.Item>
                        <Menu.Item key='GrayRuleRelease' style={{fontSize:'14px'}} >灰度发布配置</Menu.Item>
                        {this.state.isSuperAdmin?<Menu.Item key='APIControllerStrategy' style={{fontSize:'14px'}} >网关控制策略</Menu.Item>:''}
                        {this.state.isSuperAdmin?<Menu.Item key='LoadBalanceStrategy' style={{fontSize:'14px'}} >负载均衡策略</Menu.Item>:''}
                        <Menu.Item key='GatewayAppList' style={{fontSize:'14px'}} >路由分类管理</Menu.Item>
                        <Menu.Item key='VariantConfig' style={{fontSize:'14px'}} >全局变量配置</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='dataConfig'  title={<span style={{fontSize:'14px'}} ><Icon type='database' style={{fontSize:'14px'}} /><span>数据转换</span></span>}>
                        <Menu.Item key='reqDataFilters' style={{fontSize:'14px'}} >请求数据转换</Menu.Item>
                        <Menu.Item key='resDataFilters' style={{fontSize:'14px'}} >响应数据转换</Menu.Item>
                        <Menu.Item key='MockData' style={{fontSize:'14px'}} >模拟数据管理</Menu.Item>
                        <Menu.Item key='dataCacheConfig' style={{fontSize:'14px'}} >数据缓存规则</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='securityConfig'  title={<span style={{fontSize:'14px'}} ><Icon type='safety' style={{fontSize:'14px'}} /><span>安全设置</span></span>}>
                        <Menu.Item key='ipConfig' style={{fontSize:'14px'}} >IP黑白名单配置</Menu.Item>
                        <Menu.Item key='wordConfig' style={{fontSize:'14px'}} >敏感字符配置</Menu.Item>
                        <Menu.Item key='encryConfig' style={{fontSize:'14px'}} >数据加密配置</Menu.Item>
                        <Menu.Item key='qpsConfig' style={{fontSize:'14px'}} >限流规则配置</Menu.Item>
                        <Menu.Item key='ListHystrixConfigRule' style={{fontSize:'14px'}} >熔断规则配置</Menu.Item>
                        <Menu.Item key='ListResubmitRule' style={{fontSize:'14px'}} >防重复提交配置</Menu.Item>
                        <Menu.Item key='permissionConfig' style={{fontSize:'14px'}} >调用权限设置</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='waringconfig'  title={<span style={{fontSize:'14px'}} ><Icon type='warning' style={{fontSize:'14px'}} /><span>预警设置</span></span>}>
                        <Menu.Item key='timeoutWaring' style={{fontSize:'14px'}} >响应超时预警</Menu.Item>
                        <Menu.Item key='responseCodeWaring' style={{fontSize:'14px'}} >错误码预警</Menu.Item>
                        <Menu.Item key='speedWaring' style={{fontSize:'14px'}} >请求速率预警</Menu.Item>
                        <Menu.Item key='businessDataRule' style={{fontSize:'14px'}} >异常业务预警</Menu.Item>
                        <Menu.Item key='ListNetworkMonitor' style={{fontSize:'14px'}} >网络连通性预警</Menu.Item>
                    </SubMenu>
                    {this.state.isSuperAdmin?
                      <SubMenu  key='pluginMgr'  title={<span style={{fontSize:'14px'}} ><Icon type='form' style={{fontSize:'14px'}} /><span>插件管理</span></span>}>
                          <Menu.Item key='ControlStrategyBeans' style={{fontSize:'14px'}} >控制策略插件</Menu.Item>
                          <Menu.Item key='IGatewayDataFilters' style={{fontSize:'14px'}} >数据转换过滤插件</Menu.Item>
                          <Menu.Item key='IGatewayDataWaring' style={{fontSize:'14px'}} >业务数据预警插件</Menu.Item>
                          <Menu.Item key='APIParamsCheckBeans' style={{fontSize:'14px'}} >API参数验证插件</Menu.Item>
                          <Menu.Item key='LoadbalanceBeans' style={{fontSize:'14px'}} >负载均衡插件</Menu.Item>
                      </SubMenu>
                    :''}
                      <SubMenu  key='gatewMonitor'  title={<span style={{fontSize:'14px'}} ><Icon type='line-chart' style={{fontSize:'14px'}} /><span>网关监控</span></span>} >
                          <Menu.Item key='log' style={{fontSize:'14px'}} >控制台日志</Menu.Item>
                          <Menu.Item key='TopologicalGraph' style={{fontSize:'14px'}} >网关拓朴图</Menu.Item>
                          <Menu.Item key='TopologicalGraphForHost' style={{fontSize:'14px'}} >服务器链接监控</Menu.Item>
                          <Menu.Item key='ClusterServer' style={{fontSize:'14px'}} >网关集群服务器</Menu.Item>
                          <Menu.Item key='ListRealTimeLinks' style={{fontSize:'14px'}} >实时API链接排行</Menu.Item>
                          <Menu.Item key='RealTimeRequestInfo' style={{fontSize:'14px'}} >实时请求API监控</Menu.Item>
                          <Menu.Item key='Hystrix' style={{fontSize:'14px'}} >Hystrix熔断监控</Menu.Item>
                          <Menu.Item key='LocalServiceCache' style={{fontSize:'14px'}} >注册中心服务实例</Menu.Item>
                      </SubMenu>
                </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
