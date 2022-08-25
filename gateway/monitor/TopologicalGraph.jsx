import * as echarts from 'echarts';
import React from 'react';
import {Spin,Row,Col,Radio,Card} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.CORE_GATEWAY_MONITOR.topologicalgraphUrl;

//API网关拓朴图

class TopologicalGraph extends React.Component{
  constructor(props){
    super(props);
    this.state={
      barWidth:40,
      mask:false
    };
  }

  componentDidMount(){
    this.loadData();
  }

  //运行中流程统计
    loadData=()=>{
     this.setState({mask:false});
     let url=dataUrl;
     //url="/mock/flare.json";
      AjaxUtils.get(url,(data)=>{
           if(data.state===false){
             AjaxUtils.showError(data.msg);
           }else{
             this.setState({dataSource:data,mask:false});
             this.initChart(data);
           }
       });
   }

 initChart=(data)=>{
       var chart = echarts.init(document.getElementById('GatewayTopologicalGraph'));
       let option;
       chart.setOption(option = {
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           formatter: function (obj) {
               let total = obj.data.total||'0';
               let avg=obj.data.avg||'0';
               let name=obj.data.name;
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '名称:'+name
                   + '</div>'
                   + '总调用次数：' + total + '<br>'
                   + '平均响应时间：' + avg + '(毫秒)<br>';
           }
        },
        series: [
                  {
                      type: 'tree',
                      data: [data],
                      top: '1%',
                      left: '7%',
                      bottom: '1%',
                      right: '20%',
                      symbolSize: 15,
                      label: {
                          normal: {
                              position: 'left',
                              verticalAlign: 'middle',
                              align: 'right',
                              fontSize: 12
                          }
                      },
                      leaves: {
                          label: {
                              normal: {
                                  position: 'right',
                                  verticalAlign: 'middle',
                                  align: 'left'
                              }
                          }
                      },
                      expandAndCollapse: true,
                      animationDuration: 550,
                      animationDurationUpdate: 750
                  }
              ]
    });
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card title='API网关拓朴图'>
        <div id='GatewayTopologicalGraph'  style={{height: 1050}}  ></div>
        </Card>
      </Spin>
    );
  }
}

export default TopologicalGraph;
