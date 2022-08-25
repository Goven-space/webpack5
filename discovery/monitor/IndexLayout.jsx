import React from 'react';
import { Layout,Menu,Icon,Input } from 'antd';
import TopMenu from '../homepage/TopMenu';
import PageFooter from '../../core/components/PageFooter';
import Homepage from './Homepage';
import ListReportServer from '../server/grid/ListReportServer';
import ListActiveServer from './grid/ListActiveServer';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
  this.state={
      key:'home',
    }
  }

  handleClick=(e)=>{
    this.setState({key:e.key});
  }


  render(){
    let content=<Homepage />;
    let key=this.state.key;
    if(key==='servers'){
      content=<ListActiveServer />;
    }else if(key==='avgper'){
      content=<ListReportServer />;
    }

    return (
     <Layout style={{ background: '#fff'}} >
        <Header style={{backgroundColor:'#ffffff',height:'79px'}} >
          <TopMenu/>
        </Header>
        <div style={{background: '#ECECEC', padding: '25px 40px',width:'100%'}} >
          <Layout style={{ background: '#fff',padding:'20px', minHeight: 560}} >
              <Sider style={{ background: '#fff'}} >
                <Menu onClick={this.handleClick}
                  defaultOpenKeys={['monitor']}
                  selectedKeys={[this.state.key]}
                  mode="inline"
                >
                  <SubMenu key="monitor" title={<span><Icon type="appstore" />监控中心</span>}>
                    <Menu.Item key='home'>home</Menu.Item>
                    <Menu.Item key='servers'>所有服务实例</Menu.Item>
                    <Menu.Item key='avgper'>平均性能统计</Menu.Item>
                  </SubMenu>
                </Menu>
              </Sider>
              <Content  style={{left:'-1px',minHeight:'500px',padding: '0 5px',borderLeft:'1px solid #e9e9e9',position:'relative'}}  >
                {content}
              </Content>
          </Layout>
        </div>
        <Footer style={{  padding: 15, minHeight: 90,background: '#ECECEC' }} >
          <PageFooter />
        </Footer>

      </Layout>);
  }
}

export default IndexLayout;
