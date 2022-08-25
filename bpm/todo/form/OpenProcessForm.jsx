import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Modal,Select,Radio,Checkbox,Tag,Tabs,Row,Col} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import AceEditor from '../../../core/components/AceEditor'
import ListRemarks from '../grid/ListRemarks'
import ListRemarkDoing from '../grid/ListRemarkDoing'
import ProcessMonitor from '../../process/ProcessMonitor';

//流程审批表单

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const OpenUrl=URI.BPM.ENGINE.openUrl;
const RunUrl=URI.BPM.ENGINE.runUrl;

class form extends React.Component{
  constructor(props){
    super(props);
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId||'';
    this.approveUserId=this.props.approveUserId||'';
    this.state={
      mask:false,
      visible:false,
      visible_firstnode:false,
      visible_backAnyNode:false,
      returnToMe:0,
      otherUserIds:'',
      data:{
        formDatas:[],
        formFields:[],
        actionIds:[],
        nextRouters:[
                {
                    targetNode:{}
                }
        ],
        currentNodeConfig:{remarkInfo:''}
      },
    };
  }

  componentDidMount(){
    this.openProcess();
  }

  //载入表单数据
  openProcess=()=>{
      let body={processId:this.processId,transactionId:this.transactionId,approveUserId:this.approveUserId};
      AjaxUtils.postBody(OpenUrl,JSON.stringify(body),(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.resultMessage);
          }else{
            this.transactionId=data.transactionId;
            this.setState({data:data,mask:false});
            data.formDatas.remark=data.currentNodeConfig.initRemark;
            FormUtils.setFormFieldValues(this.props.form,data.formDatas);
          }
      });
  }

  //点击操作按扭时执地本方法
  runProcess=(actionId)=>{
    if(actionId=='startNode'){
      this.startNode(actionId);
    }else if(actionId=='startRouter'){
      this.startRouter(actionId);
    }else if(actionId=='transferOtherUser'){
      this.setState({visible:true});
    }else if(actionId=='returnToTransferUser'){
      this.returnToTransferUser();
    }else if(actionId=='backFirstNode'){
      this.setState({visible_firstnode:true});
    }else if(actionId=='returnToBackUser'){
      this.returnToBackUser();
    }else if(actionId=='backAnyNode'){
      this.setState({visible_backAnyNode:true});
    }else if(actionId=='countersignAgree' || actionId=="countersignRefuse"){
      this.countersignAgree(actionId);
    }
  }

  //会签同意或不同意
  countersignAgree=(actionId)=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//会签意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":actionId,
      "approveUserId":this.approveUserId,
      "remark":remark,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //回退任意环节
  backAnyNode=()=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    let currnetNodeId=this.state.data.currentNodeConfig.pNodeId;
    let nextNodeIdDoc={};
    nextNodeIdDoc['T00002']='admin';

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":'backAnyNode',
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":nextNodeIdDoc,
      "remark":remark,
      "returnToMe":this.state.returnToMe,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //隐藏所有modal
  modelCancel=()=>{
    this.setState({visible:false,visible_firstnode:false,visible_backAnyNode:false,visible_jsonnode:false,returnToMe:0});
  }

  //返回给回退者
  returnToBackUser=()=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    let currnetNodeId=this.state.data.currentNodeConfig.pNodeId;
    let nextNodeIdDoc={};
    nextNodeIdDoc[currnetNodeId]=this.state.otherUserIds;

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":'returnToBackUser',
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":{},
      "remark":remark,
      "returnToMe":0,
      "data":postFormData,
    };
    this.submit(postData);
  }

  backFirstNode=()=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    let currnetNodeId=this.state.data.currentNodeConfig.pNodeId;
    let nextNodeIdDoc={};
    nextNodeIdDoc[currnetNodeId]=this.state.otherUserIds;

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":'backFirstNode',
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":{},
      "remark":remark,
      "returnToMe":this.state.returnToMe,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //返回给转交者
  returnToTransferUser=()=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    let currnetNodeId=this.state.data.currentNodeConfig.pNodeId;
    let nextNodeIdDoc={};
    nextNodeIdDoc[currnetNodeId]=this.state.otherUserIds;

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":'returnToTransferUser',
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":{},
      "remark":remark,
      "returnToMe":0,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //是否直接返回给我的复选框点击时使用
  returnToMeChange=(e)=>{
    if(e.target.checked){
      this.state.returnToMe=1;
    }else{
      this.state.returnToMe=0;
    }
  }

  //以下为较并窗口所需处理方法
  transferOtherUserChange=(value)=>{
    this.state.otherUserIds=value.join(",");
  }

  //转交给其他用户处理
  transferOtherUser=()=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    let currnetNodeId=this.state.data.currentNodeConfig.pNodeId;
    let nextNodeIdDoc={};
    nextNodeIdDoc[currnetNodeId]=this.state.otherUserIds;

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":'transferOtherUser',
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":nextNodeIdDoc,
      "remark":remark,
      "returnToMe":this.state.returnToMe,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //提交后继指定节点
  startRouter=(actionId)=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });
    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":actionId,
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":{},
      "remark":remark,
      "data":postFormData,
    };
    this.submit(postData);
  }

  //提交后继指定节点
  startNode=(actionId)=>{
    let formData=this.props.form.getFieldsValue();
    let remark=formData.remark;//审批意见
    let nextNodeIdDoc={}; //用来准备提交的节点列表
    let selectNodeIds=[];//用户已选择的节点列表
    let targetNodeIdList=formData.targetNodeIdList||[];
    if(targetNodeIdList instanceof Array){
      selectNodeIds.push(...targetNodeIdList);
    }else{
      selectNodeIds.push(targetNodeIdList);
    }
    selectNodeIds.forEach((item,index)=>{
      if(item!==''){
        let userItems=formData[item]||[];
        nextNodeIdDoc[item]=userItems.join(",");
      }
    });
    //删除formData流程中没有定义的字段
    let postFormData={};
    this.state.data.formFields.forEach((item, i) => {
      postFormData[item.fieldId]=formData[item.fieldId];
    });

    //检测用户是否有选择节点
    if(JSON.stringify(nextNodeIdDoc)=='{}'){
      AjaxUtils.showError("必须选择一个节点!");
      return;
    }else{
      let nullUserCheck=false;
      for(var item in nextNodeIdDoc){
          if(nextNodeIdDoc[item]=='' && item.startsWith("T") && formData[item]!=undefined){
            //T开头的表示是用户处理的节点，必须选择用户
            nullUserCheck=true;
            AjaxUtils.showInfo(item+"节点没有选择审批用户!");
            break;
          }
      }
      if(nullUserCheck){return;}
    }

    //准备好流程的提交数据
    let postData={
      "processId":this.processId,
      "transactionId":this.transactionId,
      "actionId":actionId,
      "approveUserId":this.approveUserId,
      "nextNodeIdDoc":nextNodeIdDoc,
      "remark":remark,
      "data":postFormData,
    };
    this.submit(postData);
  }

  submitJSON=()=>{
    this.setState({visible_jsonnode:false});
    this.props.form.setFieldsValue({"showSubmitJson":false});
    this.submit(this.state.postFormData);
  }

  submit=(postData)=>{
    if(this.state.data.currentNodeConfig.mustRemark=='1' && postData.remark==''){
      AjaxUtils.showError("请填写办理意见再提交!");
      return;
    }
    if(this.props.form.getFieldValue("showSubmitJson")){
      this.state.postFormData=postData;
      this.setState({visible_jsonnode:true});
      return;
    }
    this.setState({mask:true});
    AjaxUtils.postBody(RunUrl,JSON.stringify(postData),(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
          this.props.close(true);
        }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    //生成所有字段
    let formItemsData=this.state.data.formFields.map((item,index)=>{
        let fieldId=item.fieldId;
        let fieldName=item.fieldName;
        let fieldStatus=item.fieldStatus;
        let defaultValue=this.state.data.formDatas[fieldId];
        let formItem=(<FormItem key={fieldId} label={fieldName} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
        {getFieldDecorator(fieldId,{rules: [{ required: false}],initialValue:defaultValue})(<Input  />)}
        </FormItem>);
        return formItem;
    });

    //生成操作按扭
    let buttomItemsData=this.state.data.actionIds.map((item,index)=>{
        let actionId=item.actionId;
        let actionName=item.actionName;
        let formItem=(
          <Button type="primary" onClick={this.runProcess.bind(this,actionId)} style={{marginLeft:'5px'}} >
            {actionName}
          </Button>);
        return formItem;
    });

    //生成节点选择列表
    let defaultSelectNode=[];
    let selectMode='multiple'; //默认允许多选
    let nextNodeSelect=this.state.data.nextRouters.map((item,index)=>{
        if(item.defaultSelected=='YES'){defaultSelectNode.push(item.targetNode.pNodeId);}
        if(item.routerType==='radio'){
          selectMode='';
          defaultSelectNode=[defaultSelectNode[0]];
        }
        return (<Option key={"Node_"+index} value={item.targetNode.pNodeId}>{item.targetNode.pNodeName}</Option>);
    });

    //生成用户选择列表
    let selectNextNodeIds=this.props.form.getFieldValue("targetNodeIdList")||'';
    let nextUserSelect=this.state.data.nextRouters.map((item,index)=>{
      let targetNodeId=item.targetNode.pNodeId||'';
      let targetNodeType=item.targetNode.pNodeType||'';
      let targetNodeName=item.pNodeName==''?item.targetNode.pNodeName:item.pNodeName;
      if(item.targetNode.users==undefined){return false;}//没有users说明不需要选择用户
      let userOptions=item.targetNode.users.map((useritem)=>{
        return (<Option key={useritem.userId}>{useritem.userName+"/"+useritem.deptName}</Option>);
      });
      return (<FormItem label={"选择("+targetNodeName+")用户"} labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }}
          style={{display:selectNextNodeIds.indexOf(targetNodeId)==-1?'none':''}}
        >
        {getFieldDecorator(targetNodeId)(
          <Select mode="multiple" placeholder="请选择审批用户">
           {userOptions}
          </Select>
        )}
      </FormItem>);
    });


    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title='转交给其他用户处理' maskClosable={false}
          visible={this.state.visible}
          width='600px'
          okText="转交"
          cancelText="取消"
          onOk={this.transferOtherUser}
          onCancel={this.modelCancel} >
          <Row  gutter={[16, 16]} >
            <Col span={6} >指定转交用户:</Col>
            <Col span={18} >
              <Select mode="tags" style={{ width: '80%' }} placeholder="请输入转交用户" onChange={this.transferOtherUserChange}></Select>
            </Col>
            <Col span={6} >选项:</Col>
            <Col span={18} ><Checkbox  onChange={this.returnToMeChange}>办理完成后返回给我</Checkbox></Col>
          </Row>
      </Modal>
      <Modal key={Math.random()} title='回退首环节' maskClosable={false}
          visible={this.state.visible_firstnode}
          width='600px'
          okText="回退"
          cancelText="取消"
          onOk={this.backFirstNode}
          onCancel={this.modelCancel} >
          <Row  gutter={[16, 16]} >
            <Col span={6} >选项:</Col>
            <Col span={18} ><Checkbox  onChange={this.returnToMeChange}>办理后直接返回给我</Checkbox></Col>
          </Row>
      </Modal>
      <Modal key={Math.random()} title='回退任意环节' maskClosable={false}
          visible={this.state.visible_backAnyNode}
          width='600px'
          okText="回退"
          cancelText="取消"
          onOk={this.backAnyNode}
          onCancel={this.modelCancel} >
          <Row  gutter={[16, 16]} >
            <Col span={6} >选择回退节点:</Col>
            <Col span={18} >
              <Select mode="tags" style={{ width: '80%' }} ></Select>
            </Col>
            <Col span={6} >要回退的用户:</Col>
            <Col span={18} >
              <Select mode="tags" style={{ width: '80%' }} ></Select>
            </Col>
            <Col span={6} >选项:</Col>
            <Col span={18} ><Checkbox  onChange={this.returnToMeChange}>办理后直接返回给我</Checkbox></Col>
          </Row>
      </Modal>
      <Modal key={Math.random()} title='显示提交JSON' maskClosable={false}
          visible={this.state.visible_jsonnode}
          width='800px'
          cancelText="取消"
          okText="提交"
          onOk={this.submitJSON}
          onCancel={this.modelCancel} >
          <Row  gutter={[16, 16]} >
            <Col span={24} ><Tag color='blue' >POST</Tag>{RunUrl}</Col>
          </Row>
          <Row  gutter={[16, 16]} >
            <Col span={24} >
              <Input.TextArea autoSize value={AjaxUtils.formatJson(JSON.stringify(this.state.postFormData))} />
            </Col>
          </Row>
      </Modal>
      <Tabs size="large">
        <TabPane  tab="审批表单" key="props"  >
            <Form>
              <FormItem label='事务Id' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
                {this.state.data.transactionId}
              </FormItem>
              <FormItem label='当前节点' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
                {(this.state.data.currentNodeConfig.pNodeName||'')+"("+this.approveUserId+")"}
              </FormItem>
              {formItemsData}
              {nextNodeSelect.length>0?
              <FormItem label='选择后续节点' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} >
                {getFieldDecorator('targetNodeIdList',{initialValue:defaultSelectNode})(
                  <Select mode={selectMode} placeholder="请选择节点">
                   {nextNodeSelect}
                  </Select>
                )}
              </FormItem>
              :''}
              {nextUserSelect}
              <FormItem
                label="审批意见"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help={this.state.data.currentNodeConfig.remarkInfo}
              >{
                getFieldDecorator('remark')
                (<Input.TextArea autoSize />)
                }
              </FormItem>
              <FormItem label="显示JSON" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator('showSubmitJson',{initialValue:false})
                (
                    <Checkbox>显示提交JSON</Checkbox>
                )}
              </FormItem>
              <FormItem key='buttonrun' wrapperCol={{ span: 18, offset: 4 }} >
                {buttomItemsData}
              </FormItem>
            </Form>
          </TabPane>
          <TabPane tab="已审批用户" key="remarkList"   >
            <ListRemarks transactionId={this.state.data.transactionId} applicationId={this.state.data.formDatas.applicationId} />
          </TabPane>
          <TabPane tab="待审批用户" key="remarkDoing"   >
            <ListRemarkDoing transactionId={this.state.data.transactionId} applicationId={this.state.data.formDatas.applicationId} />
          </TabPane>
          <TabPane tab="图形监控" key="graphMonitor"   >
            <ProcessMonitor processId={this.state.data.processId} transactionId={this.state.data.transactionId} applicationId={this.state.data.formDatas.applicationId} />
          </TabPane>
          <TabPane  tab="表单JSON" key="formConfig"  >
              <FormItem
                label=""
                help={JSON.stringify({processId:this.processId,transactionId:this.transactionId,approveUserId:this.approveUserId})}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
              <Tag color='blue'>POST</Tag> {OpenUrl}
              </FormItem>
            <AceEditor height={460} onChange={()=>{}}  value={AjaxUtils.formatJson(JSON.stringify(this.state.data))}  />
          </TabPane>
          </Tabs>
      </Spin>
    );
  }
}

export default Form.create()(form);
