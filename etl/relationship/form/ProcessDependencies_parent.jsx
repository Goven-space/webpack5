import * as echarts from 'echarts';
import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {Spin,Row,Col,Radio,Card} from 'antd';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as URI from '../../../core/constants/RESTURI';

const dataUrl=URI.ETL.RELATIONSHIP.processParent;

//流程依赖分析，上游

class ProcessDependencies_parent extends React.Component{
  constructor(props){
    super(props);
    this.processId=this.props.processId;
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
     let url=dataUrl+"?processId="+this.processId;
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
                   + '流程名称:'+obj.data.name
                   + '</div>流程编号:'+obj.data.value;
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
    }
    this.setState({option:option});
  };

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <ReactEcharts  option={this.state.option}  style={{height: '400px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default ProcessDependencies_parent;
