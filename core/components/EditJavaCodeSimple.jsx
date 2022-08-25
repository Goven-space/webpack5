import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Menu,Icon,Dropdown} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import SelectTemplateCode from './SelectTemplateCode';
import ListCommitHistorySelect from './ListCommitHistorySelect';

const ButtonGroup = Button.Group;
const getTemplateCode=URI.CORE_CODEREPOSITORY.getTemplateCode;
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;
const saveDataUrl=URI.CORE_CODEREPOSITORY.save;
const confirm = Modal.confirm;
const getByBeanIdUrl=URI.LIST_CORE_BEANS.getByBeanId;
const compileCheckUrl=URI.CORE_CODEREPOSITORY.compileCheck;
const readCodeUrl=URI.CORE_CODEREPOSITORY.readCodeClassPath;
const overCodeUrl=URI.CORE_CODEREPOSITORY.overCodeClassPath;

const checkoutUrl=URI.CORE_CODEREPOSITORY.checkOutUrl;
const commitUrl=URI.CORE_CODEREPOSITORY.commitUrl;
const getBranchnameUrl=URI.CORE_CODEREPOSITORY.getBranchnameUrl;

class EditJavaCodeSimple extends React.Component{
  constructor(props){
    super(props);
    this.saveEditCode=this.props.saveEditCode; //代码保存方法
    this.record=this.props.record; //本代码所在记录对象,会通过saveEditCode传回给父级组件
    this.code=this.props.code; //显示代码
    this.beanId=this.props.beanId||this.record.classPath; //要进行变量替换的beanId,如果没有可以不用传入
    this.codeType=this.props.codeType||"java"; //代码类型
    this.templateType=this.props.templateType; //模板类型
    this.codeUrl=webappsProjectName+"/res/ace/eventcode.html?codeType="+this.codeType;
    this.state={
      mask:false,
      visible:false,
      action:'showSelectTemplateCode',
    };
  }

  componentDidMount(){
  }

  getCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    return code;
  }

  saveCode=()=>{
    let code=this.getCode();
    let classPath=this.getClassPath(code);
    this.saveEditCode(classPath,code,this.record,true);
  }

  showError=(msg)=>{
    Modal.error({
      title: '编译错误',
      content: (<div dangerouslySetInnerHTML={{__html:msg}} ></div>),
      width:600,
    });
  }

  saveCompile=()=>{
    let code=this.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:true});
    AjaxUtils.post(compileCheckUrl,{classPath:classPath,code:code},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          let msg=decodeURIComponent(data.msg);
          this.showError(msg);
        }else{
          AjaxUtils.showInfo("编译成功!");
          this.saveEditCode(classPath,code,this.record,false);
        }
    });
  }

  setCode=()=>{
    if(this.code===undefined){return;}
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(this.code);
    mframe.contentWindow.saveEventCode=this.saveCode;
  }

  setCodeValue=(value)=>{
    if(this.code===undefined){return;}
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(value);
  }

  showInfo=(msg)=>{
    Modal.info({
      title: '提示消息',
      content: (msg),
      width:600,
    });
  }

  showError=(msg)=>{
    Modal.error({
      title: '编译错误',
      content: (<div dangerouslySetInnerHTML={{__html:msg}} ></div>),
      width:600,
    });
  }

  //选择ok后执行模板代码获取，并设置到编辑器中去
  closeModal=(templateId)=>{
      this.setState({visible: false});
      if(templateId===undefined || templateId===''){return;}
      let url=getTemplateCode+"?beanId="+this.beanId+"&templateId="+templateId;
      // console.log("url="+url);
      this.setState({mask:false});
      AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let mframe =this.refs.myframe;
          mframe.contentWindow.setCodeValue(data.code);
        }
      });
  }

  //选择提交代码的历史记录后的ok后从提交记录中获取代码
  closeCommitHistoryCodeModal=(id)=>{
      this.setState({visible: false});
      if(id===undefined || id===''){return;}
      let url=getCommitHistoryCode+"?id="+id;
      this.setState({mask:false});
      AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let mframe =this.refs.myframe;
          mframe.contentWindow.setCode(data.commitCode);
        }
      });
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

  getClassPath=(code)=>{
    //先获得包名
    let startStr="package ";
    let endpos=code.indexOf(";");
    let spos=code.indexOf(startStr);
    let packageName=code.substring(spos+startStr.length,endpos).trim();

    startStr="public class ";
    endpos=code.indexOf(" implements");
    spos=code.indexOf(startStr);
    let className=code.substring(spos+startStr.length,endpos).trim();
    let classPath=packageName+"."+className;
    return classPath;
  }

  overFileCode=()=>{
    let code=this.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:false});
    AjaxUtils.post(overCodeUrl,{code:code,classPath:classPath},(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showConfirm("覆盖成功",data.msg);
      }
    });
  }

  readFileCode=()=>{
    let code=this.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:false});
    let url=readCodeUrl+"?classPath="+classPath;
    AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        mframe.contentWindow.setCode("");
        mframe.contentWindow.insertCode(data.code);
        AjaxUtils.showInfo("读取成功!");
      }
    });
  }




    //与代码仓库中进行代码同步
    readCode=(e)=>{
      let key=e.key;
      if(key==='ReadFromLocalProject'){
         this.readFileCode();
      }else if(key==='ReadFromRepository'){
        this.readFromRepository(true); //读取代码仓库中的最新版本
      }else if(key==='ReadFromLocalRepository'){
        this.readFromRepository(false); //读取代码仓库中的最新版本
      }else if(key==='CommitToLocalProject'){
        AjaxUtils.showConfirm("覆盖确认","确定覆盖本地工程中的源文件吗?",this.overFileCode);
      }else if(key==='CommitToRepository'){
          this.setState({visible: true,action:'CommitToRepository'});
      }else if(key==='CommitToLocalRepository'){
          this.setState({visible: true,action:'CommitToLocalRepository'});
      }
    }
    commitInputChange=(e)=>{
      this.state.commitInfo=e.target.value;
    }

    //从仓库读取代码
    readFromRepository=(remote)=>{
      let msg="同步本地代码仓库中的最新版本吗?";
      if(remote){msg="从远程代码仓库中读取将会把本地文件更新到最新版本?";}
      AjaxUtils.showConfirm("更新代码确认",msg,()=>{
        let url=checkoutUrl+"?configId="+this.beanId+"&codeType=java&remote="+remote;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state==false){AjaxUtils.showConfirm('读取错误',data.msg);return;}
          this.setCodeValue(data.code);
          AjaxUtils.showInfo("代码已更新到版本 "+data.version);
        })
      });
    }
    //提交代码到仓库
    commitToRepository=(e)=>{
      this.setState({mask:true,visible: false});
      let remote=this.state.action==='CommitToRepository'?true:false;
      AjaxUtils.post(commitUrl,{configId:this.beanId,remote:remote,codeType:'java',code:this.getCode,msg:this.state.commitInfo},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showConfirm("提交错误",data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
        }
      });
    }
    //获取git当前的分支名称
     getBranchName=()=>{
       AjaxUtils.get(getBranchnameUrl,(data)=>{
         this.setState({branchname:data.msg});
       });
     }


  render() {
    let modalForm;
    let modalTitle="";
    if(this.state.action==='showCommitHistory'){
      modalTitle="提交历史记录";
      modalForm=<ListCommitHistorySelect  configId={this.record.id} close={this.closeCommitHistoryCodeModal} />;
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
    const checkoutMenu = (
      <Menu onClick={this.readCode}>
        <Menu.Item key="ReadFromLocalProject"><Icon type="profile" />{' '}从本地工程文件中读取源码</Menu.Item>
        <Menu.Item key="ReadFromRepository"><Icon type="download" />{' '}同步远程代码仓库中的最新版本</Menu.Item>
        <Menu.Item key="ReadFromLocalRepository"><Icon type="download" />{' '}同步本地代码仓库中的最新版本</Menu.Item>
        <Menu.Item key="CommitToRepository"><Icon type="cloud-upload" />{' '}覆盖并Commit代码到远程仓库中</Menu.Item>
        <Menu.Item key="CommitToLocalRepository"><Icon type="cloud-upload" />{' '}覆盖并Commit代码到本地仓库中</Menu.Item>
        <Menu.Item key="CommitToLocalProject"><Icon type="thunderbolt" />{' '}覆盖本地工程文件中的源码</Menu.Item>
      </Menu>
    );
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
              <Button type="primary" icon='save' onClick={this.saveCode}>保存(Ctr+S)</Button>
              <Button icon='check-circle-o' onClick={this.saveCompile}>编译代码</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode} src={this.codeUrl} style={{minHeight:'600px',width:'100%',border:'none'}}/>
          </div>
      </Spin>
    );
  }
}

export default EditJavaCodeSimple;
