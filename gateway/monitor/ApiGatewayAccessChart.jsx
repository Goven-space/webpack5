import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,Row,Col,Icon,Card,Tabs} from 'antd';
import {Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import StarArchitecture from './StarArchitecture';

const TabPane = Tabs.TabPane;
const loadDataUrl=URI.CORE_GATEWAY_MONITOR.gateWayStatistics;
const QPSURL=URI.CORE_GATEWAY_HEALTH.qps;

//测试覆盖率

class ApiGatewayAccessChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.url=QPSURL+"?identitytoken="+AjaxUtils.getCookie("identitytoken");
    this.eventSource=new EventSource(this.url);
    this.state={
      mask:true,
      realData:{qps:0,responseTime:0.0},
      data:{averageResTime:0,totalAccessNum:0,totalFailAccessNum:0,totalAppNum:10,totalServerNum:0,totalRouterNum:0,totalRegNum:0}
    };
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillUnmount(){
    this.eventSource.close();
  }

  loadData=()=>{
    //读取固定数据
   this.setState({mask:true});
    AjaxUtils.get(loadDataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });

     //读取实时数据
     this.eventSource.onmessage=(event)=>{
       let json=event.data;
       // console.log(json);
       this.setState({realData:JSON.parse(json)});
     }

 }

  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const data = [
      { item: '累计调用次数', count: this.state.data.totalAccessNum },
      { item: '累计失败次数', count: this.state.data.totalFailAccessNum },
    ];
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent'
    });

    const cols = {
      percent: {
        formatter: val => {
          val = (val * 100) + '%';
          return val;
        }
      }
    }
    let textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};
    let htmlCode='<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">网关实时TPS<br><span style="color:#262626;font-size:2.5em">'+this.state.realData.qps+'</span></div>';
    // console.log(this.state.realData);
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Row gutter={24} >
            <Col span={6}>
                <div style={{background:'#f4f4f4',height:'80px'}}  >
                  <div style={{width:'40%',float:'left',background:'#CC9966',height:'100%',textAlign:'center'}}>
                          <Icon type="gold" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                  <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.data.totalServerNum}</b></span>
                        <div>集群服务器</div>
                    </div>
                </div>
            </Col>
            <Col span={6} >
              <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#33CC99',height:'100%',textAlign:'center'}}>
                        <Icon type="appstore" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.realData.responseTime}</b></span>
                          <div>实时响应时间(毫秒)</div>
                    </div>
                </div>
            </Col>
            <Col span={6}>
                <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#66CC99',height:'100%',textAlign:'center'}}>
                        <Icon type="clock-circle" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.data.averageResTime}</b></span>
                          <div>总平均响应时间(秒)</div>
                    </div>
                </div>
            </Col>
            <Col span={6}>
              <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#66CC99',height:'100%',textAlign:'center'}}>
                          <Icon type="tag" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.data.totalRegNum}</b></span>
                          <div>总注册API数(个)</div>
                    </div>
                </div>
            </Col>
          </Row>
          <div style={{height:'40px'}}></div>
          <div style={{border:'1px solid #f0f0f0',padding:'10px',minHeight:'650px'}}>
            <Tabs size="large">
              <TabPane  tab="网关实时流量" key="props"  >
                <div style={{marginRight:'200px'}}>
                    <Chart height={400} data={dv} scale={cols} padding={[ 0, 0, 0, 0 ]} forceFit>
                            <Coord type={'theta'} radius={0.75} innerRadius={0.7} />
                            <Axis name="percent" />
                            <Tooltip
                              showTitle={false}
                              itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                              />
                            <Guide >
                              <Html position ={[ '50%', '50%' ]} html={() =>{return htmlCode}} alignX='middle' alignY='middle'/>
                            </Guide>
                            <Geom
                              type="intervalStack"
                              position="percent"
                              color='item'
                              tooltip={['item*percent',(item, percent) => {
                                percent = percent * 100 + '%';
                                return {
                                  name: item,
                                  value: percent
                                };
                              }]}
                              style={{lineWidth: 1,stroke: '#fff'}}
                              >
                              <Label content='data'
                                formatter={(val, item) => {
                                    return item.point.item+":"+item.point.count;
                                }}
                              />
                            </Geom>
                        </Chart>
                  </div>
              </TabPane>
              <TabPane  tab="系统星型拓扑图" key="auth"  >
                <StarArchitecture />
              </TabPane>
            </Tabs>
          </div>
      </Spin>
    );
  }
}

export default ApiGatewayAccessChart;
