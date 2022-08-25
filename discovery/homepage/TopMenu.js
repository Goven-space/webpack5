import React from 'react';
import { Menu, Icon,Input,Select,Row ,Col,Button,Avatar,Modal,Popover} from 'antd';
import { browserHistory } from 'react-router'
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as ContextActions from '../../core/utils/ContextUtils';
import * as URI from '../../core/constants/RESTURI';
import ChangeServer from '../../core/components/ChangeServer';

const Search = Input.Search;
const InputGroup = Input.Group;
const Option = Select.Option;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const basePath=URI.rootPath;
const homePageUrl=basePath+"/discovery";
const configUrl=basePath+"/config/center";
const settingUrl=basePath+"/discovery/setting"
const monitorUrl=basePath+"/monitor/center";
const DesignerHomePageUrl=basePath;

class TopMenu extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSelectedKeys=[homePageUrl];
    this.state={
      visible:false,
      userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
    }
  }

  menuClick=(e)=>{
    if(e.key==='logout'){
      AjaxUtils.logout();
    }else if(e.key==='changeServer'){
      this.setState({visible:true});//切换服务器
    }else{
      browserHistory.push(e.key);
    }
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
  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }
	render(){
    let url=window.location.href;
    let spos=url.indexOf(basePath);
    let key=url.substring(spos,url.length);
    this.defaultSelectedKeys=[key];

	  return (
       <div>
         <Modal key={Math.random()} title="切换服务器" maskClosable={false}
             visible={this.state.visible}
             footer=''
             width='760px'
             onOk={this.handleCancel}
             onCancel={this.handleCancel} >
             <ChangeServer close={this.handleCancel} />
         </Modal>
        <Row gutter={1}>
          <Col span={12} >
            <div style={{width:'222px',height:'80px',float:'left'}}>
              <div style={{float:'left'}}>
                <img src={URI.logoUrl} style={{paddingTop:10,verticalAlign:'-20%'}} />

              </div>
              <div style={{borderLeft:"1px solid #ebedee",position:'relative',height:"30px",float:'right',top:'30px'}} />
            </div>
            <div style={{float:'left',lineHeight:'80px',paddingLeft:'30px',color:'#ccc'}}>
              <Row>
                <Col span={2}>
                  <Avatar icon="user" size="small"  />
                </Col>
                <Col span={22} style={{paddingLeft:'20px'}} >
                  <Popover content={URI.currentServerHost} title="当前服务器">
                     {this.state.userInfo}
                  </Popover>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={12} style={{padding:0}} >
             <div   style={{float:'right',minWidth:'400px'}} >
        		  <Menu  mode="horizontal"
                defaultSelectedKeys={this.defaultSelectedKeys}
                style={{lineHeight:'78px',fontSize:'16px',padding:0}}
                onClick={this.menuClick}
              >
                    <Menu.Item key={homePageUrl}><Icon type="home" />注册中心</Menu.Item>
                    <Menu.Item key={configUrl}><Icon type="appstore-o" />配置中心</Menu.Item>
                    <Menu.Item key={monitorUrl}><Icon type="area-chart" />服务监控</Menu.Item>
                      <SubMenu title={<span><Icon type="setting" />设置</span>} >
                            <Menu.Item key={DesignerHomePageUrl} style={{fontSize:'14px'}} ><Icon type="home" />开发首页</Menu.Item>
                            <Menu.Item key={settingUrl} style={{fontSize:'14px'}} ><Icon type="setting" />系统设置</Menu.Item>
                            <Menu.Item key="changeServer" style={{fontSize:'14px'}} ><Icon type="retweet" />切换服务器</Menu.Item>
                            <Menu.Item key="logout" style={{fontSize:'14px'}} ><Icon type="logout" />退出系统</Menu.Item>
                      </SubMenu>
              </Menu>
            </div>
          </Col>
        </Row>

      </div>
		);
	 }
};

export default TopMenu;
