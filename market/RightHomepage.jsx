import React from 'react';
import { Row ,Col,Card,Icon,Tabs,Divider} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import  ApiQpsChart from './form/ApiQpsChart';

//Index页面
const topCountUrl=URI.MARKET.ADMIN.homePageReport;

class RightHomepage extends React.Component {
  constructor(props) {
    super(props);
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
          <Card style={{margin:'0 0 20px 0'}}>
            <Row  >
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我收藏的API</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.favCount}个</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>可用积分</div>
                <div style={{fontSize:'24px',lineHeight:'32px',color:'red'}}>{this.state.data.points}分</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>今日调用次数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.requestCount}次</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={6} style={{textAlign:'center'}}>
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我发布的API数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.publishCount}个</div>
              </Col>
            </Row>
          </Card>
          <Card title='API调用统计' style={{minHeight:'500px'}} >
            <Row  >
              <Col  >
                <ApiQpsChart />
              </Col>
            </Row >
          </Card>
      </span>
      );
  }
}

export default RightHomepage;
