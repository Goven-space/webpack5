import React from 'react';
import ReactDOM from 'react-dom';
import {Button,Card,Modal,Icon,Select,Tag,Radio,Table} from 'antd';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import NodeColumnEventCode from '../../read/components/NodeColumnEventCode';
import UploadExcelFile from './UploadExcelFile';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

const getColumnsByTableName=URI.ETL.METADATAREADNODE.getFieldsByTableName;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class ExcelReadNodeColumns extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.data=JSON.parse(this.props.tableColumns);
    this.ruleSelectUrl=ruleSelectUrl+"?applicationId="+this.props.applicationId;
    this.data.forEach((item,index,arr)=>{
      item.id=index;
    });
    this.state = {
      configFormId:'',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: this.data,
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
      if(text){return <Tag color='blue'>是</Tag>;}else{return <Tag>否</Tag>;}
    }
    let data=[{text:"是",value:true},{text:"否",value:false}];
    return (<EditSelect value={text} size='small' data={data} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=()=>{
    //删除选中行
    let selectedRowKeys=this.state.selectedRowKeys;
    let data=this.state.data.filter(
      (dataItem) => {
        var flag=true;
        for(var i=0;i<selectedRowKeys.length;i++){
            if(selectedRowKeys[i]===dataItem.id){
              flag=false;
            }
        }
        return flag;
      }
    );
    this.setState({data:data});
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
    //新增加一行
    let key=AjaxUtils.guid();
    let newData=this.state.data;
    let newRow={id:key,EditFlag:true,colId:'',colType:'string'};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }


  loadTableColumns=(data)=>{
    this.setState({data:data,visible: false});
  }

 updateEvnetCode=(index,code)=>{
   const { data } = this.state;
   data[index]['eventCode'] = code;
   this.setState({ data });
 }

 showExcelForm=(e)=>{
     this.setState({visible: true,});
 }

 handleCancel=(e)=>{
     this.setState({visible: false,});
 }

 upRecord = (arr, index) =>{
   if(index === 0) {return;}
   arr[index] = arr.splice(index - 1, 1, arr[index])[0];
 }

 downRecord = (arr, index) => {
   if(index === arr.length -1) {return;}
   arr[index] = arr.splice(index + 1, 1, arr[index])[0];
 }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '中文说明',
      dataIndex: 'colName',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '数据类型',
      dataIndex: 'colType',
      width:'15%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '绑定数据转换规则',
      dataIndex: 'ruleId',
      width:'20%',
      render: (text, record, index) => this.renderConvertRuleIds(index, 'ruleId', text,record),
    },{
      title: '设定缺省值',
      dataIndex: 'defaultValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index, 'defaultValue', text),
    },{
      title: '顺序',
      dataIndex: 'sort',
      width:'6%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    },{
      title: '事件',
      dataIndex: 'eventCode',
      width:'8%',
      render: (text, record, index) => {if(text!=='' && text!==undefined){return <Tag color='red' >有</Tag>}else{return '--';}},
    }
    ];

    const expandedRow=(record,index)=>{
      return (
        <Card bodyStyle={{padding:5}} title="字段格式化事件" >
            <NodeColumnEventCode record={record} index={index} updateEvnetCode={this.updateEvnetCode}  />
        </Card>
        );
    }

    return (
      <div>
          <Modal key={Math.random()} title='上传Excel文件' maskClosable={false}
              visible={this.state.visible}
              footer=''
              width='760px'
              onOk={this.handleCancel}
              onCancel={this.handleCancel} >
              <UploadExcelFile sheetName={this.form.getFieldValue("sheetName")} loadTableColumns={this.loadTableColumns} />
          </Modal>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button type='primary' onClick={this.showExcelForm}  icon="select"  >从Excel中分析字段</Button>
              <Button  onClick={this.deleteRow} icon="delete"  >删除列</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增列</Button>
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

export default ExcelReadNodeColumns;
