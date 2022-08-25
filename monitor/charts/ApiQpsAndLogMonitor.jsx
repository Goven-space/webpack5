import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Card} from 'antd';
import ApiQpsChart from './ApiQpsChart';
import ListServiceLog from '../log/ListServiceLog';
import ApiAvgResponseTime from './ApiAvgResponseTime';
import ApmLogByApiCharts from '../apm/ApmLogByApiCharts';
import ListServiceLogByUserId from '../log/ListServiceLogByUserId';

const TabPane = Tabs.TabPane;

//api前面的+号展示显示api日记

class ApiQpsAndLogMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.state={
      loading: true,
      width:800,
    }
  }

  componentDidMount(){
      this.updateSize();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-50;
    this.setState({width:width});
  }

  render() {
    return (
          <Card style={{width:this.state.width}} >
            <Tabs defaultActiveKey="apilogs" size='large' >
               <TabPane tab="调用日志" key="apilogs" animated={false}>
                <ListServiceLog id={this.id}  />
              </TabPane>
              <TabPane tab="流量统计" key="apiqps">
                <ApiQpsChart  id={this.id}  />
              </TabPane>
              <TabPane tab="平均耗时" key="responstime">
                <ApiAvgResponseTime  id={this.id}  />
              </TabPane>
              <TabPane tab="按用户统计" key="userlogs" animated={false}>
               <ListServiceLogByUserId id={this.id}  />
             </TabPane>
              <TabPane tab="依赖关系" key="apiapm" animated={false}>
                <ApmLogByApiCharts id={this.id}  />
             </TabPane>
            </Tabs>
          </Card>
      );
  }
}

export default ApiQpsAndLogMonitor;
