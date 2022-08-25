import React from 'react';
import { Input,Card,Popover,Tooltip} from 'antd';
import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');

//SQL类节点中字段列配置的事件编辑器

class ColumnEventCode extends React.Component {
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.index=this.props.index;
    this.updateEvnetCode=this.props.updateEvnetCode;
    this.title=this.props.title;
    this.state={
      data:this.record,
    };
  }

  componentDidMount(){

  }

  insertEventCode=(type=1)=>{
      let code="";
      if(type===1){
        code=`//rowdoc为当前行记录数据,fieldId为当前字段的id,fdValue为当前字段的字符串值
function run(rowdoc,fieldId,fdValue,engine){
    if(fdValue=="1"){
      fdValue="男";
     }else{
       fdValue="女";
     }
     return fdValue;
}
`
}else if(type==3){
  code=`//rowdoc为当前行记录数据,fieldId为当前字段的id,fdValue为当前字段的字符串值
function run(rowdoc,fieldId,fdValue,engine){
  return "返回一个固定值";
}
`
}else if(type==4){
  code=`//rowdoc为当前行记录数据,fieldId为当前字段的id,fdValue为当前字段的字符串值
function run(rowdoc,fieldId,fdValue,engine){
  var nowDateTime=DateTimeUtil.getNow("yyyy-MM-dd HH:mm:ss");
  return nowDateTime;
}
`
}else if(type==5){
  code=`//rowdoc为当前行记录数据,fieldId为当前字段的id,fdValue为当前字段的字符串值
function run(rowdoc,fieldId,fdValue,engine){
  var value=engine.get("变量Id");
  return value;
}
`
}else if(type==2){
          code=`//rowdoc为当前行记录数据,fieldId为当前字段的id,fdValue为当前字段的字符串值
function run(rowdoc,fieldId,fdValue,engine){
    var userId=DocumentUtil.getString(rowdoc,"userId"); //获取当前行记录中字段userId的值
    var sql="select userName from users where userId='"+userId+"'";//组合成一个sql查询语句
    var tmpdoc=RdbUtil.getDoc(RdbUtil.getConnection("数据源id"),sql); //执行sql从数据源中获取数据
    var userName=DocumentUtil.getString(tmpdoc,"userName"); //获取sql执行结果的返回值
    return userName;
}`;
      }
      let codeMirror=this.refs.codeMirror.getCodeMirror();
      codeMirror.setValue(code);
      this.updateEvnetCode(this.index,code);
  }

  onChange=(newCode)=>{
    this.updateEvnetCode(this.index,newCode);
  }

  render() {
    return (
      <div>
          <div style={{border:'1px #cccccc solid',minHeight:'200px',margin:'2px',borderRadius:'0px'}}>
            <CodeMirror ref='codeMirror'
            value={this.state.data.eventCode}
            onChange={this.onChange}
            options={{lineNumbers: true,mode: 'javascript',autoMatchParens:true}}
            />
        </div>
        <div>代码示例:{' '}
           <a onClick={this.insertEventCode.bind(this,1)}>格式化值</a>&nbsp;
           <a onClick={this.insertEventCode.bind(this,2)}>执行SQL</a>&nbsp;
           <a onClick={this.insertEventCode.bind(this,3)}>设置固定值</a>&nbsp;
           <a onClick={this.insertEventCode.bind(this,4)}>获取当前时间</a>&nbsp;
           <a onClick={this.insertEventCode.bind(this,5)}>获取全局变量</a>&nbsp;
          </div>
      </div>
    );
  }
}

export default ColumnEventCode;
