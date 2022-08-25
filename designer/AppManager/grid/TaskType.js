import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import {Card} from 'antd';
import TaskItem from './TaskItem';
import { browserHistory } from 'react-router';
import * as URI from '../../../core/constants/RESTURI';

const basePath=URI.rootPath;
const listTasks=basePath+"/apps/listTasks";

const boxTarget = {
  drop(props,monitor) {
    return { name: props.name };
  },
};

// @DropTarget('task', boxTarget, (connect, monitor) => ({
//   connectDropTarget: connect.dropTarget(),
//   isOver: monitor.isOver(),
//   canDrop: monitor.canDrop(),
// }))

class TaskType extends React.Component {
  constructor(props){
    super(props);
    this.menuClick=this.props.menuClick; //more点击时触发        
  }

  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    endDrag: PropTypes.func.isRequired,
    state:PropTypes.string.isRequired,
    showTask:PropTypes.func.isRequired,
  };

  showMoreTasks(state){
    // let url=listTasks+"?state="+state;
    // browserHistory.push(listTasks);
    this.menuClick("Task_"+state);
  }

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = '#fff';
    if (isActive) {
      backgroundColor = '#f4f4f4';
    } else if (canDrop) {
      backgroundColor = '#fff';
    }

    let newTask;
    if(this.props.state==='1'){
      newTask=<span><a onClick={this.props.showTask.bind(this,'new')}>+New</a>{' '}</span>
    }
    return connectDropTarget(
      <div>
        <Card
          title={this.props.title}
          extra={<div>{newTask}<a onClick={this.showMoreTasks.bind(this,this.props.state)}>More...</a></div>}
          style={{backgroundColor,minHeight:'1000px'}}
          bodyStyle={{ padding: 10 }}
        >
          {
            this.props.taskList.map(item=>{
              return (<TaskItem name={item.id} key={item.id} endDrag={this.props.endDrag} showTask={this.props.showTask} taskType={this.props.name} taskItem={item} />);
            })
          }
        </Card>
      </div>,
    );
  }
}

export default DropTarget('task', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(TaskType)
