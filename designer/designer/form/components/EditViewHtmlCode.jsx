import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Dropdown,Menu,Icon} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import ListCommitHistorySelect from '../../../../core/components/ListCommitHistorySelect';
import ListTemplateCodeForSelect from '../../../designer/grid/ListTemplateCodeForSelect';

const ButtonGroup = Button.Group;
const getTemplateCode=URI.CORE_CODEREPOSITORY.getTemplateCode;
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;
const saveDataUrl=URI.CORE_CODEREPOSITORY.save;
const confirm = Modal.confirm;
const checkoutUrl=URI.CORE_CODEREPOSITORY.checkOutUrl;
const commitUrl=URI.CORE_CODEREPOSITORY.commitUrl;
const getBranchnameUrl=URI.CORE_CODEREPOSITORY.getBranchnameUrl;
const overCodeUrl=URI.CORE_CODEREPOSITORY.overCode;
const readCodeUrl=URI.CORE_CODEREPOSITORY.readCode;

class EditViewHtmlCode extends React.Component{
  constructor(props){
    super(props);
    this.saveData=this.props.saveData; //代码保存方法
    this.code=this.props.code; //显示代码
    this.record=this.props.record; //编辑的数据记录
    this.codeType=this.props.codeType; //代码类型
    this.templateType=this.props.templateType; //模板类型
    this.codeUrl=webappsProjectName+"/res/ace/eventcode.html?codeType="+this.codeType;
    this.state={
      mask:false,
      visible:false,
      action:'',
      branchname:'',
      commitInfo:'',
    };
  }

  componentDidMount(){
    this.getBranchName();
  }

  saveCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    this.saveData(this.record,code);
  }

  setCode=(code)=>{
    if(code===undefined || code===''){code=this.code;}
    let mframe =this.refs.myframe;
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
          mframe.contentWindow.setCode(data.code);
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

  //覆盖本地工程文件中的源码代码
	overFileCode=()=>{
		var url=overCodeUrl;
		var code=this.getCode();
    this.setState({mask:true,visible: false});
    AjaxUtils.post(url,{beanId:this.record.templateId,appId:this.record.appId,code:code,codeType:'html'},(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showConfirm("保存错误",data.msg);
      }else{
        AjaxUtils.showConfirm(data.msg);
      }
    });
	}

  //读取本地工程中的原码
  readFileCode=()=>{
    this.setState({mask:true,visible: false});
    let url=readCodeUrl+"?beanId="+this.record.templateId+"&appId="+this.record.appId+"&codeType=html";
    AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showConfirm("读取错误",data.msg);
      }else{
        AjaxUtils.showInfo("已成功读取");
        this.setCode(data.code);
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
      let url=checkoutUrl+"?configId="+this.record.templateId+"&appId="+this.record.appId+"&codeType=html&remote="+remote;
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state==false){AjaxUtils.showConfirm('读取错误',data.msg);return;}
        this.setCode(data.code);
        AjaxUtils.showInfo("代码已更新到版本:"+data.version);
      })
    });
  }
  //提交代码到仓库
  commitToRepository=(e)=>{
    this.setState({mask:true,visible: false});
    let remote=this.state.action==='CommitToRepository'?true:false;
    AjaxUtils.post(commitUrl,{configId:this.record.templateId,remote:remote,appId:this.record.appId,code:this.getCode,msg:this.state.commitInfo,codeType:'html'},(data)=>{
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
    }else{
      modalTitle="从模板选择代码";
      modalForm=<ListTemplateCodeForSelect templateType={this.templateType}  close={this.closeModal} />
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
              <Dropdown overlay={checkoutMenu}>
                  <Button icon='sync' >
                    同步源代码 <Icon type="down" />
                  </Button>
              </Dropdown>
              <Button icon='exception' onClick={this.showSelectTemplateCode}>从模板选择代码</Button>
              <Button icon='profile' onClick={this.showCommitHistory}>历史版本</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'450px',width:'100%',border:'none'}}/>
          </div>
      </Spin>
    );
  }
}

export default EditViewHtmlCode;
