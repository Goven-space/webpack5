import React from 'react';
import { Modal, Card,Calendar,Spin,Icon,Tooltip,Tag} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewDevLog from '../form/NewDevLog'
import { browserHistory } from 'react-router'

const loadDataUrl=URI.CORE_DEVLOG.listByMonth;
const loadDataByYearUrl=URI.CORE_DEVLOG.listByYear;
const basePath=URI.rootPath;
const devlogs=basePath+"/apps/devlogs";

class DevLogCalendar extends React.Component{
	constructor(props) {
	    super(props);
      this.dateFormat='YYYY-MM-DD';
      this.monthFormat = 'YYYY-MM';
      this.mode='month';
			this.menuClick=this.props.menuClick;
	    this.state={
	      visible:false,
	      listMonthData:[],
	      createDate:'',
	      createMonth:'',
	      currentId:'',
	    };
	}

  componentDidMount(){
  	this.loadData();
  }

  getCurMonth(){
  	let today=new Date();
    let year=today.getFullYear();
    let month=""+(today.getMonth()+1);
    if(month.length<2){month="0"+month;}
    return year+"-"+month;
  }

  loadData=()=>{
	  //载入开发日记
	  this.setState({mask:true});
	  let url=loadDataUrl.replace("{month}",this.getCurMonth());
	  AjaxUtils.get(url,(data)=>{
	      if(data.state===false){
	        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
	      }else{
	        this.setState({listMonthData:data,mask:false});
	      }
	  });
	}

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  NewDevLog=(v)=>{
  	let dateStr=v.format(this.dateFormat);
  	let monthStr=v.format(this.monthFormat);
  	let listMonthData=this.state.listMonthData;
  	let getDayData=listMonthData.filter(item=>{return item.createDate===dateStr});
  	if(getDayData.length===0){
    	this.setState({currentId:'',createDate:dateStr,createMonth:monthStr,visible: true,});
	 }
  }

  ShowDevLog=(id)=>{
    this.setState({currentId:id,visible: true,});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }
  showMoreLogs=()=>{
		this.menuClick('MoreLogCalendar');
  }

  dateCellRender=(value)=>{
  	let dateStr=value.format('YYYY-MM-DD');
  	let listMonthData=this.state.listMonthData;
    let getDayData=getDayData=listMonthData.filter(item=>{return item.createDate===dateStr});
    return getDayData.map(item =>
    	<span key={item.id} >
    	<li >
    	<Tooltip title={item.creator+" "+item.createTime}>
    	<Tag color='green' >{item.logType}</Tag><a href="javascript:void(0)" onClick={this.ShowDevLog.bind(this,item.id)}>{item.title}</a>
    	</Tooltip>
      </li>
		</span>
    )
  }

  monthCellRender=(value)=>{
  let dateStr=value.format('YYYY-MM');
  let listMonthData=this.state.listMonthData;
  let getDayData=getDayData=listMonthData.filter(item=>{return item.createMonth===dateStr});
  return getDayData.map((item,index) =>
    <span key={item.id} >
		<li >
    <Tooltip title={item.creator+" "+item.createTime}>
    {++index}.<a href="javascript:void(0)" onClick={this.ShowDevLog.bind(this,item.id)}>{item.title+"-"+item.createDate}</a>
    </Tooltip>
	 </li>
	</span>
  )
}

  onPanelChange=(date,mode)=>{

    //切换月份时更新数据
    let url="";
    var dateStr="";
    this.mode=mode;
    if(mode==='month'){
      //按月显示
      dateStr=date.format('YYYY-MM');
      url=loadDataUrl.replace("{month}",dateStr);
    }else{
      //按年显示
      dateStr=date.format('YYYY');
      url=loadDataByYearUrl.replace("{year}",dateStr);
    }
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
        }else{
          this.setState({listMonthData:data,mask:false});
        }
    });

  }

	render(){
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
	  		<div style={{minHeight:'600px'}} >
	  		    <Modal key={Math.random()} title="开发日记" maskClosable={false}
	  		    visible={this.state.visible}
	  		    footer=''
	  		    width='800px'
	  		    style={{top:'20px'}}
	  		    onOk={this.handleCancel}
	  		    onCancel={this.handleCancel} >
		          <NewDevLog ref="NewDevLog" id={this.state.currentId} createDate={this.state.createDate} createMonth={this.state.createMonth} close={this.closeModal} />
		        </Modal>
		        <Card title='开发日记' extra={<div><a href="javascript:void(0)" onClick={this.showMoreLogs}>More</a></div>} >
		        	<Calendar style={{margin:'0px',padding:'0px'}}  onPanelChange={this.onPanelChange} dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} onSelect={this.NewDevLog} />
		        </Card>
	        </div>
	    </Spin>
		);
	 }
};

export default DevLogCalendar;
