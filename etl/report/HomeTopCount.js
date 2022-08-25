import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge,Divider,Progress  } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import HomeTopCountCharts from './HomeTopRunCountCharts';
import HomeTopAvgTimeCharts from './HomeTopAvgTimeCharts';

const loadDataUrl=URI.ETL.REPORT.homeRunCount;
const { Meta } = Card;

class HomeTopCount extends React.Component{
  constructor(props){
    super(props);
    this.applicationId=this.props.applicationId;
    this.state={
      mask:false,
      data:[],
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    let url=loadDataUrl+"?applicationId="+this.applicationId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  showListItem=(item)=>{
    if(item.title==='1'){
      return (<List.Item>
        <Card style={{height:'175px'}}>
        <div> 今日调度失败次数</div>
        <span style={{fontSize:'28px',fontFamily:'Microsoft YaHei',color:'red'}} >{item.errorCount}</span>
        <div>失败率</div>
        <Progress strokeLinecap="square"  percent={item.errorPercent} status="active" />
        <Divider dashed  style={{margin:'25px 0 5px 0'}} />
        <div> 未结束任务数 {item.runingProcesssCount}</div>
        </Card>
      </List.Item>);
    }else if(item.title==='2'){
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 今日总调度次数</div>
        <span style={{fontSize:'26px',fontFamily:'Microsoft YaHei'}} >{item.totalToDayRunCount}</span>
        <HomeTopCountCharts />
        <Divider dashed  style={{margin:'2px 0 5px 0'}} />
        <div> 累计调度次数 {item.totalRunCount}</div>
        </Card>
      </List.Item>);
    }else if(item.title==='3'){
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 今日传输数据总数</div>
        <span style={{fontSize:'26px',fontFamily:'Microsoft YaHei'}} >{item.processTotalSuccessCount}</span>
        <HomeTopAvgTimeCharts />
        <Divider dashed  style={{margin:'2px 0 5px 0'}} />
        <div> 今日传输失败总数 <span style={{color:'red'}}>{item.processTotalFailedCount}</span></div>
        </Card>
      </List.Item>);
    }else{
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 已接入数据源</div>
        <span style={{fontSize:'24px',fontFamily:'Microsoft YaHei'}} >{item.totalDataSourceCount}</span>
        <div> 待审批任务</div>
        <span style={{fontSize:'24px',color:'#f50',fontFamily:'Microsoft YaHei'}} >{item.approverProcessCount}</span>
        <Divider dashed  style={{margin:'10px 0 5px 0'}} />
        <div> 总调度任务数 {item.totalProcessCount+"/"+item.userProcessCount}</div>
        </Card>
      </List.Item>);
    }
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={this.state.data}
          renderItem={this.showListItem}
        />
      </Spin>
    );
  }
}

export default HomeTopCount;
