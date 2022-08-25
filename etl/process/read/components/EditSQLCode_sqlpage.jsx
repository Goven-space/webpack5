import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Dropdown,Menu,Icon,Divider} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import ListCommitHistorySelect from '../../../../core/components/ListCommitHistorySelect';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;

class EditSQLCode extends React.Component{
  constructor(props){
    super(props);
    this.code=this.props.code; //显示代码
    this.getSelectSql=this.props.getSelectSql; //用来生成sql语句
    this.codeUrl="/res/ace/eventcode.html?codeType=sql";
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

  //选择模板代码
  showSelectTemplateCode=()=>{
    this.setState({visible: true,action:'showSelectTemplateCode'});
  }

  showCommitHistory=()=>{
    this.setState({visible: true,action:'showCommitHistory'});
  }

  getSelectSQL=()=>{

  }

  inserDemoSql=(dbType)=>{
      let code="";
      if(dbType==='oracle'){
            code=`select * from (select t.*,rownum rn from(
        select * from 表名 a
) t where rownum<={endRow}) where rn>{beginRow}`;
      }else if(dbType==='mssql'){
        code=`select * from (
    select t.*,row_number() over(order by 主键) as RowNumber from 表名 as t
) a where RowNumber between {beginRow} and {endRow}`;
      }else if(dbType==='mysql'){
        code=`select  * from 表名 limit {beginRow},{pageSize}`;
      }
      // console.log(code);
      this.setCode(code);
}

  render() {
    let modalForm;
    let modalTitle="";
    if(this.state.action==='showCommitHistory'){
      modalTitle="提交历史记录";
      modalForm=<ListCommitHistorySelect  configId={this.id} close={this.closeCommitHistoryCodeModal} />;
    }else if(this.state.action==='CommitToRepository' || this.state.action==='CommitToLocalRepository'){
        modalTitle="提交代码到本地仓库";
        if(this.state.action==='CommitToRepository'){
          modalTitle="提交代码到远程仓库";
        }
        modalForm=<span>
        <b>当前分支:{this.state.branchname}</b>
        {' '}提交说明:<Input.TextArea autosize={{ minRows: 4, maxRows: 16 }} onChange={this.commitInputChange} ></Input.TextArea>
        <br/><br/><center><Button type="primary" icon='save' onClick={this.commitToRepository}>确定提交</Button></center>
        </span>;
    }
    let helpInfo='提示:使用${lastEndTime}获取本节点最后一次运行结束时间(yyyy-MM-dd HH:mm:ss),使用${变量}可以接收上一节点设置的变量';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
          visible={this.state.visible}
          width='850px'
          footer=''
          style={{top:'20px'}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          {modalForm}
          </Modal>
          <div style={{margin:'0 0 5px 0',padding:'5px',border:'solid 1px #ccc',borderRadius:'5px'}}>
            <ButtonGroup>
              <Button icon='profile' type='primary' onClick={this.getSelectSql}>生成SQL语句</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'450px',width:'100%',border:'none'}}/>
          </div>
          {helpInfo}
          <a style={{cursor:'pointer'}} onClick={this.inserDemoSql.bind(this,"oracle")}>Oracle分页示例</a> <Divider type="vertical" />{' '}
          <a style={{cursor:'pointer'}} onClick={this.inserDemoSql.bind(this,"mssql")}>SqlServer分页示例</a> <Divider type="vertical" />{' '}
          <a style={{cursor:'pointer'}} onClick={this.inserDemoSql.bind(this,"mysql")}>MySql分页示例</a> <Divider type="vertical" />{' '}
      </Spin>
    );
  }
}

export default EditSQLCode;
