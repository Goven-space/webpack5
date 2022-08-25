import React from 'react';
import {Spin,Card,Timeline, Icon,Tag} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//开发平台中的API变更日志

const changelogUrl=URI.CORE_OPENAPI.changelogUrl;
const recoveryApiVersionUrl=URI.CORE_OPENAPI.recoveryApiVersion;

class APIChangeLogTimeLine extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.serviceId;
    this.state={
      mask:false,
      data:[],
      showApiType:"Service",
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    let url=changelogUrl+"?id="+this.serviceId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  recoveryApiVersion=(id)=>{
    this.setState({mask:true});
    let url=recoveryApiVersionUrl+"?id="+id;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
        }
        this.loadData();
    });
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <div style={{minHeight:'500px',margin:'60px'}} >
          <Timeline  >
            {this.state.data.map((item,index)=>{
              let color='blue';
              if(index===0){color="green";}
              let userId=item.creatorName;
              if(userId===null || userId==='null' || userId===undefined){userId='系统';}
              return <Timeline.Item key={item.id} dot={<Icon type="clock-circle-o" style={{ fontSize: '16px' }} />} color={color} >
                {item.logType} {userId} {item.createTime}<br></br>
                {item.remark}<br></br>
                版本:{item.version}<br/>
                {
                  item.recoveryFlag==true?
                  <Tag color='blue' onClick={AjaxUtils.showConfirm.bind(this,'恢复版本','恢复到此版本的配置吗?',this.recoveryApiVersion.bind(this,item.id))} >恢复到此版本</Tag>
                  :''
                }
              </Timeline.Item>
            })}
          </Timeline>
        </div>
      </Spin>
    );
  }
}

export default APIChangeLogTimeLine;
