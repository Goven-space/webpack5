import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal,Dropdown,Menu,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ListCommitHistorySelect from '../../../core/components/ListCommitHistorySelect';
import ListTemplateCodeForSelect from '../../../core/components/SelectTemplateCode';

const ButtonGroup = Button.Group;
const getTemplateCode=URI.CORE_CODEREPOSITORY.getTemplateCode;
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;
const confirm = Modal.confirm;
const getSqlCodeUrl=URI.CORE_SQLCONFIG.generatingSqlCode;

class EditSQLCode extends React.Component{
  constructor(props){
    super(props);
    this.saveData=this.props.saveData; //代码保存方法
    this.code=this.props.code; //显示代码
    this.record=this.props.record; //编辑的数据记录
    this.codeType=this.props.codeType; //代码类型
    this.templateType=this.props.templateType; //模板类型
    this.tableName=this.props.record.tableName;
    this.dbConnId=this.props.record.dbConnId;
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

  }

  saveCode=(code,closeFlag)=>{
    let mframe =this.refs.myframe;
    code=mframe.contentWindow.getCode();
    this.saveData(this.record,code,closeFlag);
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

  getSqlCode=(e)=>{
    let key=e.key;
    this.setState({mask:true,visible: false});
    let url=getSqlCodeUrl+"?dbConnId="+this.dbConnId+"&tableName="+this.tableName+"&codeType="+key;
    AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showConfirm("生成错误",data.msg);
      }else{
        AjaxUtils.showInfo("已成功生成");
        this.setCode(data[key]);
      }
    });
  }

  showCommitHistory=()=>{
    this.setState({visible: true,action:'showCommitHistory'});
  }

  render() {
    let modalForm;
    let modalTitle="";
    if(this.state.action==='showCommitHistory'){
      modalTitle="提交历史记录";
      modalForm=<ListCommitHistorySelect  configId={this.record.id} close={this.closeCommitHistoryCodeModal} />;
    }else{
      modalTitle="从模板选择代码";
      modalForm=<ListTemplateCodeForSelect templateType={this.templateType}  close={this.closeModal} />
    }
    const sqlCreateMenu = (
      <Menu onClick={this.getSqlCode}>
        <Menu.Item key="select"><Icon type="profile" />{' '}生成Select语句</Menu.Item>
        <Menu.Item key="update"><Icon type="profile" />{' '}生成Update语句</Menu.Item>
        <Menu.Item key="delete"><Icon type="profile" />{' '}生成Delete语句</Menu.Item>
        <Menu.Item key="insert"><Icon type="profile" />{' '}生成Insert语句</Menu.Item>
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
              <Button type="primary" icon='save' onClick={this.saveCode.bind(this,'',true)}>保存并关闭</Button>
              <Button  icon='save' onClick={this.saveCode.bind(this,'',false)}>保存(Ctr+S)</Button>
              <Dropdown overlay={sqlCreateMenu}>
                    <Button icon='profile' >
                      生成SQL语句 <Icon type="down" />
                    </Button>
              </Dropdown>
              <Button icon='exception' onClick={this.showSelectTemplateCode}>选择示例代码</Button>
              <Button icon='profile' onClick={this.showCommitHistory}>历史版本</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode.bind(this,"")} src={this.codeUrl} style={{minHeight:'450px',width:'100%',border:'none'}}/>
            {'SQL中使用#{变量}表示SQL的预编译变量，使用${变量}可直接替换为HTTP输入参数或系统变量,使用${where}可以把SQL配置的条件插入到指定位置否则追加到最后'}
          </div>
      </Spin>
    );
  }
}

export default EditSQLCode;
