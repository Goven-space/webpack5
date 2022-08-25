import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import PageFooter from '../../../core/components/PublicPageFooter';
import LeftMenu from './LeftMenu';
import ListApiByApprover from '../../grid/ListApiByApprover';
import ListApiByAppyUser from '../../grid/ListApiByAppyUser';
import ListApiByRequireAppy from '../../grid/ListApiByRequireAppy';

//API审核

const isAdminUrl=URI.LIST_APIPORTAL_APPLICATION.isAdminUrl;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;


class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.menuPath=['API注册'];
    this.state={
        key:'home',
        mask:false,
        collapsed: false,
        menuId:'todolist',
        reload:true,
        leftMenuWidth:200,
        nodeName:'待我审批的API'
      }
  }

  componentDidMount(){
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key,text)=>{
    this.setState({menuId:key,nodeName:text});
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    let nodeName=this.state.nodeName;
    this.menuPath=['API审核',nodeName];
    if(menuId=='todolist'){
      content=<ListApiByApprover status='0' />;
    }else if(menuId=='passedlist'){
      content=<ListApiByApprover  status='1' />;
    }else if(menuId=='rejectedlist'){
      content=<ListApiByApprover status='2' />;
    }else if(menuId=='my_approveing'){
      content=<ListApiByAppyUser status='0' />;
    }else if(menuId=='my_passedlist'){
      content=<ListApiByAppyUser status='1' />;
    }else if(menuId=='my_rejectedlist'){
      content=<ListApiByAppyUser status='2' />;
    }else if(menuId=='my_overduelist'){
      content=<ListApiByAppyUser status='3' />;
    }else if(menuId=='approverApis'){
      content=<ListApiByRequireAppy categoryId='' appId='' />;
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

export default IndexLayout;
