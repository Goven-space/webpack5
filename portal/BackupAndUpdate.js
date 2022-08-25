import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

const backupUrl=URI.CORE_HOMEPAGE.backupUrl;
const updateUrl=URI.CORE_HOMEPAGE.systemUpdateUrl;
const { Meta } = Card;

class BackupAndUpdate extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      modules:[
        {id:'backup',title:'一键备份系统',description:'一键备份本平台的所有流程、规则、配置等数据到本地'},
        {id:'update',title:"升级平台配置",description:"本地升级Jar包后必须执行本升级更新相应的Jar包配置数据"}
      ],
      sn:false,
    };
  }

  componentDidMount(){
  }

  openUrl=(item)=>{
    if(item.id=='backup'){
      AjaxUtils.showConfirm('备份系统','确认要备份本系统的所有配置数据吗?',this.backupData);
    }else if(item.id=='update'){
      AjaxUtils.showConfirm('升级程序','只有在升级了Jar包的情况下才需要执行本操作!',this.updateData);
    }
  }

  backupData=()=>{
      location.href=backupUrl;
  }

  updateData=()=>{
      this.setState({ mask: true });
      AjaxUtils.get(updateUrl, (data) => {
        if (data.state === false) {
          AjaxUtils.showError(data.msg);
        } else {
          AjaxUtils.showInfo(data.msg);
          this.setState({mask: false });
        }
      });
  }

  render() {
    let defaultImg=webappsProjectName+'/res/iconres/images/portal/designer.png';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div style={{padding:'0 60px'}}>
            <List
              grid={{  gutter: 32,  md: 4,lg: 1,  xl: 4,  xxl: 4,	column: 4}}
              dataSource={this.state.modules}
              renderItem={item => (
                <List.Item>
                  <Card
                    hoverable={true}
                    style={{
                      /* width: "288px", */
                      height: '350px',
                      margin: "0 auto 50px auto",
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      borderRadius: "10px"
                    }}
                    onClick={this.openUrl.bind(this, item)}
                  >
                    <div
                      style={{
                        textAlign: "center", margin: "15px auto 28px auto"
                      }}
                    >
                      <Avatar size={64} src={item.src || defaultImg} />
                      <p style={{ marginTop: "32px", fontSize: "20px", color: "#39caff" }}>{item.title}</p>
                    </div>
                    <hr style={{backgroundColor: "#e8e8e8",height:"1px" ,border:"none"}}/>
                    <div style={{ margin: " 0 auto", paddingTop: "32px" }}>
                      <p style={{ margin: 0, lineHeight: "25px", fontSize: "14px", color: "rgb(165 155 155)", textAlign: "left" }}>{item.description}</p>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
      </Spin>
    );
  }
}

export default BackupAndUpdate;
