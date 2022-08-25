import React from 'react';
import {Row,Col,Card} from 'antd';
import TestOverRate from './TestOverRate';

class Home extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
    };
  }

  render() {
    return (
        <Row>
          <Col span={12}>
            <TestOverRate appId={this.appId} ></TestOverRate>
          </Col>
          <Col span={12}>
          </Col>
        </Row>
    );
  }
}

export default Home;
