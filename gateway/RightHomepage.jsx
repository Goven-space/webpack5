import React from 'react';
import {Table,Card,Icon,Row,Col,Tag,Avatar,Divider} from 'antd';
import ApiGatewayAccessChart from './monitor/ApiGatewayAccessChart';
import { browserHistory } from 'react-router'

class RightHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      mask:true,
    };
  }

  render(){
    return (
           <ApiGatewayAccessChart />
    );
  }
}

export default RightHomepage;
