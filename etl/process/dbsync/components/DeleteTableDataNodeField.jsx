import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,message} from 'antd';
import AppSelect from '../../../../core/components/AppSelect';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import NodeColumnEventCode from '../../read/components/NodeColumnEventCode';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

//删除对比时的字段配置

const TabPane = Tabs.TabPane;
const getColumnsByTableName=URI.ETL.SQLREADNODE.getFieldsByTableName;
const parsesqlColumnsUrl=URI.ETL.SQLREADNODE.parsesqlColumns;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class DeleteTableDataNodeField extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.applicationId=this.props.applicationId;
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
      targetColumnsData:[],
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

    renderSourceColId(index, key, text,record) {
      if(index!==this.state.curEditIndex){
          return text;
      }

      //已经选过的字段不再显示
      let sourceDataListJson=this.state.targetColumnsData;
      let targetDataSourceIdDatas=this.state.data.map(item=>{return item.targetColId}); //已经配置的字段列
      let newData=sourceDataListJson.filter(item=>{
          return targetDataSourceIdDatas.indexOf(item.colId)==-1;
        }
      );
      let selectData=[];
      newData.forEach((item, i) => {
        selectData[i]=item.colId;
      });

      return (<EditSelect value={text} data={selectData} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
    }

    //自动匹配原字段
    autoMapping=()=>{
      let sourceDataListJson=this.state.targetColumnsData;
      let targetDataListJson=this.state.data; //所有目标字段列表
      targetDataListJson.forEach((item, i) => {
        for(var x=0;x<sourceDataListJson.length;x++){
          if(sourceDataListJson[x].colId.toLowerCase()==item.colId.toLowerCase()){
            item.targetColId=item.colId;
          }
        }
      });
      this.setState({data:targetDataListJson});
    }


  renderFieldType(index, key, text,record) {
    let digits=record.digits;
    if(index!==this.state.curEditIndex){
      if(digits!==undefined && digits!=='' && digits!==0){
        return text+"["+record.colLength+","+record.digits+"]";
      }else{
        return text+"["+record.colLength+"]";
      }
    }
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


  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  renderConflictMode(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text===1){return <Tag color='blue'>仅插入时更新</Tag>;}
      else if(text===2){return <Tag color='red'>禁止更新</Tag>;}
      else {return '-';}
    }
    if(text===''){text=0;}
    return (
      <Select value={text} size='small'  onChange={(value)=>this.handleChange(key,index,value)} style={{minWidth:'100px'}}  >
       <Option value={0} >同步更新</Option>
       <Option value={2} >禁止更新</Option>
      </Select>
    );
  }

  deleteRow=()=>{
    //删除选中行
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
    //新增加一行
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

  //载入目标表中的字段
  getSourceTableColumns=()=>{
    let formData=this.form.getFieldsValue();
    formData.dbConnId=formData.dbConnId;
    formData.tableName=formData.tableName;
    this.setState({loading:true});
    AjaxUtils.post(getColumnsByTableName,formData,(data)=>{
          if(data.state===false){
            this.setState({loading:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({targetColumnsData:data,loading:false});
          }
    });
  }

  //载入源表中的字段
  loadTableColumns=()=>{
    let targetTableName=this.form.getFieldValue("tableName");
    if(targetTableName===''){message.error("请先指定目标数据库表名再执行本操作!");return;}
    let tableName=this.form.getFieldValue("deleteTableName");
    if(tableName===''){message.error("请先指定源数据库表名再执行本操作!");return;}
    let formData=this.form.getFieldsValue();
    formData.dbConnId=formData.deleteConnId;
    formData.tableName=formData.deleteTableName;
    this.setState({loading:true});
    AjaxUtils.post(getColumnsByTableName,formData,(data)=>{
          if(data.state===false){
            this.setState({loading:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data,loading:false});
          }
    });
    this.getSourceTableColumns(); //载入目标表中的字段
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '源字段Id',
      dataIndex: 'colId',
      width:'30%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '源字段类型',
      dataIndex: 'colType',
      width:'20%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text,record),
    },{
      title: '目标字段Id',
      dataIndex: 'targetColId',
      width:'20%',
      render: (text, record, index) => this.renderSourceColId(index, 'targetColId', text),
    },{
      title: '比较字段',
      dataIndex: 'primaryKey',
      width:'10%',
      render: (text, record, index) => this.renderCheckBox(index, 'primaryKey', text),
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    }
    ];

    return (
      <div>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button type='primary' onClick={AjaxUtils.showConfirm.bind(this,"导入表字段?","如果当前已经有字段配置数据,导入字段会丢失现有数据!",this.loadTableColumns.bind(this))}  icon="select"  >从源表中读入</Button>
              <Button  onClick={this.autoMapping} icon="file"  >自动匹配</Button>
              <Button  onClick={this.deleteRow} icon="delete"  >删除字段</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增字段</Button>
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
              scroll={{ y: 450 }}
              size="small"
              />
              提示:如果源目标字段Id相同则可以不用配置目标字段
      </div>
      );
  }
}

export default DeleteTableDataNodeField;
