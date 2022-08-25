import React from 'react';
import {Button, Spin,Select,Icon,Input} from 'antd';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'
import * as URI from '../../../core/constants/RESTURI';

const JSONBODY_URL=URI.CORE_MasterData.jsonBody;

class ShowMasterDataJsonBody extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.state={
      record:{}
    };
  }

  componentDidMount(){
      this.getJsonBody();
  }

  getJsonBody=()=>{
    let url=JSONBODY_URL+"?id="+this.id;
    AjaxUtils.get(url,(data)=>{
      this.setState({record:data});
    })
  }

  render() {
    return (
      <div>
        <ReactJson src={this.state.record} />
      </div>
    );
  }
}

export default ShowMasterDataJsonBody;
