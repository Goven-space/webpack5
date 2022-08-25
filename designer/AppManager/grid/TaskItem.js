import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Alert,Tag} from 'antd';

const boxSource = {
  beginDrag(props) {
    return {
      name: props.name,
    };
  },
  endDrag(props, monitor){
    const item = monitor.getItem(); //当前TaskItem拖动对象的item,props为当前TaskItem的props
    const dropResult = monitor.getDropResult(); //被拖动到目标对象的name
    if (dropResult) {
      if(dropResult.name!==props.taskType){
        //不能拖给自已的面板,拖给其他面板时才回调
        props.endDrag(item.name,dropResult.name);
      }
    }
  },
};

// @DragSource('task', boxSource, (connect, monitor) => ({
//   connectDragSource: connect.dragSource(),
//   isDragging: monitor.isDragging(),
// }))

class TaskItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    taskType: PropTypes.string.isRequired,
  };

  render() {
    const { isDragging, connectDragSource,taskItem } = this.props;
    let tag;
    let taskType=taskItem.taskType;
    if(taskType==='需求'){
      tag=(<Tag color="green-inverse">{taskType}</Tag>);
    }else if(taskType==='BUG'){
      tag=(<Tag color="#f50">{taskType}</Tag>);
    }else if(taskType==='建议'){
      tag=(<Tag color="cyan">{taskType}</Tag>);
    }else{
      tag=(<Tag color="#2db7f5">{taskType}</Tag>);
    }
    let title=(<span>{tag}<a href='#' onClick={this.props.showTask.bind(this,taskItem.id)}>{taskItem.title}</a></span>);
    return (
      connectDragSource(
        <div>
        <Alert
            style={{padding:10,marginBottom:'6px'}}
            message={title}
            description={taskItem.creatorName+" 期望完成时间:"+taskItem.endDate}
            type='info'
        /></div>,
      )
    );
  }
}

export default DragSource('task', boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(TaskItem)
