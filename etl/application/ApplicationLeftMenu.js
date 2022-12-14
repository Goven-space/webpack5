import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const basePath=URI.rootPath;
const listCategorys=URI.ETL.APPLICATION.menuCategorys;

class ApplicationLeftMenu extends React.Component{

  constructor(props){
    super(props);
    this.menuClick=this.props.memuClick;
    this.state={
      mask:false,
      appCategoryData:[],
      ruleMenus:[],
      allCount:0,
      myCount:0,
    };
  }

  componentDidMount(){
    let url=listCategorys+"?applicationId=ETL01";
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({appCategoryData:data.menus,ruleMenus:data.ruleMenus,allCount:data.allCount,myCount:data.myCount});
          }
      });
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.menuClick(e.key);
  }

  render() {
    const loop = data => data.map((item) => {
        if (item.children!==null && item.children!==undefined) {
          let icon="appstore";
          if(item.icon!==undefined && item.icon!==null){icon=item.icon;}
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){  title=<span style={{fontSize:'14px'}} >{item.label}</span>;}
          return <SubMenu key={item.nodeId} title={title} >{loop(item.children)}</SubMenu>;
        }else{
          if(item.count!==undefined){
              return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}} >{item.label}{' '}<Badge count={item.count} overflowCount={99}  style={{fontSize:'9px', backgroundColor: '#52c41a' }} /></Menu.Item>;
          }else{
              return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
          }
        }
    });
    let ruleMenus= loop(this.state.ruleMenus);

    return (
      <div>
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['APPDesigner']}
        defaultSelectedKeys={['ListApplications']}
        mode="inline"
        style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
        theme={URI.Theme.leftMenu}
      >
        <SubMenu key="APPDesigner"  title={<span><Icon type="appstore" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >??????????????????</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ListApplications'><Icon type="appstore" style={{fontSize:'14px'}} />????????????{' '}<Badge count={this.state.allCount} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListMyApps'><Icon type="solution" style={{fontSize:'14px'}} />????????????{' '}<Badge count={this.state.myCount} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>
          {this.state.appCategoryData.map(item => <Menu.Item style={{fontSize:'14px'}} key={item.nodeId}><Icon type="tags" style={{fontSize:'14px'}} />{item.nodeText}{' '}<Badge count={item.number} overflowCount={999} offset={[0,0]} style={{ backgroundColor: '#87d068' }} /></Menu.Item>)}
          <Menu.Item style={{fontSize:'14px'}} key='ListApplicationsManager'><Icon type="appstore" style={{fontSize:'14px'}} />????????????</Menu.Item>
        </SubMenu>
        <SubMenu key="rules"  title={<span><Icon type="code" style={{fontSize:'14px'}} /><span style={{fontSize:'14px'}} >????????????</span></span>}>
          {ruleMenus}
        </SubMenu>
        <SubMenu  key='report'  title={<span style={{fontSize:'14px'}} ><Icon type='line-chart' style={{fontSize:'14px'}} /><span>????????????</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ProcessReport'>??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListApplicationErrorDataReport'>??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='DataSourceDependencies' >?????????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='TableDependencies' >??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='DataTransmissionCharts' >??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ScheduleDistributionCharts' >??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ServerCountCharts' >??????????????????</Menu.Item>
        </SubMenu>
        <SubMenu  key='monitor'  title={<span style={{fontSize:'14px'}} ><Icon type='dot-chart' style={{fontSize:'14px'}} /><span>????????????</span></span>}>
          <Menu.Item style={{fontSize:'14px'}} key='ListProcessTask' >??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='RamAndThead' >?????????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ListEngineMemroyIndocs' >?????????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ClusterServer' >?????????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='LoginLog' >??????????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ToDayLog' >???????????????</Menu.Item>
          <Menu.Item style={{fontSize:'14px'}} key='ErrorJavaBean' >???????????????Bean</Menu.Item>
        </SubMenu>
      </Menu>
      </div>
    );
  }

}

export default ApplicationLeftMenu;
