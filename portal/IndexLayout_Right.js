import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge,Collapse} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import Set_NewSN from '../core/setting/form/NewSN';

const loadDataUrl=host+"/rest/base/portal/modules/level/2"; //URI.CORE_HOMEPAGE.GetPortalModules;
const { Meta } = Card;
const { Panel } = Collapse;


class IndexLayout_Right extends React.Component{
  constructor(props){
    super(props);
    this.state={
      categoryId:this.props.categoryId||'api',
      mask:false,
      data:[],
      sn:false,
    };
  }

  componentDidMount(){
    this.setState({mask:true});
    AjaxUtils.get(loadDataUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
          if(data.errcode==500){
            this.setState({sn:true});
          }
        }else{
          this.setState({data:data});
        }
    });
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.state.categoryId!==nextProps.categoryId){
      this.setState({categoryId:nextProps.categoryId});
    }
  }

  openUrl=(item)=>{
    let id=item.id;
    let url=URI.rootPath+"/"+id;
    if(id==='help'){
      window.open(host+"/rest/base/system/help");
    }else if(item.target==="_blank"){
      window.open(item.href);
    }else if(item.target==="_self"){
      location.href=item.href;
    }else{
      let openurl="";
      if(item.url==undefined || item.url==''){
        openurl=window.location.protocol+"//"+window.location.host+url;
      }else{
        openurl=item.url;
      }
      window.open(openurl);
    }
  }

  render() {
    let defaultImg=webappsProjectName+'/res/iconres/images/portal/designer.png';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        {this.state.sn==true?
          <Set_NewSN />
        :
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={this.state.data[this.state.categoryId]}
              renderItem={item => (
                <List.Item>
                  <Card hoverable={true} style={{height:'115px',overflow:'hidden',padding:'3px 0 3px 0',zIndex:1,borderRadius:'6px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openUrl.bind(this,item)} >
                  <Meta
                     avatar={<Badge count={item.count} overflowCount={999}  style={{ backgroundColor: item.countColor||'#52c41a' }} ><Avatar size={58}  src={item.src||defaultImg} /></Badge>}
                     title={<b>{item.title}</b>}
                     description={item.description}
                   />
                  </Card>
                </List.Item>
              )}
            />
      }
      </Spin>
    );
  }
}

export default IndexLayout_Right;
