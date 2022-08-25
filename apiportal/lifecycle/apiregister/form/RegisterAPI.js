import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';

const { Meta } = Card;

class RegisterAPI extends React.Component{
  constructor(props){
    super(props);
    this.registerok=this.props.registerok;
    this.state={
      mask:false,
      modules:[
      {
        id:"RegService",
        title:"Restful API",
        description:"注册后端Restful API接口",
        images:'restful.png'
      },{
        id:"RegWebService",
        title:"WebService SOAP",
        description:"注册WebService SOAP接口",
        images:'webservice.png'
      },{
        id:"RegWebServiceToRest",
        title:"WebService转Restful",
        description:"注册WebService SOAP接口并转为Restful接口",
        images:'ws2rest.png'
      },{
        id:"RegRestToWebService",
        title:"Restful转WebService",
        description:"把Restful API接口转为WebService协义发布",
        images:'rest2ws.png'
      },{
        id:"RegDubbo",
        title:"Dubbo转Restful",
        description:"注册Dubbo接口并转为Restful API",
        images:'dubbo.png'
      },{
        id:"WebSocket",
        title:"WebSocket",
        description:"注册一个WebSocket接口",
        images:'websocket.png'
      },{
      id:"JoinService",
      title:"聚合多个API",
      description:"选择多个API并聚合成为一个新的API",
      images:'join.png'
      }
    ],
    };
  }

  componentDidMount(){
  }

  openUrl=(id)=>{
    this.registerok(id);
  }

  render() {
    let defaultImg=webappsProjectName+'/res/iconres/images/portal/apiicon/';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={this.state.modules}
          renderItem={item => (
            <List.Item>
              <Card hoverable={true} style={{padding:'3px 0 3px 0',overflow:'hidden',height:'120px',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openUrl.bind(this,item.id)} >
              <Meta
                 avatar={<Badge style={{ backgroundColor: item.countColor||'#52c41a' }} ><Avatar size={64}  src={defaultImg+item.images} /></Badge>}
                 title={<b>{item.title}</b>}
                 description={item.description}
               />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    );
  }
}

export default RegisterAPI;
