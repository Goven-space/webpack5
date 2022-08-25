import React from 'react';
import ReactDOM from 'react-dom';
import {Button,Modal,Tag} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ListServiceControlStrategySelect from '../GridComponents/ListServiceControlStrategySelect';

//服务控制策略选择
class ServiceControlPlugsSelect extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      data:props.data||[],
      visible:false,
    }
  }
  componentDidMount=()=>{

  }
  getSelectedRows=()=>{
    return JSON.stringify(this.state.data);
  }
  setSelectedRows=(jsonData)=>{
    this.setState({data:jsonData});
  }
  showModal=(action)=>{
    this.setState({visible: true});
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }
  handleChange=(value)=>{
    this.props.onChange(value);
  }

  //保存选择的行
  saveSelectedRows=(item)=>{
      //调用子窗口获取已经选中的行
      let selectedRows=this.refs.SelectRowsModel.getSelectedRows();
      console.log(selectedRows);
      let stateData=this.state.data;
      selectedRows.forEach((item)=>{
        if(!this.hadSelectedRow(stateData,item)){
          let paramsValue=item.paramsValue;
          if(paramsValue===undefined){paramsValue='';}
          stateData.push({configName:item.configName,configId:item.configId,paramsValue:paramsValue});
        }
      });
      this.setState({data:stateData,visible:false});
  }

  hadSelectedRow=(stateData,rows)=>{
    let r=false;
    stateData.forEach((item)=>{
      if(item.configId===rows.configId){
        r=true;
      }
    });
    return r;
  }

  onCloseTag=(configId)=>{
    let stateData=this.state.data.filter((item)=>{
      return item.configId!==configId;
    });
    this.setState({data:stateData});
  }

  render() {
    //console.log("ajaxselect render");
    let jsonTag=this.state.data.map((item)=>{
        let showItem;
        if(item.paramsValue!=='' && item.paramsValue!==undefined  && item.paramsValue!==null){
          showItem=item.configName+"("+item.paramsValue+')';
        }else{
          showItem=item.configName;
        }
        return (
          <div key={item.configId}>
            <Tag color='orange'  closable={true} onClose={this.onCloseTag.bind(this,item.configId)} >
            {showItem}
            </Tag>
          </div>
          );
      });

    return (<div><Modal key={Math.random()} title='选择服务控制策略' maskClosable={false}
              width='1200px'
              style={{ top: 20 }}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onOk={this.saveSelectedRows}
              cancelText='关闭'
              okText="确定"
              >
              <ListServiceControlStrategySelect ref='SelectRowsModel' closeModal={this.closeModal} />
            </Modal>
            {jsonTag}<Button onClick={this.showModal} size="small" >添加控制策略</Button></div>);
  }
}

export default ServiceControlPlugsSelect;
