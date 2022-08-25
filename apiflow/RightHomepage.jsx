import React from 'react';
import { Row ,Col,Card,Icon,Tabs} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import HomeTopCount from './report/HomeTopCount';
import HomePageProcessReport from './report/HomePageProcessReport';

const TabPane = Tabs.TabPane;

//Index页面

class RightHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.detailClick=this.props.detailClick;
    this.applicationId=this.props.applicationId;
    this.state={
      mask:true,
    };
  }

  render(){
    return (
      <span>
      <HomeTopCount applicationId={this.applicationId} />
      <Card><HomePageProcessReport detailClick={this.detailClick} applicationId={this.applicationId}  /></Card>
      </span>
      );
  }
}

export default RightHomepage;
