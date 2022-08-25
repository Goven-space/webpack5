import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const dataUrl=URI.ETL.RELATIONSHIP.datasourceShip;

//数据源依赖关系统计

class DataSourceDependencies extends React.Component{
  constructor(props){
    super(props);
    this.appId='';
    this.state={
      mask:false,
      option:{},
      serverId:'',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data);
         }
     });
 }

  initChart=(data)=>{
       let option = {
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           show:true,
           formatter: function (obj) {
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '数据源名称:'+obj.name+"</div>"
                   + '<div>数据源Id：' + obj.data.dataSourceId + '<br>'
                   + '备注：' + (obj.data.remark||'') + '<br>'
                   +'</div>';
           }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
            {
                name: '数据源名称',
                type: 'graph',
                layout: 'circular',
                circular: {  rotateLabel: true},
                top: '20%',
                bottom: '20%',
                data: data.nodes,
                edges: data.links,
                edgeSymbol: ['circle', 'arrow'],
                categories: data.categories,
                roam: false,
                label: {
                    normal: {
                        position: 'right'
                    }
                },
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0.3
                    }
                }
            }
        ]
    };
     this.setState({option:option});
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <ReactEcharts  option={this.state.option}  style={{height: '850px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default DataSourceDependencies;
