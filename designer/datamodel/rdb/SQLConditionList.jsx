import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card,Icon,Divider} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelectOne from '../../../core/components/EditSelectOne';
import EditSelect from '../../../core/components/EditSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//SQL ConditionList

const GetById=URI.CORE_SQLCONFIG.GetById;
const SaveConditionUrl=URI.CORE_SQLCONFIG.SaveCondition;
const permissionsAndRolesSelectUrl=URI.CORE_PERMISSIONS.permissionsAndRolesSelectUrl;
const getColumnsByTableName=URI.CORE_DATAMODELS.getColumnsByTableName;

class SQLConditionList extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.relationship='AND';
    this.tableName=this.props.tableName;
    this.dbConnId=this.props.dbConnId;
    this.state = {
      curEditIndex:-1,
      conditionStr:'',
      data:[],
      tableColumns:[],
      tableName:'',
      dbConnId:'',
      loading: true,
    };
  }

  componentDidMount(){
    this.loadData();
    this.loadTableColumns();
  }

  loadData=()=>{
    let url=GetById.replace("{id}",this.id);
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
        this.setState({loading:false,curEditIndex:-1});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let conditionList=data.conditionList||[{id:AjaxUtils.guid(),fieldBefore:'',fieldId:'',fieldValue:''}];
          this.setState({data:conditionList,tableName:data.tableName,dbConnId:data.dbConnId});
          this.previewCondition();
        }
    });
  }

  saveData=()=>{
    this.setState({loading:true});
    let conditionList=JSON.stringify(this.state.data);
    AjaxUtils.post(SaveConditionUrl,{id:this.id,conditionList:conditionList},(data)=>{
        this.setState({loading:false,curEditIndex:-1});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
        }
    });
  }

  loadTableColumns=()=>{
    //??????????????????
    let tableName=this.tableName;
    let dbConnId=this.dbConnId;
    if(tableName===''||tableName==undefined){return;}
    this.setState({mask:true});
    AjaxUtils.post(getColumnsByTableName,{tableName:tableName,dbType:'R',connId:dbConnId,dbName:''},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({tableColumns:data,mask:false});
          }
    });
  }

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCondtion(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"=",value:'='},
      {text:">",value:'>'},
      {text:">=",value:'>='},
      {text:"<",value:'<'},
      {text:"<=",value:'<='},
      {text:"<>",value:'!='},
      {text:"like",value:'like'},
      {text:"in",value:'in'},
      {text:"!like",value:'not like'},
      {text:"not in",value:'not in'},
      {text:"???",value:''}
      ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldValue(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"'${??????Id}'",value:"'${??????Id}'"},
      {text:"??????Id",value:"'${$userId}'"},
      {text:"?????????",value:"'${$userName}'"},
      {text:"??????Id",value:"'${$roleCode}'"},
      {text:"??????Id",value:"'${$permissionId}'"},
      {text:"????????????",value:"'${$date}'"},
      {text:"????????????",value:"'${$dateTime}'"}
      ];
    return (<EditSelect value={text} data={data} options={{"style":{width:'100%'}}}  placeholder={placeholder}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldId(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    let data=this.state.tableColumns.map((item)=>{
      return {text:item.colId,value:item.colId}
    });
    return (<EditSelect value={text} data={data}  placeholder={placeholder}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderBeforeSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text=='(' || text==''){return text;}
      else {return <span style={{paddingLeft:'20px'}}>{text}</span>;}
    }
    let data=[
      {text:"??????",value:'AND'},
      {text:"??????",value:'OR'},
      {text:"(",value:'('},
      {text:")",value:')'},
      {text:"???",value:''}
      ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderAfterSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:")",value:')'},
      {text:"???",value:''}
      ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderValidCondition(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"??????",value:''},
      {text:"???????????????",value:'NotBlank'},
      {text:"???????????????",value:'Contain'}
      ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderPermissionIds(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(text==undefined){text=[];}
      return text.join(",");
    }
    return (<TreeNodeSelect url={permissionsAndRolesSelectUrl} defaultData={[{title:'??????????????????',value:'Users'}]} options={{showSearch:true,multiple:true,allowClear:true,treeNodeFilterProp:'title',style:{width:'100%'}}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
  }

  deleteRow=(id,index)=>{
    let data=this.state.data;
    data.splice(index, 1)
    this.setState({data:data});
    this.previewCondition();
  }

  handleChange=(key, index, value,text)=>{
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
    this.previewCondition();
  }

  insertRow=(index)=>{
    //????????????
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldBefore:this.relationship,fieldId:'',fieldValue:''};
    let newData=this.state.data;
    newData.splice(index,0,newRow);
    this.setState({data:newData,curEditIndex:-1});
    this.previewCondition();
  }

  addRow=(fieldType)=>{
    //????????????????????????
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldBefore:this.relationship,fieldId:'',fieldValue:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1});
    this.previewCondition();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
    this.previewCondition();
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
    this.previewCondition();
  }

  previewCondition=()=>{
    let conditionStr="";
    let data=this.state.data;
    for(let i=0;i<data.length;i++){
      let item=data[i];
      if(item.fieldBefore!=='' && item.fieldBefore!=undefined){
        conditionStr+=item.fieldBefore+" ";
      }
      if(item.fieldId!=='' && item.fieldId!=undefined){
        conditionStr+=item.fieldId+" ";
      }
      if(item.fieldCondtion!=='' && item.fieldCondtion!=undefined){
        conditionStr+=item.fieldCondtion+" ";
      }
      if(item.fieldValue!=='' && item.fieldValue!=undefined){
        conditionStr+=item.fieldValue+" ";
      }
      if(item.fieldAfter!=='' && item.fieldAfter!=undefined){
        conditionStr+=item.fieldAfter+" ";
      }
    }
    this.setState({conditionStr:conditionStr});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '',
      dataIndex: 'fieldBefore',
      render: (text, record, index) => this.renderBeforeSymbol(index,'fieldBefore', text,record),
      width:'10%',
    },{
      title: '??????',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderFieldId(index,'fieldId', text,record,'???????????????Id'),
      width:'18%',
    },{
      title: '?????????',
      dataIndex: 'fieldCondtion',
      render: (text, record, index) =>this.renderCondtion(index,'fieldCondtion',text,record),
      width:'10%',
    },{
      title: '?????????',
      dataIndex: 'fieldValue',
      render: (text, record, index) =>this.renderFieldValue(index,'fieldValue',text,record,'HTTP??????${??????Id}'),
      width:'30%',
    },{
      title: '????????????',
      dataIndex: 'validCondition',
      width:'14%',
      render: (text, record, index) =>this.renderValidCondition(index,'validCondition',text,record),
    },{
      title: '?????????????????????',
      dataIndex: 'permissionsIds',
      width:'20%',
      render: (text, record, index) =>this.renderPermissionIds(index,'permissionsIds',text,record),
    },{
      title: '??????',
      dataIndex: 'sortNum',
      width:'5%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    },{
      title: '??????',
      dataIndex: 'action',
      width:'12%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.insertRow(index)}>??????</a> <Divider type="vertical" /> <a onClick={() => this.deleteRow(record.id,index)}>??????</a>
        </div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.saveData}  type="primary" style={{marginBottom:'5px'}}  icon='save'  >????????????</Button>{' '}
        <Button  onClick={this.addRow.bind(this,'1')}  type="ghost" style={{marginBottom:'5px'}}  icon='plus'  >????????????</Button>{' '}
        <Button  onClick={this.refresh}  type="ghost" style={{marginBottom:'5px'}}  icon='reload'  >??????</Button>
        <Table
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        loading={this.state.loading}
        size="small"
        />
        ??????:{this.state.conditionStr}
    </div>
      );
  }
}

export default SQLConditionList;
