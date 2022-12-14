import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import NodeColumnEventCode from './NodeColumnEventCode';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

const TabPane = Tabs.TabPane;
const getColumnsByTableName=URI.ETL.METADATAREADNODE.getFieldsByTableName;
const parsesqlColumnsUrl=URI.ETL.METADATAREADNODE.parsesqlColumns;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class MetaDataReadNodeColumns extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.applicationId=this.props.applicationId;
    this.getSqlCode=this.props.getSqlCode;
    this.ruleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    let colData=this.props.data||'[]';
    this.data=JSON.parse(colData);
    this.data.forEach((item,index,arr)=>{
      item.id=index;
    });
    this.state = {
      configFormId:'',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: this.data,
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
  }

  getTableColumns=()=>{
    return this.state.data;
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  renderConvertRuleIds(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(record.ruleName!==undefined && record.ruleName.join(",")!==''){
        return <Tag color='blue'>{record.ruleName}</Tag>;
      }else{
        return '';
      }
    }
    let data=[];
    return (<TreeNodeSelect url={this.ruleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"varchar",value:'varchar'},
      {text:"nvarchar",value:'nvarchar'},
      {text:"char",value:'char'},
      {text:"date",value:'date'},
      {text:"datetime",value:'datetime'},
      {text:"float",value:'float'},
      {text:"int",value:'int'},
      {text:"smallint",value:'smallint'},
      {text:"bigint",value:'bigint'},
      {text:"bit",value:'bit'},
      {text:"numeric",value:'numeric'},
      {text:"text",value:'text'},
      {text:"longvarchar",value:'longvarchar'},
      {text:"clob",value:'clob'},
      ];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text){return <Tag color='blue'>???</Tag>;}else{return <Tag>???</Tag>;}
    }
    let data=[{text:"???",value:true},{text:"???",value:false}];
    return (<EditSelect value={text} size='small' data={data} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=()=>{
    //???????????????
    let deleteIds=this.state.deleteIds;
    let selectedRowKeys=this.state.selectedRowKeys;
    selectedRowKeys.forEach(function(value, index, array) {
      if(value.length>10){deleteIds.push(value);}
    });
    let data=this.state.data.filter(
      (dataItem) => {
        var flag=true;
        for(var i=0;i<selectedRowKeys.length;i++){
            if(selectedRowKeys[i]===dataItem.id){
              flag=false;
            }
        }
        //if(dataItem.colId===this.keyId){flag=true;}
        return flag;
      }
    );
    this.setState({data:data,deleteIds:deleteIds});
  }

  handleChange=(key, index, value,label)=>{
    const { data } = this.state;
    data[index][key] = value;
    if(label!==undefined){
      data[index]['ruleName'] = label;
    }
    this.setState({ data });
  }
  insertRow=()=>{
    //???????????????
    let key=AjaxUtils.guid();
    let newData=this.state.data;
    let newRow={id:key,EditFlag:true,colId:'',colType:'varchar'};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  loadTableColumnsFromSql=()=>{
    //?????????????????????
    let sql=this.getSqlCode();
    let formData=this.form.getFieldsValue();
    formData.sql=sql;
    this.setState({loading:true});
    AjaxUtils.post(parsesqlColumnsUrl,formData,(data)=>{
          if(data.state===false){
            this.setState({loading:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data,loading:false});
          }
    });
  }

  loadTableColumns=()=>{
    //??????????????????
    let metaDataConfigId=this.form.getFieldValue("metaDataConfigId");
    if(metaDataConfigId===''){message.error("?????????????????????????????????????????????!");return;}
    let formData=this.form.getFieldsValue();
    this.setState({loading:true});
    AjaxUtils.post(getColumnsByTableName,formData,(data)=>{
          if(data.state===false){
            this.setState({loading:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data,loading:false});
          }
    });
  }

 updateEvnetCode=(index,code)=>{
   const { data } = this.state;
   data[index]['eventCode'] = code;
   this.setState({ data });
 }

 updateRelationConfig=(index,config)=>{
   const { data } = this.state;
   data[index]['relation'] = config;
   this.setState({ data });
 }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '??????Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '????????????',
      dataIndex: 'colName',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '????????????',
      dataIndex: 'colType',
      width:'15%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '????????????????????????',
      dataIndex: 'ruleId',
      width:'20%',
      render: (text, record, index) => this.renderConvertRuleIds(index, 'ruleId', text,record),
    },{
      title: '???????????????',
      dataIndex: 'defaultValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index, 'defaultValue', text),
    },{
      title: '??????',
      dataIndex: 'eventCode',
      width:'8%',
      render: (text, record, index) => {if(text!=='' && text!==undefined){return <Tag color='red' >???</Tag>}else{return '--';}},
    },{
      title: '??????',
      dataIndex: 'index',
      width:'5%',
      render: (text, record, index) => {return index+1;}
    }
    ];

    const expandedRow=(record,index)=>{
      return (
        <Card bodyStyle={{padding:5}} title="?????????????????????" >
            <NodeColumnEventCode record={record} index={index} updateEvnetCode={this.updateEvnetCode}  />
        </Card>
        );
    }

    return (
      <div>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button type='primary' onClick={AjaxUtils.showConfirm.bind(this,"??????????????????????","???????????????????????????????????????,?????????????????????????????????!",this.loadTableColumns.bind(this))}  icon="select"  >???????????????????????????</Button>
              <Button  onClick={AjaxUtils.showConfirm.bind(this,"???SQL?????????????","???????????????????????????????????????,?????????????????????????????????,????????????SQL??????????????????????????????!",this.loadTableColumnsFromSql.bind(this))} icon="select"  >???SQL?????????</Button>
              <Button  onClick={this.deleteRow} icon="delete"  >?????????</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >?????????</Button>
              <CloumnsFieldAction thisobj={this} />
              </ButtonGroup>
          </div>
              <Table
              bordered
              rowKey={record => record.id}
              dataSource={data}
              columns={columns}
              rowSelection={rowSelection}
              onRowClick={this.onRowClick}
              loading={this.state.loading}
              pagination={false}
              expandedRowRender={expandedRow}
              scroll={{ y: 450 }}
              size="small"
              />
      </div>
      );
  }
}

export default MetaDataReadNodeColumns;
