import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import PageFooter from '../../../core/components/PublicPageFooter';
import LeftMenu from './LeftMenu';
import ListApplication from './ListApplication';
import ListServices from '../../../gateway/grid/ListServices';
import ListErrorCode from '../../../standard/errorcode/grid/ListErrorCode';
import ListHeaderCode from '../../../standard/headercode/grid/ListHeaderCode';
import ListMasterData from '../../../standard/masterdata/grid/ListMasterData';
import ListMockData from '../../../standard/mockdata/grid/ListMockData';
import ListBuinessDomain from '../../../standard/businessDomain/grid/ListBuinessDomain';
import ListApiTags from '../../../standard/apitags/grid/ListApiTags';

//API标准管理

const isAdminUrl=URI.LIST_APIPORTAL_APPLICATION.isAdminUrl;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;


class ApplicationLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.state={
        key:'home',
        mask:false,
        collapsed: false,
        menuId:'application',
        reload:true,
        leftMenuWidth:200,
        nodeName:'应用管理'
      }
  }

  componentDidMount(){
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key,nodeName)=>{
    this.setState({menuId:key,nodeName:nodeName});
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let nodeName=this.state.nodeName;
    this.menuPath=['标准管理',nodeName];
    if(menuId==='application'){
      content=<ListApplication  />;
    }else if(menuId=='errorCode'){
      content=<ListErrorCode  />;
    }else if(menuId=='publicHeader'){
      content=<ListHeaderCode  />;
    }else if(menuId=='masterData'){
      content=<ListMasterData  />;
    }else if(menuId=='mockData'){
      content=<ListMockData  />;
    }else if(menuId=='serverHost'){
      content=<ListServices  />;
    }else if(menuId=='ListBuinessDomain'){
      content=<ListBuinessDomain  />;
    }else if(menuId=='apitags'){
      content=<ListApiTags  />;
    }

    content=<span>
        <div style={{ margin: '2px 0 2px 0 ', padding: 15,  }}>
          <Breadcrumb style={{margin:'0 0 0 10px'}}>
             {this.menuPath.map((item)=>{
               return <Breadcrumb.Item key={item} >{item}</Breadcrumb.Item>;
             })}
           </Breadcrumb>
         </div>
         <Content style={{ minHeight:'600px',margin: '1px 16px', padding:'15px 24px 2px 24px', background: '#fff' }}>
           {content}
         </Content>
     </span>;

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
              <Sider
                trigger={null}
                width={this.state.leftMenuWidth}
                collapsible
                collapsed={this.state.collapsed}
                className="title-menu-min-w"
                style={{background:URI.Theme.leftLayoutBackground,overflow: 'auto',height:'100vh',position: 'fixed',left: 0}}
              >
                <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout  style={{ marginLeft: this.state.leftMenuWidth }}>
                {content}
              </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default ApplicationLayout;
