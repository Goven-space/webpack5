import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge,Divider,Progress  } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import HomeTopCountCharts from './HomeTopRunCountCharts';
import HomeTopAvgTimeCharts from './HomeTopAvgTimeCharts';

const loadDataUrl=URI.BPM.CORE_BPM_REPORT.homeRunCount;
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
        <div> 超时流程数</div>
        <span style={{fontSize:'28px',fontFamily:'Microsoft YaHei',color:'red'}} >{item.errorCount}</span>
        <div>超时率</div>
        <Progress strokeLinecap="square"  percent={item.errorPercent} status="active" />
        <Divider dashed  style={{margin:'25px 0 5px 0'}} />
        <div> 累计超时次数 {item.errorTotalCount}</div>
        </Card>
      </List.Item>);
    }else if(item.title==='2'){
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 今日总启动次数</div>
        <span style={{fontSize:'28px',fontFamily:'Microsoft YaHei'}} >{item.totalToDayRunCount}</span>
        <HomeTopCountCharts applicationId={this.applicationId}  />
        <Divider dashed  style={{margin:'2px 0 5px 0'}} />
        <div> 累计启动流程数 {item.totalRunCount}</div>
        </Card>
      </List.Item>);
    }else if(item.title==='3'){
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 平均审批耗时</div>
        <span style={{fontSize:'28px',fontFamily:'Microsoft YaHei'}} >{item.toDayRunTime}</span>
        <HomeTopAvgTimeCharts applicationId={this.applicationId}  />
        <Divider dashed  style={{margin:'2px 0 5px 0'}} />
        <div> 系统平均响应时间 {item.yesterdayRunTime}
          {
            (item.toDayRunTime-0)>(item.yesterdayRunTime-0)?
            <span style={{color:'red'}}><Icon type="caret-up" /></span>
            :
            <span style={{color:'green'}}><Icon type="caret-down" /></span>
          }
        </div>
        </Card>
      </List.Item>);
    }else{
      return (<List.Item>
        <Card  style={{height:'175px'}}>
        <div> 本应用总流程数(个)</div>
        <span style={{fontSize:'28px',fontFamily:'Microsoft YaHei'}} >{item.totalProcessCount}</span>
        <Divider dashed  style={{margin:'10px 0 5px 0'}} />
        <div> 我设计的流程 {item.userProcessCount}</div>
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
