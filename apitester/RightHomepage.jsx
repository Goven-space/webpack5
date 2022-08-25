import React from 'react';
import { Row ,Col,Card,Icon,Tabs,Divider} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import TestOverRate from './form/TestOverRate';

//Index页面
const topCountUrl=URI.CORE_TESTREPORT.topCount;

class RightHomepage extends React.Component {
  constructor(props) {
    super(props);
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
          <Card style={{margin:'0 0 20px 0'}}>
            <Row  >
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>今日测试通过率</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.passRate}</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>今日测试失败数</div>
                <div style={{fontSize:'24px',lineHeight:'32px',color:'red'}}>{this.state.data.errorNum}次</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={5} style={{textAlign:'center'}} >
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我的测试用例</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.caseCount}个</div>
              </Col>
              <Col span={1} ><Divider type="vertical" style={{height:'60px'}} ></Divider></Col>
              <Col span={6} style={{textAlign:'center'}}>
                <div style={{fontSize:'14px',lineHeight:'22px'}}>我发布的API数</div>
                <div style={{fontSize:'24px',lineHeight:'32px'}}>{this.state.data.apiCount}个</div>
              </Col>
            </Row>
          </Card>
          <Card title='测试覆盖率' style={{minHeight:'500px'}} >
            <Row  >
              <Col  span={12} >
                <TestOverRate appId="my" />
              </Col>
            </Row >
          </Card>
      </span>
      );
  }
}

export default RightHomepage;
