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
    let helpInfo='提示:使用${lastStartTime},${lastEndTime}获取流程最后一次运行开始和结束时间(格式为:yyyy-MM-dd HH:mm:ss),使用${局部|全局|http变量Id},${$config.公共变量Id}可以引用变量,系统默认使用游标分页对于大数据量读取请使用SQL分页，SQL分页支持:${beginRow},${endRow},${pageSize}三个变量可在SQL中使用';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div style={{margin:'0 0 5px 0',padding:'5px',border:'solid 1px #ccc',borderRadius:'5px'}}>
            <ButtonGroup>
              <Button icon='profile' type='primary' onClick={this.getSelectSql}>生成SQL语句</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px',overflow:'hidden'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'460px',width:'100%',border:'none'}}/>
          </div>
          {helpInfo}
      </Spin>
    );
  }
}

export default EditSQLCode;
