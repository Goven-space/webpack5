import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import PageFooter from '../components/PageFooter';
import ListDataSource from './grid/ListDataSource';
import LeftMenu from './LeftMenu';
import RightHome from './RightHome';
import ListAppServiceCategoryNode from '../../designer/ServiceCategory/grid/ListAppServiceCategoryNode';
import NewMongoDataSource from './form/NewMongoDataSource';
import NewElasticsearch from './form/NewElasticsearch';
import NewHBaseDataSource from './form/NewHBaseDataSource';
import NewKafkaDataSource from './form/NewKafkaDataSource';
import NewRedisDataSource from './form/NewRedisDataSource';
import NewRdbsDataSource from './form/NewRdbsDataSource';
import NewJdbcDriverDataSource from './form/NewJdbcDriverDataSource';
import NewMqttDataSource from './form/NewMqttDataSource';
import NewSapConn from './form/NewSapConn';
import ListDataSourceMonitor from '../../mqbus/grid/ListMqSubscribe';
import UserProfile from '../../portal/UserProfile';
import NewJmsDataSource from './form/NewJmsDataSource';
import NewRabbitMQDatasource from './form/NewRabbitMQDataSource';

//daas产品布局
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='core';
    this.state={
        key:'AllDataSourceList',
        mask:true,
        collapsed: false,
        menuId:'AllDataSourceList',
        reload:true,
        categoryId:'all',
        menuNodeObj:{},
        leftMenuWidth:200,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo((data)=>{
      if(data.modules===undefined || data.modules.indexOf("ds")!==-1){
        this.setState({mask: false});
      }
    });
  }

  toggle = () => {
      this.setState({
        collapsed: !this.state.collapsed,
        leftMenuWidth:this.state.collapsed?200:75,
      });
  }

  getTime=()=>{
    let show_day=new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六');
    let today=new Date();
    let year=today.getFullYear();
    let month=today.getMonth();
    let date=today.getDate();
    let day=today.getDay();
    let now_time=(month+1)+'月'+date+'日'+' '+show_day[day]+' ';
    return now_time;
  }

  //左则菜单子组件中点击执行本函数
  handleClick=(key)=>{
    this.setState({menuId:key,categoryId:key});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }else if(key==='Import'){
      this.setState({visible:true});
    }else if(key==='profile'){
      this.setState({menuId:'UserProfile'});//切换服务器
    }
  }

 close=()=>{
   this.setState({menuId:'new'});
 }

  render(){
    let content;
    let menuId=this.state.menuId;
    let menuItemArray=menuId.split("#");
    menuId=menuItemArray[0];
    let nodeName=menuItemArray[1];
    let title="";
    if(menuId==='new'){
      title='新增数据源';
      content=<RightHome  memuClick={this.handleClick} categoryId={this.state.categoryId} appId={this.appId} />;
    }else if(menuId==='AllDataSourceList'){
      title='数据源管理/所有数据源';
      content=<ListDataSource  appId={this.appId} categoryId='all' memuClick={this.handleClick} />
    }else if(menuId==='dataSourceCategory'){
      title='数据源管理/分类设置';
      content=<ListAppServiceCategoryNode appId={this.appId}  categoryId={this.appId+'.dataSourceCategory'} id='' />;
    }else if(menuId==='mongodb'){
      title='数据源管理/'+nodeName;
      content=<Card title="MongoDB数据源配置"><NewMongoDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='elasticsearch'){
      title='数据源管理/'+nodeName;
      content=<Card title="Elasticsearch数据源配置"><NewElasticsearch appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='kafka'){
      title='数据源管理/'+nodeName;
      content=<Card title="Kafka数据源配置"><NewKafkaDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='redis'){
      title='数据源管理/'+nodeName;
      content=<Card title="Redis数据源配置"><NewRedisDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='hbase'){
      title='数据源管理/'+nodeName;
      content=<Card title="HBase数据源配置"><NewHBaseDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='jdbcpool'){
      title='数据源管理/'+nodeName;
      content=<Card title="Rdbs链接池配置"><NewRdbsDataSource appId={this.appId} close={this.close}   id='' /></Card>;
    }else if(menuId==='jdbcdriver'){
      title='数据源管理/'+nodeName;
      content=<Card title="Rdbs直接链接配置"><NewJdbcDriverDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='mqtt'){
      title='数据源管理/'+nodeName;
      content=<Card title="MQTT链接配置"><NewMqttDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='sap'){
      title='数据源管理/'+nodeName;
      content=<Card title="SAP链接配置"><NewSapConn appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='jms'){
      title='数据源管理/'+nodeName;
      content=<Card title="JMS链接配置"><NewJmsDataSource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='rabbitmq'){
      title='数据源管理/'+nodeName;
      content=<Card title="RabbitMQ链接配置"><NewRabbitMQDatasource appId={this.appId} close={this.close}  id='' /></Card>;
    }else if(menuId==='monitor'){
      title='数据源管理/数据听监器';
      content=<ListDataSourceMonitor appId={this.appId} />;
    }else if(menuId==='UserProfile'){
      title="数据源管理/帐号信息";
      content=<UserProfile />;
    }else{
      title='数据源管理/'+nodeName;
      content=<ListDataSource appId={this.appId} categoryId={menuId}  memuClick={this.handleClick}  />;
    }
    this.menuPath=title.split("/");


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
                className="title-menu-min"
                style={{background:URI.Theme.leftLayoutBackground,overflow: 'auto',height: '100vh',position: 'fixed',left: 0}}
              >
              <div style={{height:'64px'}}>
                <div className={URI.Theme.logoClass} />
              </div>
              <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout style={{ marginLeft: this.state.leftMenuWidth }} >
                <Header style={{padding:0,background:URI.Theme.topLayoutBackground}} >
                  <Icon
                    className={URI.Theme.monitorTrigger}
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                  <span dangerouslySetInnerHTML={{__html:AjaxUtils.getEnvironmentInfo()}}  style={{height:'60px',color:URI.Theme.userInfoColor}}></span>
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                      <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                      <span className={URI.Theme.topHeaderButton} onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                 </div>
                 <div  style={{padding:0,margin:'0 20px 0 0',float:'right',fontSize:'12px',color:URI.Theme.userInfoColor}}>
                        <Avatar src={URI.userAvatarUrl}  size="small" style={{ backgroundColor: '#7265e6' }}  />{' '}
                        <Popover content={URI.currentServerHost} title="当前服务器">
                           <span onClick={this.topMenuClick.bind(this,'profile')} style={{cursor:'pointer'}}>{this.state.userInfo}</span>
                        </Popover>{' '}
                  </div>
                </Header>
                {content}
                <Footer style={{  padding: 15, minHeight: 90,background: '#f0f2f5' }} >
                  <PageFooter />
                </Footer>
              </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default IndexLayout;
