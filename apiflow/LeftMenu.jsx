import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//esb左则菜单

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.ESB.CORE_ESB_MENU.leftMenuUrl;

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
    let apiMenus= loop(this.state.menuData.ServiceCategory);
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
            <SubMenu  key='processDesigner'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>服务编排</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='process#all#所有编排流程' >所有编排流程</Menu.Item>
              {processMenus}
            </SubMenu>
            <SubMenu  key='monitor'  title={<span style={{fontSize:'14px'}} ><Icon type='project' style={{fontSize:'14px'}} /><span>服务监控</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='ListProcessTask'>待执行任务</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ApproverProcess'>待审批流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='CompensateProcess'>待补偿流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='CompensateFailed'>补偿失败流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ListCompensateNodeIns'>待补偿节点</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ListCompensateNodeInsFailed'>所有补偿节点</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='AsyncQueue'>异步等待队列</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='RuningProcess'>未结束流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='StopProcess'>已结束流程</Menu.Item>
              <Menu.Item style={{fontSize:'14px'}} key='ListProcessHistory'>已归档流程</Menu.Item>
            </SubMenu>
            <Menu.Item key="apiMgr" >
              <Icon type="api" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >创建的API</span>
            </Menu.Item>
            <Menu.Item key="joinApis" >
              <Icon type="api" style={{fontSize:'14px'}} />
              <span style={{fontSize:'14px'}} >被编排的API</span>
            </Menu.Item>
            <Menu.Item key='mappingCategory' style={{fontSize:'14px'}} ><Icon type="api" style={{fontSize:'14px'}} /><span>数据映射配置</span></Menu.Item>
            <SubMenu  key='ruleMgr'  title={<span style={{fontSize:'14px'}} ><Icon type='setting' style={{fontSize:'14px'}} /><span>规则管理</span></span>}>
              <Menu.Item style={{fontSize:'14px'}} key='rule#all#所有规则列表' >所有规则列表</Menu.Item>
              {ruleMenus}
            </SubMenu>
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
