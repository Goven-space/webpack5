import React from 'react';
import {Button, Spin,Select,Icon,Input} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'

class ShowLog extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.state={
    };
  }

  render() {
    let record=this.record;
    // console.log(record);
    return (
      <div>
        <p><b>请求URL:</b>{record.requestUrl}</p>
        <ReactJson src={record} />
      </div>
    );
  }
}

export default ShowLog;
