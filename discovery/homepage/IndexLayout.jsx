import React from 'react';
import { Layout,Menu,Icon,Input } from 'antd';
import TopMenu from './TopMenu';
import PageFooter from '../../core/components/PageFooter';
import SiderMenu from './SiderMenu';

const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    // window.document.title="服务注册及配置中心";
  }
  render(){
    return (
     <Layout style={{ background: '#fff'}} >
        <Header style={{backgroundColor:'#ffffff',height:'79px'}} >
          <TopMenu/>
        </Header>
        <div style={{background: '#ECECEC', padding: '25px 40px',width:'100%'}} >
          <Layout style={{ background: '#fff',padding:'20px', minHeight: 560}} >
              <Sider style={{ background: '#fff'}} >
                <SiderMenu/>
              </Sider>
              <Content  style={{left:'-1px',minHeight:'550px',padding: '0 20px',borderLeft:'1px solid #e9e9e9',position:'relative'}}  >
                {this.props.children}
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
