import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Tabs,Inputm,Select,Input,Radio ,Card,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import EditSelectOne from '../../../core/components/EditSelectOne';
import AjaxSelect from '../../../core/components/AjaxSelect';
import EditServiceMoreParams from '../form/components/EditServiceMoreParams';
import EditServiceErrorCodeInner from './EditServiceErrorCodeInner';
import EditServiceResponseSample from '../form/components/EditServiceResponseSample';
import EditServiceHystrix from '../form/components/EditServiceHystrix';
import ApiQpsAndLogMonitor from '../../../monitor/charts/ApiQpsAndLogMonitor';
import APIChangeLogTimeLine from '../../apidoc/APIChangeLogTimeLine';
import OpenAPI from '../../apidoc/OpenApi';
import EditApiRules from './EditApiRules';
import EditAPIOutputParams from './EditAPIOutputParams';
import EditApiInputParams from './EditApiInputParams';
import EditApiHeadersParams from './EditApiHeadersParams';

//修改API的输入参数

const Option = Select.Option;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const GetAnnotation_URL=URI.SERVICE_PARAMS_CONFIG.getAnnotation;


class EditParamsConfigInner extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.id;
    this.appId=this.props.appId;
    this.beanId=this.props.beanId;
    this.modelId=this.props.modelId||'';
    this.annotation=this.props.annotation||'1'; //1表示显示0表示不显示
    this.hystrix=this.props.hystrix||'1'; //1表示显示0表示不显示
    this.openapi=this.props.openapi||'1'; //1表示显示0表示不显示
    this.record=this.props.record||{}; //api对像
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currnetEditRow:{},
      visible:false,
      annotationStr:'',
      width:800,
    };
  }

  componentDidMount(){
    this.updateSize();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-50;
    this.setState({width:width});
  }

  //生成注解代码
  getAnnotation=()=>{
    let url=GetAnnotation_URL+"?configId="+this.configId;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      let paramsStr="";
      if(data.state){
          paramsStr=data.paramsStr;
      }else{
          paramsStr="注解代码生成出错,请查看后台日记";
      }
      this.setState({annotationStr:paramsStr,loading:false});
    });
  }

  onTabChange=(key)=>{
    if(key==='AnnotationConfig'){
      this.getAnnotation();
    }
  }


  render() {
    return (
      <div style={{width:this.state.width}} >
        <Tabs defaultActiveKey="ParamsConfig" onChange={this.onTabChange} size='large'  >
          <TabPane tab="输入参数" key="inparamsCode">
            <EditApiInputParams id={this.configId}  appId={this.appId} />
          </TabPane>
          <TabPane tab="输出参数" key="outparamsCode">
            <EditAPIOutputParams id={this.configId}  appId={this.appId} />
          </TabPane>
          <TabPane tab="Header" key="headers">
              <EditApiHeadersParams ref="HeaderConfig" id={this.configId}  appId={this.appId}/>
          </TabPane>
          <TabPane tab="错误码" key="errorCode">
            <EditServiceErrorCodeInner id={this.configId}  appId={this.appId} />
          </TabPane>
          <TabPane tab="更多配置" key="responseSample">
            <EditServiceResponseSample id={this.configId} />
          </TabPane>
          <TabPane tab="控制规则" key="bandingRule">
            <EditApiRules id={this.configId} />
          </TabPane>
          {this.annotation==='1'?
            <TabPane tab="生成代码" key="AnnotationConfig">
              <Input.TextArea value={this.state.annotationStr} autosize />
            </TabPane>
          :''}
          <TabPane tab="变更日志" key="ChangeLog">
            <APIChangeLogTimeLine serviceId={this.configId} />
          </TabPane>
          <TabPane tab="调用日志" key="ApiQps">
            <ApiQpsAndLogMonitor id={this.configId} />
          </TabPane>
        </Tabs>
      </div>
      );
  }
}

export default EditParamsConfigInner;
