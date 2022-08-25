import React from 'react';
import ReactDOM from 'react-dom';
import {Icon,Tabs,Form,Card,Tag} from 'antd';
import ListNodeInstanceLog from './ListNodeInstanceLog';
import ListDataTransLog from '../../dataquality/datalog/ListDataTransLog';
import ProcessMonitor from '../../process/ProcessMonitor';

//详细显示流程的实例数据

const TabPane = Tabs.TabPane;

class form extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.processId=this.record.processId;
    this.transactionId=this.record.transactionId;
    this.logDbName=this.props.logDbName;
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
        <TabPane tab="任务执行步骤" key="nodeLogTab" style={{padding:'0px'}}>
            <ListNodeInstanceLog processId={this.processId} transactionId={this.transactionId} logDbName={this.logDbName}  />
        </TabPane>
        <TabPane tab="任务汇总数据" key="totalTab" style={{padding:'0px'}}>
              <Card bordered={true} style={{lineHeight:'25px'}}>
              <li>事务Id:{this.record.transactionId}</li>
              <li>开始时间:{this.record.startTime}</li>
              <li>结束时间:{this.record.endTime}</li>
              <li>成功插入:<Tag color='green'>{this.record.insertSuccessCount}</Tag></li>
              <li>插入失败:<Tag color='red'>{this.record.insertFailedCount}</Tag></li>
              <li>成功更新:<Tag color='green'>{this.record.updateSuccessCount}</Tag></li>
              <li>更新失败:<Tag color='red'>{this.record.updateFailedCount}</Tag></li>
              <li>成功删除:<Tag color='green'>{this.record.deleteSuccessCount}</Tag></li>
              <li>删除失败:<Tag color='red'>{this.record.deleteFailedCount}</Tag></li>
              <li>运行结果:{this.record.executeMsg}</li>
              </Card>
          </TabPane>
          <TabPane  tab="成功传输数据" key="success"  >
            <ListDataTransLog processId={this.processId} transactionId={this.transactionId} nodeId='' logType='0' />
          </TabPane>
          <TabPane  tab="传输失败数据" key="failed"  >
            <ListDataTransLog processId={this.processId} transactionId={this.transactionId} nodeId=''  logType='1' />
          </TabPane>
          <TabPane  tab="图形监控" key="monitor"  >
            <ProcessMonitor status={this.record.currentStatus} processId={this.record.processId} transactionId={this.record.transactionId} appId={this.record.applicationId} logDbName={this.logDbName}  close={this.closeCurrentTab} />;
          </TabPane>
        </Tabs>
    </div>
    );
  }
}

export default Form.create()(form);
