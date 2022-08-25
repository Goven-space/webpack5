import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Tabs,Table,Statistic,PageHeader} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import ListDataTransLog from '../../dataquality/datalog/ListDataTransLog';

//数据模模写入节点的监控数据

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl=URI.ETL.MONITOR.insnodeinfo;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.nodeObj=this.props.nodeObj;
    this.logDbName=this.props.logDbName;
    this.state={
      mask:false,
      data:[],
    };
  }

  componentDidMount(){
    this.loadInsData();
  }

  loadInsData=()=>{
        let url=PropsUrl+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId+"&logDbName="+this.logDbName;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              this.setState({data:data});
              FormUtils.setFormFieldValues(this.props.form,data);
            }
        });
  }


    refresh=(e)=>{
      e.preventDefault();
      this.loadInsData();
    }

  render() {
    let data=this.state.data;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
        <Tabs size="large">
          <TabPane  tab="数据传输统计" key="total"  >
            <center>
              <h2>节点名:{data.pNodeName}</h2>
              <span>节点Id:{data.pNodeId} 开始时间:{data.startTime} 结束时间:{data.endTime}</span>
            </center>
            <br/><br/>
            <Row>
               <Col span={4} />
               <Col span={6} >
                 <Statistic title="总流入数据量" value={data.totalInCount} prefix={<Icon type="arrow-down" />} valueStyle={{ color: '#108ee9' }} />
               </Col>
               <Col span={6}>
                 <Statistic title="总读取据量" value={data.totalReadCount}  prefix={<Icon type="arrow-up" />} valueStyle={{ color: '#108ee9' }} />
               </Col>
               <Col span={6}>
                 <Statistic title="总流出数据量" value={data.totalOutCount}  prefix={<Icon type="arrow-up" />} valueStyle={{ color: '#108ee9' }} />
               </Col>
               <Col span={2} />
             </Row>
             <br/><br/>
             <Row>
                <Col span={4} />
                <Col span={6} >
                  <Statistic title="插入成功" value={data.insertSuccessCount} prefix={<Icon type="check-circle" />} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={6}>
                  <Statistic title="更新成功" value={data.updateSuccessCount}  prefix={<Icon type="check-circle" />} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={6}>
                  <Statistic title="删除成功" value={data.deleteSuccessCount}  prefix={<Icon type="check-circle" />} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={2} />
              </Row>
              <br/><br/>
              <Row>
                 <Col span={4} />
                 <Col span={6} >
                   <Statistic title="插入失败" value={data.insertFailedCount} prefix={<Icon type="exclamation" />} valueStyle={{ color: 'orange' }} />
                 </Col>
                 <Col span={6}>
                   <Statistic title="更新失败" value={data.updateFailedCount}  prefix={<Icon type="exclamation" />} valueStyle={{ color: 'orange' }} />
                 </Col>
                 <Col span={6}>
                   <Statistic title="删除失败" value={data.deleteFailedCount}  prefix={<Icon type="exclamation" />} valueStyle={{ color: 'orange' }} />
                 </Col>
                 <Col span={2} />
               </Row>
              <br/><br/>
              <FormItem wrapperCol={{ span: 4, offset: 20 }}>
                  <Button  type="primary" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
                  <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
              </FormItem>
          </TabPane>
          <TabPane  tab="成功传输数据" key="success"  >
            <ListDataTransLog processId={this.processId} transactionId={this.transactionId} nodeId={this.nodeId} logType='0' />
          </TabPane>
          <TabPane  tab="传输失败数据" key="failed"  >
            <ListDataTransLog processId={this.processId} transactionId={this.transactionId} nodeId={this.nodeId}  logType='1' />
          </TabPane>
          <TabPane  tab="详细运行数据" key="details"  >
            <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data))} style={{minHeight:'400px',maxHeight:'550px'}} />
          </TabPane>
        </Tabs>
      </Spin>
    );
  }
}

export default Form.create()(form);
