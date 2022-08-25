import React from 'react';
import ReactDOM from 'react-dom';
import {Tree} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';

const loadTreeJsonUrl=URI.CORE_ORG_DEPT.treeJsonByDeptId;
const TreeNode = Tree.TreeNode;

//部门选择异步模式
class DeptAsynTree extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      treeData:[],
    }
  }

  componentDidMount=()=>{
        //发送ajax请求
        AjaxUtils.get(loadTreeJsonUrl,(data)=>{this.setState({treeData:data});});
  }

  loadTreeData=(treeNode)=>{
    const treeData = [...this.state.treeData];
    let curKey=treeNode.props.eventKey;
    let url=loadTreeJsonUrl+"?deptCode="+curKey;
    let i=0;
    const loop = (curTreeData,newChildrenData) => {
      curTreeData.forEach((item) => {
        if (curKey===item.key) {
          item.children = newChildrenData; //找到当前点击的节点后加入子节点数据进去
          return;
        }else if (item.children) {
          //没有找到时如果当前节点还子节点再往下找子节点
          loop(item.children,newChildrenData);
        }
      });
    };

    return new Promise((resolve) => {
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            loop(treeData,data);
            this.setState({ treeData });
          }
          resolve();
      });
    });
  }

  render() {
    const value=this.props.value;
    const option=this.props.options||{};

    const loop = data => data.map((item) => {
        if (item.children) {
          return <TreeNode title={item.label} key={item.key}>{loop(item.children)}</TreeNode>;
        }
        return <TreeNode title={item.label} key={item.key} isLeaf={item.isLeaf} />;
    });

    const treeNodes = loop(this.state.treeData);

    return (
          <Tree
              {...option}
              onSelect={this.props.onSelect}
              loadData={this.loadTreeData}
              defaultExpandAll={true}
          >
           {treeNodes}
          </Tree>
        );
  }

}

export default DeptAsynTree;
