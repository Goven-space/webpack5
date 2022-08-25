import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Select,Tabs,Modal,Form,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import ShowLogDetails from '../log/ShowLogDetails';
import AjaxSelect from '../../core/components/AjaxSelect';
import moment from 'moment';
import SaveQuery from './form/SaveQuery';
import QueryHistory from './QueryHistory';

const LIST_LOGDB=URI.LIST_MONITOR_CENTER.selectLogDb;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const businessLogFieldUrl = URI.CORE_BUSINESSLOG_APPCONFIG.listAll;//业务日志字段管理列表
const apiLogList=URI.CORE_BUSINESSLOG_APPCONFIG.apiLogList;
const quickHistoryQueryList = URI.CORE_BUSINESSLOG_APPCONFIG.quickHistoryQueryList;
const quickHistoryQuerySave = URI.CORE_BUSINESSLOG_APPCONFIG.quickHistoryQuerySave;

//const businessLogFieldCodeUrl = URI.
//监控中心-> API调用日志
class BusinessApiLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate='',
    this.endDate='',
    this.userId=this.props.userId||'';
    this.logType=this.props.logType||'0';
    //this.logType='2';
     this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      serverId:'',
      logDbName:'',
      columnsHeader:[],
      businessLogFieldData:[],
      updateId:"",
      updateName:"",
    }
  }

  componentDidMount(){
    this.loadBusinessLogFeild();
    this.loadData();
  }


  //通过ajax远程载入  业务日志字段数据
  loadBusinessLogFeild=()=>{
    this.setState({loading:true});
    let url = businessLogFieldUrl;
    AjaxUtils.get(url,(data)=>{
      let columns = [];
      data.sort(this.sortIndex);
      for(var index in data){
        if(data[index].tableHeader==='1'){
          var column = {title:"",dataIndex:""};
          column.title = data[index].fieldDes;
          column.dataIndex= data[index].field;
          column.width = data[index].tableHeaderWidth+'%';
          columns.push(column);
        }
      }
      this.setState({columnsHeader:columns,businessLogFieldData:data});
    });
  }

  sortIndex = (a,b)=>{
    return a.tableHeaderIndex-b.tableHeaderIndex;
 }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.setState({pagination:pagination},()=>{
      this.search();
    });
  }

  search=(save,saveName)=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let sorter={};
          let searchFilters={};
          let filters={};
          let condition = [];//搜索条件
          //Filters.and(Filters.eq("userId","admin"),Filters.eq("ip","127.0.0.1"));
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined && v!==''){
                let values = [];
                let info = key.split("_");
                let fieldName  =  info[0];
                if(fieldName!=='logDbName'){
                  let findType  =  info[1];
                  let queryType  =  info[2];
                  if(queryType === 'date'){
                    v = moment(v).format("YYYY-MM-DD HH:mm:ss");
                    values[key] = v;
                  }
                  let conditionField = "Filters.".concat(findType).concat("(\"").concat(fieldName).concat("\",\"").concat(v).concat("\")");
                  condition.push(conditionField)
                }
              }
            }
          );
          let apiLogListUrl = apiLogList+"?logDbName="+this.props.form.getFieldValue('logDbName');
          let queryCondition = "";
          if(condition.length>0){
            queryCondition = "Filters.and(".concat(condition.toString()).concat(")");
            apiLogListUrl = apiLogListUrl + "&condition=" + queryCondition;
          }
          filters.logType=[this.logType];
          if(save==='true'){
            let postData = {"quickQueryName":saveName,"formInfo":JSON.stringify(values),"condition":queryCondition}
            let  endUrl  = quickHistoryQuerySave;
            //更新操作
            if(this.state.updateId!==''){
              endUrl = endUrl+"?id="+this.state.updateId;
            }
            AjaxUtils.post(endUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }
            });
          }
          GridActions.loadData(this,apiLogListUrl,this.state.pagination,filters,sorter,searchFilters);
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }



  //通过ajax远程载入数据
  loadData=()=>{
    this.search();
  }

  handleChange=(e)=>{
    this.userId=e.target.value;
  }
  serverChange=(value)=>{
    this.setState({serverId:value});
  }
  onStartDateChange=(date, dateString)=>{
    this.startDate=dateString;
  }

  onEndDateChange=(date, dateString)=>{
    this.endDate=dateString;
  }

  logDbChange=(dbName)=>{
    this.setState({logDbName:dbName});
  }


  handleCancel=(e)=>{
    this.setState({visible: false,});
  }


  closeSaveModal=(reLoadFlag,name,type,action)=>{
    this.setState({visible: false,});
    if(reLoadFlag===true){
      if(action=='new'){
        this.setState({"updateId":"","updateName":""},()=>{
          this.search('true',name);//保存并查询
          this.setState({"updateId":"","updateName":""})
        })
      }else{
        this.search('true',name);//保存并查询
        this.setState({"updateId":"","updateName":""})
      }
    }
  }



  closeQuickModal=(reLoadFlag,row,type,updateId,updateName)=>{
    this.setState({visible: false,});
    if(reLoadFlag===true){
      let formInfo = JSON.parse(row.formInfo)
      for(let key in formInfo){
        let type =  key.split("_")[2];
        if(type ==='date'){
          formInfo[key] = moment(formInfo[key],'YYYY-MM-DD HH:mm:ss')
        }
      }
      this.props.form.setFieldsValue(formInfo);
      this.search('false','');//查询
      this.setState({"updateId":row.id,"updateName":row.quickQueryName});
    }
  }





  onActionClick=(action,record,url)=>{
    if(action==="New" || action==="quick"){
      this.setState({visible: true,updateName:this.state.updateName,action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action = 'cancel'){
      this.props.form.resetFields();
      this.setState({"updateId":"","updateName":""});
      this.search('false','');//查询
    }
  }

    /**
   * 根据后台返回的 data 中 type 类型生成不同的组件
   * @param item  json
   * @param Component
   */
  switchItem(item) {
      const type = item.queryType;
      switch (type) {
        case 'int':
          return <InputNumber  />;
          break;
        case 'char':
          return <Input />;
          break;
        case 'date':
          return <DatePicker format="YYYY-MM-DD HH:mm:ss"   />;
          break;
        case 'select':
          return (
            <Select>
            {
              item.options.map((option, index) => {
                return (<Option key={index} value={option}>{option}</Option>)
              })
            }
            </Select>
          )
        default:
          return <Input />;
          break;
      }
  }

  render(){
    const {rowsData,pagination,selectedRowKeys,loading,updateName}=this.state;
    const columns=this.state.columnsHeader;
    const { getFieldDecorator } = this.props.form;
    const expandedRow=(record)=>{
      return (<ShowLogDetails record={record} logDbName={this.state.logDbName} />);
    }


    let formContent,title;
    if(this.state.action==='New'){
      title='保存条件并查询';
      formContent=<SaveQuery  close={this.closeSaveModal} updateName={updateName}/>;
    }else if(this.state.action==='quick'){
      title='快捷查询';
      formContent=(<QueryHistory  close={this.closeQuickModal} />);
    }
    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
        <Modal key={Math.random()} title="字段属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='750px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {formContent}

        </Modal>
        <Form layout='inline' colon>
          <Row>
            <Col span={8} key='logDbName' align='left'>
              <FormItem key='99' label='日志库'>
                {
                  getFieldDecorator('logDbName',{initialValue:'RC_ApiLog'})(
                    <AjaxSelect url={LIST_LOGDB} onChange={this.logDbChange}  valueId='dbName' textId='dbName' options={{showSearch:true,style:{minWidth:'230px'} }} />
                  )
                }
              </FormItem>
            </Col>
            {
              this.state.businessLogFieldData.map((item, index) => {
                if(item.queryCondition==='1'){
                  // type 为 date 日期格式需要强制转化为 moment 格式
                  return (
                      <Col span={8} key={item.field+"_"+item.queryConditionType} align='left'>
                        <FormItem key={index} label={item.fieldDes}>
                          {
                            getFieldDecorator(item.field+"_"+item.queryConditionType+"_"+item.queryType)(
                              this.switchItem(item)
                            )
                          }
                        </FormItem>
                      </Col>
                  )
                }
              })
            }
          </Row>
          <Row >
              <Col align='right' span={20} style={{marginTop:'10px'}}>
                <Button  type="primary"  icon="search"  onClick={this.search}>查询</Button>{' '}
                <Button  type="primary"  icon="search"  onClick={this.onActionClick.bind(this,'quick')}>快捷查询</Button>{' '}
                <Button  style={{display:this.state.updateId!==""?"":"none"}}  type="primary"  icon="search"  onClick={this.onActionClick.bind(this,'cancel')}>取消快捷查询</Button>{' '}
                <Button  type="primary"  icon="save"   onClick={this.onActionClick.bind(this,'New')}>保存并查询</Button>{' '}
              </Col>
          </Row>
        </Form>
        </Card>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}
export default Form.create()(BusinessApiLog);
