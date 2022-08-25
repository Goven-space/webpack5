import React from 'react';
import {Button, Spin,Tag,Icon,Modal,Card,Input,Tabs,Progress } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const jvminfoUrl=URI.LIST_MONITOR.jvminfo; // 显示服务的详细信息
const TabPane = Tabs.TabPane;

class ShowJvmInfo extends React.Component{
  constructor(props){
    super(props);
    this.serviceBaseUrl=this.props.serviceBaseUrl||host;
    this.url=this.serviceBaseUrl+jvminfoUrl;
    this.state={
      mask:false,
      visible:false,
      data:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
      this.setState({mask:true});
      AjaxUtils.get(this.url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data});
          }
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  render() {
    let data=this.state.data;

    let systemInfoTr=[];
    if(data.SystemInfo!==null && data.SystemInfo!==undefined){
      Object.keys(data.SystemInfo).forEach((item,index)=>{
        systemInfoTr.push(<tr key={index}><td>{item}</td><td>{data.SystemInfo[item]}</td></tr>);
      });
    }

    let compilationInfoTr=[];
    if(data.CompilationInfo!==null && data.CompilationInfo!==undefined){
      Object.keys(data.CompilationInfo).forEach((item,index)=>{
        compilationInfoTr.push(<tr key={index}><td>{item}</td><td>{data.CompilationInfo[item]}</td></tr>);
      });
    }

    let classLoadingInfo=[];
    if(data.ClassLoadingInfo!==null && data.ClassLoadingInfo!==undefined){
      Object.keys(data.ClassLoadingInfo).forEach((item,index)=>{
        classLoadingInfo.push(<tr key={index}><td>{item}</td><td>{data.ClassLoadingInfo[item]}</td></tr>);
      });
    }

    let RuntimeInfoTr=[];
    if(data.RuntimeInfo!==null && data.RuntimeInfo!==undefined){
      Object.keys(data.RuntimeInfo).forEach((item,index)=>{
        RuntimeInfoTr.push(<tr key={index}><td>{item}</td><td>{data.RuntimeInfo[item]}</td></tr>);
      });
    }

    let MemoryInfoTr=[];
    if(data.MemoryInfo!==null && data.MemoryInfo!==undefined){
      Object.keys(data.MemoryInfo).forEach((item,index)=>{
        let color="#000";
        let value=data.MemoryInfo[item];
        let spos=value.indexOf("%");
        if(spos!==-1){
          let percent=value.substring(0,spos)-0;
          if(percent>60){
            MemoryInfoTr.push(<tr key={index}><td>{item}</td><td><Progress percent={percent} status="exception" /></td></tr>);
          }else{
            MemoryInfoTr.push(<tr key={index}><td>{item}</td><td><Progress percent={percent}  /></td></tr>);
          }
        }else{
          MemoryInfoTr.push(<tr key={index}><td>{item}</td><td  >{value}</td></tr>);
        }
      });
    }

    let MemoryPoolInfoTable=[];
    if(data.MemoryPoolInfo!==null && data.MemoryPoolInfo!==undefined){
      data.MemoryPoolInfo.map((item,index)=>{
        let trList=[];
        Object.keys(item).forEach((text,index)=>{
          let color="#000";
          let value=item[text];
          let spos=value.indexOf("%");
          if(spos!==-1){
            let percent=value.substring(0,spos)-0;
            if(percent>60){
              trList.push(<tr key={index}><td>{text}</td><td><Progress percent={percent} status="exception" /></td></tr>);
            }else{
              trList.push(<tr key={index}><td>{text}</td><td><Progress percent={percent}  /></td></tr>);
            }
          }else{
            trList.push(<tr key={index}><td>{text}</td><td  >{value}</td></tr>);
          }
        });
        MemoryPoolInfoTable.push(<table style={{width:'100%'}} key={index}  ><tbody>
          <tr key='in2'>
          <th style={{width:'30%'}} >数据名称</th>
          <th>当前数值</th>
          </tr>
          {trList}
          </tbody></table>);
      })
    }

    let ThreadInfoTr=[];
    let DeadThreadInfoTr=[];
    let ActiveThreadInfoTr=[];
    if(data.ThreadInfo!==null && data.ThreadInfo!==undefined){
      Object.keys(data.ThreadInfo).forEach((item,index)=>{
        if(item==='DeadThreads'){
          //死锁线程
          let DeadThreadItem=data.ThreadInfo[item];
          Object.keys(DeadThreadItem).forEach((item1,index1)=>{
            DeadThreadInfoTr.push(<tr key={i}><td>{threadObj.threadName}</td><td>{threadObj.threadState}</td><td>{threadObj.blockedTime}</td><td>{threadObj.waitedTime}</td><td>{threadObj.stackTrace}</td></tr>);
          });
        }else if(item==='ActiveThreads'){
          //活动的线程
          let ActiveThreadItem=data.ThreadInfo[item];
          ActiveThreadItem.forEach((threadObj,i)=>{
            ActiveThreadInfoTr.push(<tr key={i}><td>{threadObj.threadName}</td><td>{threadObj.threadState}</td><td>{threadObj.threadId}</td></tr>);
          });
        }else{
          ThreadInfoTr.push(<tr key={index}><td>{item}</td><td>{data.ThreadInfo[item]}</td></tr>);
        }
      });
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{paddingBottom:'20px'}} className='apidoc'  >
          <Button  type="primary" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
            <Tabs>
              <TabPane  tab="基础运行信息" key="baseinfo"  >
                <h2>操作系统信息</h2>
                <table style={{width:'100%'}}><tbody  >
                  <tr key='in1'>
                  <th style={{width:'30%'}}>数据名称</th>
                  <th>当前数值</th>
                  </tr>
                  {systemInfoTr}
                </tbody></table>

                <h2>编译信息</h2>
                <table style={{width:'100%'}}  ><tbody>
                  <tr key='in2'>
                  <th style={{width:'30%'}} >数据名称</th>
                  <th>当前数值</th>
                  </tr>
                  {compilationInfoTr}
                </tbody></table>

              <h2>类加载信息</h2>
                <table style={{width:'100%'}}><tbody>
                  <tr key='in3'>
                  <th style={{width:'30%'}} >数据名称</th>
                  <th>当前数值</th>
                  </tr>
                  {classLoadingInfo}
                </tbody></table>

              <h2>运行时信息</h2>
                  <table style={{width:'100%'}}><tbody>
                    <tr key='in4'>
                    <th style={{width:'30%'}} >数据名称</th>
                    <th>当前数值</th>
                    </tr>
                    {RuntimeInfoTr}
              </tbody></table>
          </TabPane>
          <TabPane  tab="内存使用情况" key="meminfo"  >
              <h2>内存统计信息</h2>
                    <table style={{width:'100%'}}><tbody>
                      <tr key='in5'>
                      <th style={{width:'30%'}} >数据名称</th>
                      <th>当前数值</th>
                      </tr>
                      {MemoryInfoTr}
                </tbody></table>

              <h2>各内存堆详细信息</h2>
              {MemoryPoolInfoTable}
          </TabPane>
          <TabPane  tab="线程使用情况" key="threadinfo"  >
                <h2>线程统计信息</h2>
                      <table style={{width:'100%'}}><tbody>
                        <tr key='in7'>
                        <th style={{width:'30%'}} >数据名称</th>
                        <th>当前数值</th>
                        </tr>
                        {ThreadInfoTr}
                </tbody></table>

                <h2>死锁线程信息</h2>
                      <table style={{width:'100%'}}><tbody>
                        <tr key='in8'>
                        <th style={{width:'30%'}} >线程名称</th>
                        <th>线程状态</th>
                        <th>线程阻塞时间(毫秒)</th>
                        <th>线程等待时间(毫秒)</th>
                        <th>线程堆栈跟踪信息</th>
                        </tr>
                        {DeadThreadInfoTr}
                </tbody></table>

                <h2>活动线程信息</h2>
                      <table style={{width:'100%'}}><tbody>
                        <tr key='in9'>
                        <th style={{width:'50%'}} >线程名称</th>
                        <th>线程状态</th>
                        <th>线程id</th>
                        </tr>
                        {ActiveThreadInfoTr}
                </tbody></table>
        </TabPane>
        </Tabs>
        </div>
      </Spin>
    );
  }
}

export default ShowJvmInfo;
