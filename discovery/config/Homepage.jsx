import React from 'react';
import {Table,Card,Icon,Row,Col,Tag,Avatar,Divider} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import { browserHistory } from 'react-router'

const LISTURL=URI.LIST_CONFIG_APPLICATION.listAllForHome;

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.openApp=this.props.onMenuSelected;
    this.state={
      appList:[],
      mask:true,
    }
  }

  componentDidMount(){
  	this.loadData();
  }

   loadData=()=>{
  	this.setState({mask:true});
	   AjaxUtils.get(LISTURL,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({appList:data,mask:false});
          }
      });
	}

  render(){

    let appCard=this.state.appList.map(item=>{
        let countSpan=item.envCountData.map(itemCount=>{
          return (<span key={itemCount.text}>{itemCount.text}<span style={{color:"#108ee9"}}>({itemCount.value})</span> <Divider type="vertical" /></span>);
        });

         return (
         <Card.Grid  key={item.configAppId} style={{maxHeight:'170px'}}>
            <Card bodyStyle={{ padding: 0,fontSize:'14px' }} bordered={false} onClick={this.openApp.bind(this,item.configAppId)}>
              <Card.Meta
                title={(
                  <div>
                    <Avatar style={{ backgroundColor:"#2db7f5", verticalAlign: 'middle' }} size="large" >{item.total}</Avatar>
                    {' '} {item.configAppName}
                  </div>
                )}
                description={countSpan}
              />
            <br/>
              <div style={{float:'right',color:'#ccc',fontSize:'12px'}}>
                开发者:{item.designer}
              </div>
            </Card>
          </Card.Grid>);
        });

    return (
      <div>
        <Card
              style={{ marginLeft:'20px',marginRight:"20px",marginTop:'5px',padding:'2px' }}

              bordered={false}
              loading={this.state.mask}
              bodyStyle={{ padding: 0 }}
         >
           {appCard}
       </Card>
        </div>
    );
  }
}

export default Homepage;
