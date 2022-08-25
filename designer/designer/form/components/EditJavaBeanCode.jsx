import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Dropdown,Menu,Icon} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import ListCommitHistorySelect from '../../../../core/components/ListCommitHistorySelect';
import ListTemplateCodeForSelect from '../../grid/ListTemplateCodeForSelect';

const ButtonGroup = Button.Group;
const getTemplateCode=URI.CORE_CODEREPOSITORY.getTemplateCode;
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;
const saveDataUrl=URI.CORE_CODEREPOSITORY.save;
const confirm = Modal.confirm;
const getByBeanIdUrl=URI.LIST_CORE_BEANS.getByBeanId;
const checkoutUrl=URI.CORE_CODEREPOSITORY.checkOutUrl;
const commitUrl=URI.CORE_CODEREPOSITORY.commitUrl;
const getBranchnameUrl=URI.CORE_CODEREPOSITORY.getBranchnameUrl;

class EditJavaBeanCode extends React.Component{
  constructor(props){
    super(props);
    this.beanId=this.props.beanId;
    this.beanType="";
    this.appId="";
    this.state={
      mask:false,
      visible:false,
      codeUrl:'',
      action:'',
      branchname:'',
      commitInfo:'',
    };
  }

  componentDidMount(){
      this.getBeanInfo();
      this.getBranchName();
  }

  //根据beanId获取java bean的信息
  getBeanInfo=()=>{
    let url=getByBeanIdUrl+"?beanId="+this.beanId;
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        this.beanType=data.beanType;
        this.appId=data.appId;
        let codeUrl=webappsProjectName+"/res/ace/javabeancode.html?beanId="+this.beanId+"&appId="+this.appId;
        this.setState({codeUrl:codeUrl});
      }
    });
  }

  saveCode=()=>{
    let mframe =this.refs.myframe;
    let msg=mframe.contentWindow.saveCode();
    if(msg!==''){
      this.showError(msg);
    }else{
      AjaxUtils.showInfo("保存成功!");
    }
  }

  setCode=(code)=>{
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(code);
  }

  getCode=()=>{
    let mframe =this.refs.myframe;
    return mframe.contentWindow.editor.getValue();
  }

  saveCompile=()=>{
    this.setState({mask:true});
    let mframe =this.refs.myframe;
    let msg=mframe.contentWindow.saveCompile();
    if(msg!==''){
      this.showError(msg);
    }else{
      AjaxUtils.showInfo("编译成功!");
    }
    this.setState({mask:false});
  }

  readFileCode=()=>{
    let mframe =this.refs.myframe;
    let msg=mframe.contentWindow.readFileCode();
    if(msg!==''){
      Modal.error({
        title: '源码读取错误',
        content: msg,
        width:600,
      });
    }
  }

  overFileCode=()=>{
    let mframe =this.refs.myframe;
    let data=mframe.contentWindow.overFileCode();
    if(data.state===false){
      Modal.error({
        title: '错误',
        content: data.msg,
        width:600,
      });
    }else{
      this.showInfo(data.msg);
    }
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

  showConfirm=()=>{
      let self=this;
      confirm({
      title: '警告',
      content: '注意:覆盖Java源文件后不可恢复!',
      onOk(){
        self.overFileCode();
      },
      onCancel() {},
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
          this.setCode(data.code);
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
          this.setCode(data.commitCode);
        }
      });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }


  //选择视图模板
  showSelectTemplateCode=()=>{
    this.setState({visible: true,action:'showSelectTemplateCode'});
  }
  showCommitHistory=()=>{
    this.setState({visible: true,action:'showCommitHistory'});
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
        this.setCode(data.code);
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
      modalForm=<ListCommitHistorySelect  configId={this.beanId} close={this.closeCommitHistoryCodeModal} />;
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
      modalForm=<ListTemplateCodeForSelect templateType={this.beanType} beanId={this.beanId} close={this.closeModal} />;
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
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          {modalForm}
          </Modal>
          <div style={{margin:'0 0 5px 0',padding:'5px',border:'solid 1px #ccc',borderRadius:'5px'}}>
            <ButtonGroup>
              <Button type="primary" icon='save' onClick={this.saveCode}>保存(Ctr+S)</Button>
              <Button icon='check-circle-o' onClick={this.saveCompile}>编译</Button>
              <Dropdown overlay={checkoutMenu}>
                  <Button icon='sync' >
                    同步源代码 <Icon type="down" />
                  </Button>
              </Dropdown>
              <Button icon='exception' onClick={this.showSelectTemplateCode}>从模板创建代码</Button>
              <Button icon='profile' onClick={this.showCommitHistory}>历史版本</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe'  src={this.state.codeUrl} style={{minHeight:'600px',width:'100%',border:'none'}}/>
          </div>
      </Spin>
    );
  }
}

export default EditJavaBeanCode;
