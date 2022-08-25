import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const dataUrl=URI.CORE_GATEWAY_MONITOR.starArchitecture;

//API网关首页星型架构图

class StarArchitecture extends React.Component{
  constructor(props){
    super(props);
    this.appId='gateway';
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
    AjaxUtils.get(dataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
           this.initChart(data);
         }
     });
 }

 /**
 * 计算N个点均匀排列成圆的各个点坐标
 * @param nodeSize 参与排列成圆的元素个数
 * @param center 圆的中心点坐标 {x:, y:}
 * @param radius 圆的半径
 * @return 各个元素的坐标：[{x:, y:}, {x:, y:}, ...]
 */
calcCircularLayout=(nodeSize, center, radius)=>{
    var i, _i, _layouts = [];
    for(i = _i = 0; _i < nodeSize; i = ++_i) {
     var x = center.x + radius * Math.sin(2 * Math.PI * i / nodeSize),
         y = center.y + radius * Math.cos(2 * Math.PI * i / nodeSize);
     _layouts.push({'x': x, 'y': y});
   }
   return _layouts;
}

  initChart=(data)=>{
      var xyArray=this.calcCircularLayout(data.nodes.length-1,{x:500,y:-100},2000);
      data.nodes.forEach(function (node,i) {
        if(i<data.nodes.length-1){
          node.x=xyArray[i].x;
          node.y=xyArray[i].y;
          node.category=i+1;
        }else{
          node.x=500;
          node.y=-100;
          node.category=0;
        }
        node.label={show:true};
      });

       let option = {
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           show:true,
           formatter: function (obj) {
               // console.log(obj.data);
               let total = obj.data.total||'0';
               let name=obj.data.name||'';
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '应用名称:'+name
                   + '</div>'
                   + '注册API数：' + total + '<br>';
           }
        },
         legend: [],
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
            {
                name: '应用名称',
                type: 'graph',
                layout: 'none',
                data: data.nodes,
                edges: data.links,
                categories: "categories",
                roam: false,
                label: {
                    normal: {
                        position: 'right',
                        formatter: '{b}'
                    }
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0)'
                },
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0.3
                    }
                },
                emphasis: {
                    lineStyle: {
                        width: 10
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
        <ReactEcharts  option={this.state.option}  style={{height: '650px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default StarArchitecture;
