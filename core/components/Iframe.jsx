import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Icon, Button, Layout, Menu, Card } from 'antd';

export default class Index extends React.Component {

  constructor(props){
    super(props);
    this.url=this.props.url;
    console.log(this.url);
    this.state = {
        iFrameHeight: '700px'
    }
}

  render() {
    return (
      <iframe
                style={{width:'100%', height:this.state.iFrameHeight, overflow:'visible'}}
                onLoad={() => {
                    const obj = ReactDOM.findDOMNode(this);
                    this.setState({
                        "iFrameHeight":  obj.contentWindow.document.body.scrollHeight + 'px'
                    });
                }}
                ref="iframe"
                src={this.url}
                width="100%"
                height={this.state.iFrameHeight}
                scrolling="no"
                frameBorder="0"
            />
    );
  }
}
