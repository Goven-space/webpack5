import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//API监控平台左则菜单
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

  handleClick=(item)=>{
    let key=item.key;
    this.menuClick(key);
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
                      <span style={{fontSize:'14px'}} >监控首页</span>
                    </Menu.Item>
                    <SubMenu  key='apiRunTime'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>API运行时监控</span></span>}>
                        <Menu.Item key='ListRealTimeRequestInfo' style={{fontSize:'14px'}} >API实时请求监控</Menu.Item>
                        <Menu.Item key='ListServices' style={{fontSize:'14px'}} >API实时运行数据</Menu.Item>
                        <Menu.Item key='ListRealTimeLinks' style={{fontSize:'14px'}} >API实时链接数排行</Menu.Item>
                        <Menu.Item key='ListException' style={{fontSize:'14px'}} >API执行异常监控</Menu.Item>
                        <Menu.Item key='ListErrorResponseCode' style={{fontSize:'14px'}} >非200状态码请求</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='apiReport'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>API调用统计分析</span></span>}>
                        <Menu.Item key='ApiCallsByWeekChart' style={{fontSize:'14px'}} >API每日调用次数</Menu.Item>
                        <Menu.Item key='ListReportApiAccessLog' style={{fontSize:'14px'}} >API调用次数及性能</Menu.Item>
                        <Menu.Item key='ApiPerformanceChart' style={{fontSize:'14px'}} >API平均性能分布图</Menu.Item>
                        <Menu.Item key='AppCallStatis' style={{fontSize:'14px'}} >应用调用次数Top统计</Menu.Item>
                        <Menu.Item key='UserCallTopStatis' style={{fontSize:'14px'}} >用户调用次数Top统计</Menu.Item>
                        <Menu.Item key='ErrorCodeCharts' style={{fontSize:'14px'}} >API状态码分布统计</Menu.Item>
                        <Menu.Item key='ServerCallStatisChart' style={{fontSize:'14px'}} >各集群服务器调用次数</Menu.Item>
                        <Menu.Item key='ListInvalidApis' style={{fontSize:'14px'}} >失效或重复的API列表</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='serverMonitor'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>应用服务器监控</span></span>}>
                        <Menu.Item key='ListClusterServer' style={{fontSize:'14px'}} >集群服务器监控</Menu.Item>
                        <Menu.Item key='ListLocalCacheServer' style={{fontSize:'14px'}} >本地服务实例缓存</Menu.Item>
                        <Menu.Item key='JvmMonitor' style={{fontSize:'14px'}} >内存及线程监控</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='platform'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>缓存及容器监控</span></span>} >
                        <Menu.Item key='ListBeans' style={{fontSize:'14px'}} >JavaBean对象容器</Menu.Item>
                        <Menu.Item key='ListErrorBeans' style={{fontSize:'14px'}} >实例化错误的Bean</Menu.Item>
                        <Menu.Item key='ListSpringBean' style={{fontSize:'14px'}} >SpringBean监控</Menu.Item>
                        <Menu.Item key='ListLoadJarFiles' style={{fontSize:'14px'}} >加载的Jar包列表</Menu.Item>
                        <Menu.Item key='ListAllCaches' style={{fontSize:'14px'}} >平台所有缓存</Menu.Item>
                        <Menu.Item key='ListBeanObjCache' style={{fontSize:'14px'}} >Bean实例缓存</Menu.Item>
                        <Menu.Item key='ListBeanConfigCache' style={{fontSize:'14px'}} >Bean配置缓存</Menu.Item>
                        <Menu.Item key='ListServiceConfigCache' style={{fontSize:'14px'}} >API配置缓存</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='apm'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>APM链路分析</span></span>} >
                        <Menu.Item key='apmbyuser' style={{fontSize:'14px'}} >按用户跟踪服务实例</Menu.Item>
                        <Menu.Item key='ApmUserAndAPI' style={{fontSize:'14px'}} >按用户跟踪API</Menu.Item>
                        <Menu.Item key='ApmBySystemName' style={{fontSize:'14px'}} >查看API依赖关系</Menu.Item>
                        <Menu.Item key='apmbyservice' style={{fontSize:'14px'}} >按服务实例跟踪</Menu.Item>
                        <Menu.Item key='ServiceNameDependencies' style={{fontSize:'14px'}} >全局服务依赖关系图</Menu.Item>
                        <Menu.Item key='apmbytraceId' style={{fontSize:'14px'}} >按traceId跟踪</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='syslogs'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>系统运行日志</span></span>} >
                        <Menu.Item key='ToDayLog' style={{fontSize:'14px'}} >控制台日志</Menu.Item>
                        <Menu.Item key='ListAllApiLog' style={{fontSize:'14px'}} >API调用日志</Menu.Item>
                        <Menu.Item key='ListAllUserActionLog' style={{fontSize:'14px'}} >系统操作日志</Menu.Item>
                        <Menu.Item key='SearchApiLog' style={{fontSize:'14px'}} >搜索API日志</Menu.Item>
                        <Menu.Item key='UserLoginLog' style={{fontSize:'14px'}} >用户登录日志</Menu.Item>
                        <Menu.Item key='ListLogDbManager' style={{fontSize:'14px'}} >日志库管理</Menu.Item>
                        <Menu.Item key='TrashDoc' style={{fontSize:'14px'}} >系统回收站</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='businesslogs'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>业务日志</span></span>} >
                      <Menu.Item key='BusinessApiLog' style={{fontSize:'14px'}} >业务操作日志</Menu.Item>
                      <Menu.Item key='ControlPanelLog' style={{fontSize:'14px'}} >控制面板</Menu.Item>
                    </SubMenu>
                </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
