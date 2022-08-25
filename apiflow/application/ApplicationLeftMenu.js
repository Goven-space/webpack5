import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const basePath=URI.rootPath;
const listCategorys=URI.ESB.APPLICATION.menuCategorys;

class ApplicationLeftMenu extends React.Component{

  constructor(props){
    super(props);
    this.menuClick=this.props.memuClick;
    this.state={
      mask:false,
      appCategoryData:[],
      allCount:0,
      myCount:0,
    };
  }

  componentDidMount(){
      AjaxUtils.get(listCategorys,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({appCategoryData:data.menus,allCount:data.allCount,myCount:data.myCount});
          }
      });
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.menuClick(e.key);
  }

  render() {
    return (
      <div>
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['APPDesigner']}
        defaultSelectedKeys={['ListApplications']}
        mode="inline"
        style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
        theme={URI.Theme.leftMenu}
      >
        <SubMenu key="APPDesigner"  title={<span><Icon type="appstore" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >API编排应用</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ListApplications'><Icon type="appstore" style={{fontSize:'14px'}} />所有应用{' '}<Badge count={this.state.allCount} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListMyApps'><Icon type="solution" style={{fontSize:'14px'}} />我的应用{' '}<Badge count={this.state.myCount} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>
          {this.state.appCategoryData.map(item => <Menu.Item style={{fontSize:'14px'}} key={item.nodeId}><Icon type="tags" style={{fontSize:'14px'}} />{item.nodeText}{' '}<Badge count={item.number} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>)}
          <Menu.Item style={{fontSize:'14px'}} key='ListApplicationsManager'><Icon type="appstore" style={{fontSize:'14px'}} />应用管理</Menu.Item>
        </SubMenu>
        <Menu.Item key="nodeTemplateCategory" >
          <Icon type="solution" style={{fontSize:'14px'}} />
          <span style={{fontSize:'14px'}} >公共组件库</span>
        </Menu.Item>
        <SubMenu  key='cpumonitor'  title={<span style={{fontSize:'14px'}} ><Icon type='dot-chart' style={{fontSize:'14px'}} /><span>平台监控</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ToDayLog' >控制台日志</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListProcessTask' >任务队列监控</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='joinApis' >被编排的API</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ProcessReport'>流程运行统计</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ScheduleDistributionCharts' >流程调度量统计</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ServerCountCharts' >任务领取分布</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ClusterServer' >集群服务器</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListLocalCacheServer' >注册中心服务实例</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='RamAndThead' >内存线程监控</Menu.Item>
        </SubMenu>
      </Menu>
      </div>
    );
  }

}

export default ApplicationLeftMenu;
