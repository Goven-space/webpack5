import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin,Tooltip,Tree} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//etl左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.BPM.CORE_BPM_NODETEMPLATE.listSelect;
const { TreeNode } = Tree;

class ProcessDesignerLeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.nodeMenuClick=this.props.menuClick;
    this.state={
        mask:true,
        menuId:'home',
        menuNodeObj:{},
        menuData:[],
        openKeys:[],
        selectedKeys:this.props.selectedKeys,
      }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.state.selectedKeys!==undefined && this.state.selectedKeys[0]!==nextProps.selectedKeys[0]){
      this.setState({selectedKeys:nextProps.selectedKeys});
    }
  }

  onOpenChange = openKeys => {
      let rootSubmenuKeys=[];
      for(let i=0;i<this.state.menuData.length;i++){
        rootSubmenuKeys[i]=this.state.menuData[i].key;
      }
      const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
      if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.setState({ openKeys });
      } else {
        this.setState({
          openKeys: latestOpenKey ? [latestOpenKey] : [],
        });
      }
    };

    onSelect=(selectedKeys, info)=>{

      let key=selectedKeys[0];
      let nodeType="";
      let templateId="";
      let nodeName="";
      let nodeText="";
      let nodeStyle="";
      //根据点击的菜单看是否点击的是自定义的模板
      let menuNodeObj; //用户点击的菜单对像
      let findFlag=false;
      let menuItems=this.state.menuData;
      for(let i=0;i<menuItems.length;i++){
        menuNodeObj=this.getMenuObj(menuItems[i],key);
        if(menuNodeObj!==false){
          findFlag=true;
          break;
        }
        if(findFlag){break;}
      }
      nodeType=menuNodeObj.nodeType;
      templateId=menuNodeObj.templateId;//只有自定义节点才会有templateId
      nodeText=menuNodeObj.nodeText; //节点拉过去时直接显示节点的名称
      nodeStyle=menuNodeObj.nodeStyle; //创建节点时的默认css样式
      if(menuNodeObj.parentNodeId!=='root'){
        this.nodeMenuClick(nodeType,templateId,nodeText,nodeStyle);
        this.setState({selectedKeys:[menuNodeObj.key]});
      }
    }

    getMenuObj=(menuItem,key)=>{
      let mainMenuObj=false;
      let findFlag=(menuItem.key===key);
      //console.log(menuItem.id+"==="+key+" =>"+findFlag);
      if(findFlag===true){
        //console.log("找到菜单="+menuItem);
        mainMenuObj=menuItem;
      }else if(menuItem.children!==null && menuItem.children!==undefined){
        for(let j=0;j<menuItem.children.length;j++){
          let menuObj=this.getMenuObj(menuItem.children[j],key);
          if(menuObj!==false){
            mainMenuObj=menuObj;
            break;
          }
        }
      }
      //console.log(mainMenuObj);
      return mainMenuObj;
    }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?categoryId=";
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data});
        }
    });
  }


  render(){
    const loop = data => data.map((item) => {
        if (item.children!==null && item.children!==undefined) {
          return <TreeNode title={<span style={{fontSize:'13px'}}  >{item.nodeName}</span>}  key={item.key}>{loop(item.children)}</TreeNode>;
        }else{
          let icon="profile";
          if(item.key==='start'){icon="play-circle";}
          if(item.key==='end'){icon='minus-circle';}
          if(item.icon!==undefined && item.icon!==null){icon=item.icon;}
          let iconType=<Icon type={icon} style={{fontSize:'13px'}} />;
          return <TreeNode title={<Tooltip title={item.tip} placement="rightTop" ><span style={{fontSize:'13px'}}   >{item.nodeName}</span></Tooltip>} icon={iconType} key={item.key}></TreeNode>;
        }
    });
    let menus= loop(this.state.menuData);

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Tree
        defaultExpandedKeys={['processApiNode']}
        onSelect={this.onSelect}
        expandedKeys={this.state.openKeys}
        selectedKeys={this.state.selectedKeys}
        onExpand={this.onOpenChange}
        showIcon={true}
        showLine={false}
      >
            {menus}
      </Tree>
        </Spin>
    );
  }
}

export default ProcessDesignerLeftMenu;
