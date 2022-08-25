import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,Row,Col,DatePicker,Card} from 'antd';
import {Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const loadDataUrl=URI.ETL.TASK.serverCountCharts;

//错误码统计

class ServerCountCharts extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.startDate='';
    this.endDate='';
    this.state={
      mask:true,
      data:[]
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
  let url=loadDataUrl+"?startTime="+this.startDate+"&endTime="+this.endDate;
   this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });
 }



    getNowFormatDate=(prvNum)=>{
            let date = new Date();
            var seperator1 = "-";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            let currentdate = year + seperator1 + month + seperator1 + strDate;
            return currentdate;
     }

     getLastSevenDays=(date)=>{
             var date = date || new Date(),
             timestamp,
             newDate;
              if(!(date instanceof Date)){
                  date = new Date(date.replace(/-/g, '/'));
              }
              timestamp = date.getTime();
              newDate = new Date(timestamp - 1 * 24 * 3600 * 1000);
              var month = newDate.getMonth() + 1;
              month = month.toString().length == 1 ? '0' + month : month;
              var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
              return [newDate.getFullYear(), month, day].join('-');
     }

     onStartDateChange=(date, dateString)=>{
       this.startDate=dateString;
     }

     onEndDateChange=(date, dateString)=>{
       this.endDate=dateString;
     }

  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const data = this.state.data;
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

    let htmlCode='<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">集群服务器任务占比</div>';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
           开始时间:<DatePicker  onChange={this.onStartDateChange}   showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           结束时间:<DatePicker  onChange={this.onEndDateChange} showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始统计</Button>{' '}
       </Card>

          <Chart height={450} data={dv} scale={cols} padding={[ 0, 0, 0, 0 ]} forceFit>
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

export default ServerCountCharts;
