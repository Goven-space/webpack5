import React from 'react';
import ReactDOM from 'react-dom';
import {Menu,Dropdown,Icon,Button,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ParseCloumsFromText from './ParseCloumsFromText';

const ButtonGroup = Button.Group;

//节点中的字段配置列操作组件

class CloumnsFieldAction extends React.Component {
  constructor(props){
    super(props);
    this.thisobj=this.props.thisobj;
    this.state = {
      visible:false,
    }
  }

  // componentWillReceiveProps=(nextProps)=>{
  //   this.thisobj=nextProps.thisobj;
  // }

  buttonClick=(e)=>{
    if(e.key=="clear"){
      this.thisobj.setState({data:[]});
    }else{
      //说明是导入字段
      this.setState({visible:true});
    }
  }

  handleCancel=(reLoadFlag)=>{
      this.setState({visible: false});
  }

  render() {
    const {data} = this.state;
    const importmenu = (
      <Menu onClick={this.buttonClick} >
        <Menu.Item key="importText" >导入或拷贝字段配置</Menu.Item>
        <Menu.Item key="clear">清空所有字段配置</Menu.Item>
      </Menu>
    );

    return (
      <span>
            <Modal key={Math.random()} title='导入或拷贝字段' maskClosable={false}
                  width='900px'
                  style={{ top: 45 }}
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  footer=''
                  >
                  <ParseCloumsFromText  closeTab={this.handleCancel} thisobj={this.thisobj} />
            </Modal>
            <ButtonGroup>
             <Dropdown overlay={importmenu} >
                    <Button icon="setting" >
                      字段操作<Icon type="down" />
                    </Button>
             </Dropdown>
           </ButtonGroup>
       </span>
        );
  }

}

export default CloumnsFieldAction;
