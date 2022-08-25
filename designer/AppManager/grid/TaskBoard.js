import React from 'react';
import {Row, Col,Spin,Modal} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TaskType from './TaskType';
import NewTask from '../form/NewTask';
import ShowTask from '../form/ShowTask';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';


const LIST_URL=URI.CORE_TASK.listAllTasks; //显示所有最新50条任务
const changeStateUrl=URI.CORE_TASK.changeState;

// @DragDropContext(HTML5Backend)
class Container extends React.Component {
  constructor(props) {
    super(props);
    this.menuClick=this.props.menuClick; //more点击时触发
    this.state={
      visible: false,
      currentId:'',
      taskList:{taskList_1:[],taskList_2:[],taskList_5:[]},
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
      //载入任务列表
      this.setState({mask:true});
      AjaxUtils.get(LIST_URL,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({taskList:data,mask:false});
          }
      });
  }

  //结束拖拽后的回调函数
  endDrag=(id,taskTypeName)=>{
    //taskTypeName为目标着陆对象的name
    //id为拖动的对象的name
      let state=taskTypeName.substring(taskTypeName.length-1);
      this.setState({mask:true});
      AjaxUtils.post(changeStateUrl,{id:id,state:state},(data)=>{
        this.loadData();
      });
  }

  showTask=(id)=>{
    this.setState({visible: true,currentId:id});
  }

  closeModal=()=>{
      this.setState({visible: false,});
  }

  closeModalAndReload=()=>{
      this.setState({visible: false,});
      this.loadData();
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

   render() {
    let taskList_1=this.state.taskList.taskList_1;
    let taskList_2=this.state.taskList.taskList_2;
    let taskList_5=this.state.taskList.taskList_5;

    let formObj;
    if(this.state.currentId==='new'){
      formObj=<NewTask id='' close={this.closeModalAndReload} />;
    }else{
      formObj=<ShowTask id={this.state.currentId} close={this.closeModal} />;
    }

    return (
     <Spin spinning={this.state.mask} tip="Loading..." >
        <Modal key={Math.random()} title='开发任务' maskClosable={false}
            visible={this.state.visible}
            width='850px'
            style={{ top: 20}}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {formObj}
        </Modal>
        <Row gutter={20} >
        	<Col span={8}>
        		<TaskType name="taskList_1" taskList={taskList_1}  title="任务列表" state='1'  endDrag={this.endDrag} showTask={this.showTask} menuClick={this.menuClick} />
        	</Col>
        	<Col span={8}>
        		<TaskType name="testList_2" taskList={taskList_2}  title="待确认任务" state='2'  endDrag={this.endDrag} showTask={this.showTask} menuClick={this.menuClick}  />
        	</Col>
        	<Col span={8}>
        		<TaskType name="endList_5" taskList={taskList_5} title="已关闭任务" state='5'  endDrag={this.endDrag} showTask={this.showTask} menuClick={this.menuClick} />
        	</Col>
        </Row>
      </Spin>
    );
   }
}

export default DragDropContext(HTML5Backend)(Container);
