import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Card} from 'antd';
import ApiQpsChart from '../../monitor/charts/ApiQpsChart';
import ListServiceLog from '../../monitor/log/ListServiceLog';
import ApmLogByApiCharts from '../../monitor/apm/ApmLogByApiCharts';

const TabPane = Tabs.TabPane;

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
              <TabPane tab="拓扑图" key="apiapm" animated={false}>
                <ApmLogByApiCharts id={this.id}  />
             </TabPane>
            </Tabs>
          </Card>
      );
  }
}

export default ApiQpsAndLogMonitor;
