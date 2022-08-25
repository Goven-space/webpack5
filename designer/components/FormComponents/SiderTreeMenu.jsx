import React from 'react';
import ReactDOM from 'react-dom';
import {Tree} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const TreeNode = Tree.TreeNode;

//部门选择异步模式
class SiderTreeMenu extends React.Component {
  constructor(props){
    super(props);
    this.url=this.props.url;
    this.option=this.props.options||{};
    this.nodeTextId=this.props.label||"label";
    this.nodeValueId=this.props.key||"key";
    this.defaultSelectedKeys=this.props.defaultSelectedKeys||['home'];
    this.state = {
      treeData:[],
    }
  }

  componentDidMount=()=>{
    //发送ajax请求
    AjaxUtils.get(this.url,(data)=>{this.setState({treeData:data});});
  }

  reload=()=>{
    AjaxUtils.get(this.url,(data)=>{
      this.setState({treeData:data});
    });
  }

  onTreeSelect=(selectedKeys)=>{
    if(selectedKeys!==''){
      this.props.onMenuSelected(selectedKeys);
    }
  }

  render() {


    const loop = data => data.map((item) => {
        if (item.children) {
          let title=item[this.nodeTextId];
          if(item.serviceCount!==undefined && item.serviceCount!=='0'){
            title=title+"("+item.serviceCount+")";
          }
          return <TreeNode title={title} key={item[this.nodeValueId]}>{loop(item.children)}</TreeNode>;
        }
        let title=item[this.nodeTextId];
        if(item.serviceCount!==undefined && item.serviceCount!=='0'){
            title=title+"("+item.serviceCount+")";
        }
        return <TreeNode title={title} key={item[this.nodeValueId]} isLeaf={item.isLeaf}  />;
    });

    const treeNodes = loop(this.state.treeData);

    return (
          <Tree
              {...this.option}
              showLine={false}
              onSelect={this.onTreeSelect}
              defaultExpandedKeys={['root']}
              defaultSelectedKeys={this.defaultSelectedKeys}
              style={{margin:0,padding:0}} width={160}
          >
           {treeNodes}
          </Tree>
        );
  }

}

export default SiderTreeMenu;
