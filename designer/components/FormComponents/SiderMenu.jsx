import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class SiderMenu extends React.Component{
  constructor(props){
    super(props);
    this.url=this.props.url;
    this.countFieldId=this.props.countFieldId||"count";
    this.onMenuSelected=this.props.onMenuSelected;
    this.current=this.props.current||"Home";
    this.state={
      mask:false,
      data:[],
      current: this.current,
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    AjaxUtils.get(this.url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  reload=()=>{
    this.loadData();
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.onMenuSelected([e.key]);
  }

  render() {
    const loop = data => data.map((item) => {
        if (item.children!==undefined) {
          return <SubMenu key={item.key} title={<span><Icon type="appstore" />{item.label}</span>} >{loop(item.children)}</SubMenu>;
        }
        if(item[this.countFieldId]!==undefined){
          return <Menu.Item key={item.key} title={item.label} >{item.label}
            (<span style={{color:'blue'}} >{item[this.countFieldId]}</span>)
          </Menu.Item>;
        }else{
          return <Menu.Item key={item.key} >{item.label}</Menu.Item>;
        }
    });
    const menus = loop(this.state.data);

    return (
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['root']}
        selectedKeys={[this.state.current]}
        mode="inline"
        inlineIndent='16'
      >
        {menus}
      </Menu>
    );
  }
}

export default SiderMenu;
