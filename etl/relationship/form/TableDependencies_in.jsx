import * as echarts from 'echarts';
import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {Spin,Row,Col,Radio,Card} from 'antd';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as URI from '../../../core/constants/RESTURI';

const dataUrl=URI.ETL.RELATIONSHIP.tablesIn;

//数据库表分系分析，流入方向

class TableDependencies_in extends React.Component{
  constructor(props){
    super(props);
    this.datasourceId=this.props.datasourceId;
    this.state={
      barWidth:40,
      mask:false,
      option:{}
    };
  }

  componentDidMount(){
    this.loadData();
  }

  //运行中流程统计
    loadData=()=>{
     this.setState({mask:false});
     let url=dataUrl+"?datasourceId="+this.datasourceId;
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
       let option={
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           formatter: function (obj) {
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '数据库表名称:'+obj.data.name
                   + '</div>'
                   + '引用流程名称：' + (obj.data.processName||'') + '<br>'
                   + '引用节点名称：' + (obj.data.nodeName||'')+'<br>'
                   + '数据源Id：' + (obj.data.datasourceId||'')+'<br>';
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
                      orient: 'RL',
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
    }
    this.setState({option:option});
  };

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <ReactEcharts  option={this.state.option}  style={{height: '1000px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default TableDependencies_in;
