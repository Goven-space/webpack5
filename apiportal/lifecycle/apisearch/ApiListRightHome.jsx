import React from 'react';
import {Icon,Radio,Button} from 'antd';
import ListApiByAppId_card from './ListApiByAppId_card'; //已发布的
import ListApiByAppId_List from './ListApiByAppId_List';


//API列表和图表模式切换页

const ButtonGroup = Button.Group;

class ApiListRightHome extends React.Component {
  constructor(props) {
    super(props);
    this.state={
        appId:this.props.appId||'',
        action:1,
        categoryId:this.props.categoryId||'*',
        businessClassIds:this.props.businessClassIds||'',
        tags:this.props.tags||'',
      }
  }

  componentDidMount(){
  }

  componentWillReceiveProps=(nextProps)=>{
    if(nextProps.categoryId!==this.state.categoryId || nextProps.appId!==this.state.appId || nextProps.businessClassIds!==this.state.businessClassIds || nextProps.tags!==this.state.tags){
        this.setState({categoryId:nextProps.categoryId,appId:nextProps.appId,businessClassIds:nextProps.businessClassIds,tags:nextProps.tags});
    }
  }

  setAction=(e)=>{
    let value=e.target.value;
    this.setState({action:value});
  }

  render(){
    return (
      <div >
        <center><Radio.Group  value={this.state.action} onChange={this.setAction} >
          <Radio.Button  value={1} >卡片模式 </Radio.Button>
          <Radio.Button  value={2} >列表模式</Radio.Button>
        </Radio.Group>
        </center>
        {this.state.action==1?
          <ListApiByAppId_card categoryId={this.state.categoryId} appId={this.state.appId} businessClassIds={this.state.businessClassIds} tags={this.state.tags} />
          :
          <ListApiByAppId_List categoryId={this.state.categoryId}  appId={this.state.appId} businessClassIds={this.state.businessClassIds} tags={this.state.tags}  />
        }
      </div>
    );
  }
}

export default ApiListRightHome;
