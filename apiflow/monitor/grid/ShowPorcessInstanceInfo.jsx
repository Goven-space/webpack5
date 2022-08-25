import React from 'react';
import ReactDOM from 'react-dom';
import {Icon,Tabs,Form,Card,Tag} from 'antd';
import ListNodeInstanceLog from './ListNodeInstanceLog';
import ProcessMonitor from '../../process/ProcessMonitor';

//详细显示流程的实例数据

const TabPane = Tabs.TabPane;

class form extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.processId=this.record.processId;
    this.transactionId=this.record.transactionId;
    this.state={
      width:800,
    };
  }

  componentDidMount(){
    this.updateSize();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-60;
    this.setState({width:width});
  }

  closeCurrentTab=(reLoadFlag)=>{
  }

  render() {
    return (
    <div style={{ border:'1px solid #ccc',background: '#fff',padding:25,borderRadius:'4px',width:this.state.width}} >
      <Tabs size="large">
        <TabPane tab="流程执行步骤" key="nodeLogTab" style={{padding:'0px'}}>
            <ListNodeInstanceLog processId={this.processId} transactionId={this.transactionId}  />
        </TabPane>
          <TabPane  tab="图形监控" key="monitor"  >
            <ProcessMonitor status={this.record.currentStatus} processId={this.record.processId} transactionId={this.record.transactionId} appId={this.record.applicationId}  close={this.closeCurrentTab} />;
          </TabPane>
        </Tabs>
    </div>
    );
  }
}

export default Form.create()(form);
