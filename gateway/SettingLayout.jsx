import React from 'react';
import {Menu,Layout,Icon,Card} from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import TopMenu from './components/TopMenu';
import PageFooter from '../core/components/PageFooter';

//系统设置
import Set_platforminfo from '../core/setting/platforminfo';
import Set_NewSN from '../core/setting/form/NewSN';
import Set_ListBusinessSystems from '../core/setting/grid/ListBusinessSystems';
import Set_ListEnvironments from '../core/setting/grid/ListEnvironments';
import Set_ListDataSource from '../core/datasource/grid/ListDataSource';
import Set_ListCategoryType from '../core/setting/grid/ListCategoryType';
import Set_ServiceControls from '../core/setting/grid/ListServiceControlStrategy';

//admin-定时任务管理
import Setting_Scheduler from '../core/setting/grid/ListSchedulerTasks';
import Setting_PlatformSetting from '../core/setting/grid/ListPlatformSetting';
import Setting_Langs from '../core/setting/grid/ListMultiLangs';
import Setting_PlatformTemplate from '../core/setting/grid/ListPlatformTemplateCode';

const { Header, Footer, Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const getControllerCategorysUrl=URI.CORE_CATEGORYNODE.listAllNodes;

//Index是RestUrlManager的入口布局文件
class indexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId="core";
    this.state={
      current:'Set_platforminfo',
    }
  }

  componentDidMount(){
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
  }

  render(){
    let currentId=this.state.current;
    let content;
    if(currentId==='Set_platforminfo'){
        content=<Set_platforminfo appId={this.appId} />;
    }else if(currentId==='Setting_PlatformSetting'){
        content=<Setting_PlatformSetting appId={this.appId} />;
    }else if(currentId==='Set_ListEnvironments'){
        content=<Set_ListEnvironments appId={this.appId} />;
    }else if(currentId==='Set_ListDataSource'){
        content=<Set_ListDataSource appId={this.appId} />;
    }else if(currentId==='Setting_Scheduler'){
        content=<Setting_Scheduler appId={this.appId} />;
    }else if(currentId==='Set_ListBusinessSystems'){
        content=<Set_ListBusinessSystems appId={this.appId} />;
    }else if(currentId==='Setting_Langs'){
        content=<Setting_Langs appId={this.appId} />;
    }else if(currentId==='Setting_PlatformTemplate'){
        content=<Setting_PlatformTemplate appId={this.appId} />;
    }else if(currentId==='Set_ListCategoryType'){
        content=<Set_ListCategoryType appId={this.appId} />;
    }else if(currentId==='Set_NewSN'){
        content=<Set_NewSN appId={this.appId} />;
    }


    return (
          <Layout  >
            <Sider style={{ background: '#fff'}} >
              <Menu onClick={this.handleClick}
                defaultOpenKeys={['systemSet','controllerStrategy','systemInfo']}
                selectedKeys={[this.state.current]}
                mode="inline"
              >
                <SubMenu key="systemInfo" title={<span><Icon type="appstore" />关于平台</span>}>
                  <Menu.Item key='Set_platforminfo'>平台版权信息</Menu.Item>
                  <Menu.Item key='Set_NewSN'>平台序列号</Menu.Item>
                </SubMenu>
                <SubMenu key="systemSet" title={<span><Icon type="appstore" />系统设置</span>}>
                  <Menu.Item key='Setting_PlatformSetting'>平台参数配置</Menu.Item>
                  <Menu.Item key='Set_ListEnvironments'>配置环境管理</Menu.Item>
                  <Menu.Item key='Set_ListDataSource'>数据源管理</Menu.Item>
                  <Menu.Item key='Setting_Scheduler'>定时任务设置</Menu.Item>
                </SubMenu>
              </Menu>
            </Sider>
            <Content style={{left:'-1px',background: '#fff', padding: '5px 25px',borderLeft:'1px solid #e9e9e9',position:'relative'}} >
              {content}
            </Content>
          </Layout>
      );
  }
}

export default indexLayout;
