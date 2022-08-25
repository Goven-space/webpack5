import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,Row,Col} from 'antd';
import {Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const loadDataUrl=URI.LIST_REGSERVER_REPORT.server_count;

//测试覆盖率

class ServerNumCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:true,
      data:{totalCount:0,activeCount:0,stopCount:0}
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:false});
    AjaxUtils.get(loadDataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });
 }

  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const data = [
      { item: '活跃服务实例', count: this.state.data.activeCount },
      { item: '失效服务实例', count: this.state.data.stateNum },
      { item: '强制下线的实例', count: this.state.data.stopCount }
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

    let htmlCode='<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">活沃服务实例数<br><span style="color:#262626;font-size:2.5em">'+this.state.data.activeCount+'</span></div>';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Chart height={350}  data={dv} scale={cols} padding={[ 0, 0, 0, 0 ]} forceFit>
                  <Coord type={'theta'} radius={0.75} innerRadius={0.6} />
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
                    <Label content='percent' formatter={(val, item) => {
                        let spos=val.indexOf(".");
                        if(spos!==-1){
                          val=val.substring(0,spos+2)+"%";
                        }
                        return item.point.item + ': ' + val;}} />
                  </Geom>
                </Chart>
      </Spin>
    );
  }
}

export default ServerNumCharts;
