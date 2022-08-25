import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Spin,Tag,Icon,Modal,Card,Input,Tabs,Table} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import OpenApi from '../../designer/apidoc/OpenApi';
import APIChangeLogTimeLine from './APIChangeLogTimeLine';
import QRCode  from 'qrcode.react';

//API开发中显示API文档

const serviceDetails=URI.CORE_APIPORTAL_APICONFIG.showDesignerDetails; // 显示服务的详细信息
const TabPane = Tabs.TabPane;

class ShowApiDocForDev extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.id;
    this.state={
      mask:false,
      visible:false,
      serviceData:{demoCode:''},
      action:'',
      width:800,
    };
  }

  componentDidMount(){
    this.updateSize();
    // window.addEventListener('resize', () => this.updateSize());
    this.loadData();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-100;
    this.setState({width:width});
  }

  loadData=()=>{
      this.setState({mask:true});
      //载入服务文档说明
      let url=serviceDetails;
      AjaxUtils.getjson(url,{id:this.serviceId},(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({serviceData:data});
            //格式化json
            let obj=document.getElementById(this.serviceId+"_responseSample");
            if(obj!==undefined  && obj!==null ){
              obj.innerHTML=AjaxUtils.formatJsonToHtml(obj.innerText);
            }
            obj=document.getElementById(this.serviceId+"_failResponseSample");
            if(obj!==undefined  && obj!==null ){
              obj.innerHTML=AjaxUtils.formatJsonToHtml(obj.innerText);
            }
            obj=document.getElementById(this.serviceId+"_requestBodySampleStr");
            if(obj!==undefined && obj!==null){
              obj.innerHTML=AjaxUtils.formatJsonToHtml(obj.innerText);
            }
          }
      });
  }

  render() {
    let serviceData=this.state.serviceData;
    return (
      <div style={{width:this.state.width}} >
        <Spin spinning={this.state.mask} tip="Loading..." >
        <Tabs defaultActiveKey="ApiDoc" onChange={this.onTabChange} size='large'  >
            <TabPane tab="API说明文档" key="ApiDoc" animated={false} style={{width:'100%'}} >
                <div dangerouslySetInnerHTML={{__html:serviceData.htmlCode}} ></div>
            </TabPane>
            <TabPane tab="OpenAPI" key="OpenApi" animated={false}>
                    <OpenApi serviceId={this.serviceId}  />
            </TabPane>
        </Tabs>
        </Spin>
      </div>
    );
  }
}

export default ShowApiDocForDev;
