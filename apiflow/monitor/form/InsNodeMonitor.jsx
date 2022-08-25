import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Tabs,Table} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import DyAjaxSelect from '../../../core/components/DyAjaxSelect';
import AppSelect from '../../../core/components/AppSelect';
import ReactJson from 'react-json-view'

//监控节点的任务执行数据

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsInsUrl=URI.ESB.CORE_ESB_MONITOR.insnodeinfo;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.nodeObj=this.props.nodeObj;
    this.state={
      mask:false,
      rowsData:[],
      details:{},
    };
  }

  componentDidMount(){
    this.loadNodePropsData();
  }

  loadNodePropsData=()=>{
        let url=PropsInsUrl+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId;
        this.setState({mask:true});
        AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              this.setState({rowsData:data.rows,requestBody:data.requestBody,responseBody:data.responseBody,details:data.details});
            }
        });
  }


    refresh=(e)=>{
      e.preventDefault();
      this.loadNodePropsData();
    }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const columns=[
      {
        title: '参数名称',
        dataIndex: 'text',
        width:'20%',
        render: (text,record) => {return <b>{text}</b>}
      },{
        title: '运行数据',
        dataIndex: 'value',
        width: '80%',
      }];

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="节点运行数据" key="props"  >
            <Table
              bordered={false}
              pagination={false}
              rowKey={record => record.id}
              dataSource={this.state.rowsData}
              columns={columns}
            />
          </TabPane>
          {this.state.requestBody==undefined?'':
          <TabPane  tab="输入参数" key="requestBody"  >
            <Input.TextArea value={AjaxUtils.formatJson(this.state.requestBody)} style={{minHeight:'400px',maxHeight:'550px'}} />
          </TabPane>
          }
          {this.state.responseBody==undefined?'':
          <TabPane  tab="执行结果" key="responseBody"  >
            <Input.TextArea value={AjaxUtils.formatJson(this.state.responseBody)} style={{minHeight:'400px',maxHeight:'550px'}} />
          </TabPane>
          }
          <TabPane  tab="详细运行数据" key="details"  >
            <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.details))} style={{minHeight:'400px',maxHeight:'550px'}} />
          </TabPane>

        </Tabs>
        <br></br>
        <center>
              <Button  type="primary" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
              <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </center>
        </Form>
      </Spin>
    );
  }
}

export default  Form.create()(form);
