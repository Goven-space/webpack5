import React from 'react';
import { Row ,Col,Card,Icon,Tabs,Divider,Statistic} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import HomePageApplications from './view/RightHomePageApplications';
import ListHotApis from './grid/ListHotApis';
import ListRecommendApis from './grid/ListRecommendApis';

//右则首页订部统计信息

const TabPane = Tabs.TabPane;
const topCountUrl=URI.CORE_APIPORTAL_HOEMMENU.topCount;

class RightHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.detailClick=this.props.detailClick;
    this.state={
      mask:true,
      data:{},
    };
  }

  componentDidMount(){
    this.loadData();
  }


  //载入菜单
  loadData=()=>{
    this.setState({mask:true});
    AjaxUtils.get(topCountUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  render(){
    return (
      <span>
          <Card style={{margin:'0 0 15px 0'}}>
            <Row  >
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我关注的API数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.followCount}个API</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={6} style={{textAlign:'center'}}>
                <div style={{fontSize:'14px',lineHeight:'22px'}}>API变更通知</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}><span style={{color:'#f50'}}>{this.state.data.apiCount}</span>个变更</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我发布的API数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.publishCount}个API</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>总应用数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.appCount}个应用</div>
              </Col>
            </Row>
          </Card>
          <Card title="应用列表" >
                <HomePageApplications detailClick={this.detailClick}  />
          </Card>
      </span>
      );
  }
}

export default RightHomepage;
