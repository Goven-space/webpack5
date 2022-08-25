import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//esb左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.BPM.CORE_BPM_MENU.leftMenuUrl;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.applicationId=this.props.applicationId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:true,
        menuId:'home',
        menuNodeObj:{},
        menuData:{ProcessCategory:[],ServiceCategory:[],RuleCategory:[]},
      }
  }

  componentDidMount(){
    //AjaxUtils.getSystemInfo();
    this.loadData();
  }

  //清除定时器
  componentWillUnmount(){
  }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?applicationId="+this.applicationId;
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
    let processMenus= loop(this.state.menuData.ProcessCategory);
    let ruleMenus= loop(this.state.menuData.RuleCategory);

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
            <SubMenu  key='processDesigner'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>流程管理</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='process#all#所有编排流程' >所有流程</Menu.Item>
              {processMenus}
            </SubMenu>
            <SubMenu  key='monitor'  title={<span style={{fontSize:'14px'}} ><Icon type='project' style={{fontSize:'14px'}} /><span>流程监控</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='ListToDo'>待审批流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ListDone'>已审批流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ListEndDocs'>已结束流程</Menu.Item>
            </SubMenu>
            <SubMenu  key='ruleMgr'  title={<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>规则管理</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='rule#all#所有规则列表' >所有规则列表</Menu.Item>
              {ruleMenus}
            </SubMenu>
            <Menu.Item key="apiMgr" >
              <Icon type="api" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >流程服务</span>
            </Menu.Item>
            <SubMenu  key='setting'  title={<span style={{fontSize:'14px'}} ><Icon type='bars' style={{fontSize:'14px'}} /><span>应用配置</span></span>}>
              <Menu.Item key='variantConfig' style={{fontSize:'14px'}} ><span>公共变量配置</span></Menu.Item>
              <Menu.Item key='processCategory' style={{fontSize:'14px'}} ><span>流程分类设置</span></Menu.Item>
              <Menu.Item key='ruleCategory' style={{fontSize:'14px'}} ><span>规则分类设置</span></Menu.Item>
            </SubMenu>
        </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
