import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Dropdown,Menu,Icon} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;

class CreateTableEditSQLCode extends React.Component{
  constructor(props){
    super(props);
    this.code=this.props.code; //显示代码
    this.getCreateTableSql=this.props.getCreateTableSql;
    this.codeUrl="/res/ace/eventcode.html?codeType="+(this.props.codeType||'sql');
    this.state={
      mask:false,
      visible:false,
      action:'',
      branchname:'',
      commitInfo:'',
    };
  }

  componentDidMount(){

  }

  setCode=(code)=>{
    if(code===undefined || code===''){code=this.code;}
    let mframe =this.refs.myframe;
    if(code===undefined){return;}
    mframe.contentWindow.setCode(code);
    mframe.contentWindow.saveEventCode=this.saveCode;
  }

  getCode=()=>{
    let mframe =this.refs.myframe;
    return mframe.contentWindow.editor.getValue();
  }

  setCodeValue=(value)=>{
    if(this.code===undefined){return;}
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(value);
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div style={{margin:'0 0 5px 0',padding:'5px',border:'solid 1px #ccc',borderRadius:'5px'}}>
            <ButtonGroup>
              <Button icon='profile' type='primary' onClick={this.getCreateTableSql}>生成建表SQL语句</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'450px',width:'100%',border:'none'}}/>
          </div>
      </Spin>
    );
  }
}

export default CreateTableEditSQLCode;
