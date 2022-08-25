import React from 'react';
import { Card,Row,Col,Icon,Spin} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import TotalRamChart from '../jvm/TotalRamChart';
import TotalThreadChart from '../jvm/TotalThreadChart';
import ApiCallsChart from './ApiCallsChart';
import ApiCallsByWeekChart from './ApiCallsByWeekChart';
import ApiPerformanceChart from './ApiPerformanceChart';

const statisUrl=URI.CORE_STATIS.serviceManagerStatis;
const getServiceLastWeekStatis=URI.CORE_STATIS.getServiceLastWeekStatis;
const getServiceCoutByAppClass=URI.CORE_STATIS.getServiceCoutByAppClass;
const getServiceCoutByState=URI.CORE_STATIS.getServiceCoutByState;
const textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};

//内存及线程趋势图

class JvmRamAndThreadTrend extends React.Component{

  constructor(props){
    super(props);
    this.state={
      mask:false,
      statis:{},
      lastWeekData:[],
      serviceAppData:[],
      serviceStateData:[],
    }
  }

  componentDidMount(){

  }


	render(){
	  return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Card title='服务器内存趋势'>
        <TotalRamChart />
      </Card>
      <br/>
      <Card title='服务器线程趋势'>
        <TotalThreadChart />
      </Card>
      </Spin>
		);
	 }
}

export default JvmRamAndThreadTrend;
