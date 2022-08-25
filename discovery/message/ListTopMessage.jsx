import React from 'react';
import {Card,Icon,Modal,Row,Col,Tag,List,Avatar } from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import { browserHistory } from 'react-router'

const LIST_URL=URI.LIST_REGSERVER_MESSAGE.list_top;
const basePath=URI.rootPath;

class ListTopMessage extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL.replace("{num}","5");
    this.state={
      loading:true,
      currentId:'',
      visible:false,
      list:[]
    }
  }

  componentDidMount(){
    this.setState({loading:true});
    AjaxUtils.get(this.url,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({list:data,loading:false});
        }
    });
  }

  renderActivities() {
    return this.state.list.map((item) => {
      let text=item.type;
      let color="#f56a00";
      if(text==='1'){
        text="上线";
        color="#87d068";
      }else if(text==='0'){
        text="失效";
        color="#f50";
      }
      return (
        <List.Item key={item.id}>
          <List.Item.Meta
            avatar={<Avatar style={{ backgroundColor:color, verticalAlign: 'middle' }} size="large">{text}</Avatar>}
            title={<span ><a  style={{fontSize:'12px'}} >{item.title}</a></span>}
            description={
              <span  >
                发生于 {item.createTime}
              </span>
            }
          />
        </List.Item>
      );
    });
  }

  render(){
    return (
      <div>
        <Card
          bodyStyle={{ padding:0}}
          style={{minHeight:'480px'}}
          bordered={false}
          title="系统消息"
          loading={this.state.loading}
        >
        <div style={{marginLeft:25}}>
          <List loading={false} size="large">
            <div >
              {this.renderActivities()}
            </div>
          </List>
        </div>
        </Card>
        </div>
    );
  }
}

export default ListTopMessage;
