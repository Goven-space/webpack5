import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import PageFooter from '../../../core/components/PublicPageFooter';
import LeftMenu_System from './LeftMenu_System';
import LeftMenu_BUArea from './LeftMenu_BUArea';
import LeftMenu_TagsName from './LeftMenu_TagsName';
import ShowApiDoc from '../../form/ShowApiDoc';
import ApiListRightHome from './ApiListRightHome';

//API-按应用展示API列表

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;


class ApiListLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.menuPath=[];
    this.title='按应用系统';
    this.state={
        mask:false,
        collapsed: false,
        menuId:'listAllApis',
        reload:true,
        leftMenuWidth:200,
        menuNodeObj:{},
        menuType:this.props.menuType||'LeftMenu_System',
      }
  }

  componentDidMount(){
  }

  componentWillReceiveProps=(nextProps)=>{
    if(nextProps.menuType!==this.menuType){
        this.setState({menuType:nextProps.menuType,menuId:'listAllApis'});
    }
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key,menuNodeObj={})=>{
    if(menuNodeObj.isAppFlag && menuNodeObj.isLeaf){key="*";}
    this.setState({menuId:key,menuNodeObj:menuNodeObj});
  }

  render(){

    //左则菜单变更
    let leftMenu,nodeName;
    if(this.state.menuType=='LeftMenu_System'){
      this.title='按应用系统';
      nodeName=this.state.menuNodeObj.text||'所有已发布API列表';
      leftMenu=<LeftMenu_System memuClick={this.handleClick} appId={this.appId} />;
    }else if(this.state.menuType=='LeftMenu_BUArea'){
      this.title='按业务域';
      nodeName=this.state.menuNodeObj.areaName||'所有已发布API列表';
      leftMenu=<LeftMenu_BUArea memuClick={this.handleClick} appId={this.appId} />;
    }else if(this.state.menuType=='LeftMenu_TagsName'){
      this.title='按标签';
      nodeName=this.state.menuNodeObj.areaName||'所有已发布API列表';
      leftMenu=<LeftMenu_TagsName memuClick={this.handleClick} appId={this.appId} />;
    }

    //右则api列表
    let content;
    let categoryId=this.state.menuId;
    let tagsName='';
    this.appId=this.state.menuNodeObj.appId||'';
    let nodeType=this.state.menuNodeObj.nodeType;
    let businessClassIds=this.state.menuNodeObj.nodeId||''; //业务域的id
    if(businessClassIds!=''){categoryId='';this.appId='';} //以业务域为优先
    if(nodeType=='tags'){
      categoryId='';
      this.appId='';
      businessClassIds='';
      tagsName=this.state.menuNodeObj.value; //说明点击的是标签
    }

    this.menuPath=[this.title,nodeName];
    if(this.state.menuId==='listAllApis'){
      content=<ApiListRightHome appId={this.appId} categoryId='*' businessClassIds='' tagsName='' />;
    }else if(this.state.menuId=='ShowApiDoc'){
      content=<ShowApiDoc id={categoryId} />;
    }else{
      content=<ApiListRightHome appId={this.appId}  categoryId={categoryId} businessClassIds={businessClassIds} tags={tagsName} />;
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout style={{ marginLeft: this.state.leftMenuWidth }}>
              <Sider
                trigger={null}
                width={this.state.leftMenuWidth}
                collapsible
                collapsed={this.state.collapsed}
                className="title-menu-min-w"
                style={{
									background: URI.Theme.leftLayoutBackground,
									overflow: "auto",
									position: "fixed",
									top: "64px",
									left: 0,
									height: "93%",
								}}
              >
                {leftMenu}
              </Sider>
							<Content>
							<div style={{ margin: "10px 0 -4px 0",padding: "15px 15px 15px"}}>
                    <Breadcrumb style={{ margin: "0 0 0 10px" }}>
                      {this.menuPath.map((item) => {
                        return (
                          <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                        );
                      })}
                    </Breadcrumb>
                </div>
                <div className="main-content-style">{content}</div>
							</Content>
        </Layout>
      </Spin>
    );
  }
}

export default ApiListLayout;
