import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import AppSelect from '../../../../core/components/AppSelect';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import NodeColumnEventCode from './ColumnEventCode';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

const TabPane = Tabs.TabPane;
const getColumnsByTableName=URI.ETL.MONGODB_NODE.getTableColumns;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class MongoDBWriteNodeColumns extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.getSqlCode=this.props.getSqlCode;
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


  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"string",value:'string'},
      {text:"datetime",value:'datetime'},
      {text:"float",value:'float'},
      {text:"double",value:'double'},
      {text:"int",value:'int'},
      {text:"boolean",value:'boolean'},
      {text:"long",value:'long'},
      {text:"array(????????????)",value:'array'},
      {text:"document",value:'document'},
      {text:"documents",value:'documents'},
      {text:"?????????",value:'no'}
      ];
    return (<EditSelectOne value={text} data={data}  size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderDefaultValue(index, key, text,record) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"${$config.Id}",value:'${$config.Id}'},
      {text:"${$id}",value:'${$id}'},
      {text:"${$date}",value:'${$date}'},
      {text:"${$dateTime}",value:'${$dateTime}'},
      {text:"${??????Id}",value:'${??????Id}'}
      ];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderConflictMode(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text===1){return <Tag color='blue'>??????????????????</Tag>;}
      else if(text===2){return <Tag color='red'>????????????</Tag>;}
      else {return '-';}
    }
    if(text===''){text=0;}
    return (
      <Select value={text} size='small'  onChange={(value)=>this.handleChange(key,index,value)} style={{minWidth:'100px'}}  >
       <Option value={0} >????????????</Option>
       <Option value={2} >????????????</Option>
      </Select>
    );
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

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //???????????????????????????
    this.setState({ data });
  }
  insertRow=()=>{
    //???????????????
    let key=this.state.data.length+1;
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

  loadTableColumns=()=>{
    //??????????????????
    let tableName=this.form.getFieldValue("tableName");
    if(tableName===''){message.error("?????????????????????????????????????????????!");return;}
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

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '??????Id',
      dataIndex: 'colId',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '????????????',
      dataIndex: 'colName',
      width:'15%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '??????',
      dataIndex: 'colType',
      width:'15%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '????????????',
      dataIndex: 'conflictMode',
      width:'15%',
      render: (text, record, index) => this.renderConflictMode(index, 'conflictMode', text),
    },{
      title: '????????????',
      dataIndex: 'primaryKey',
      width:'8%',
      render: (text, record, index) => this.renderCheckBox(index,'primaryKey', text),
    },{
      title: '???null??????????????????',
      dataIndex: 'defaultValue',
      width:'16%',
      render: (text, record, index) => this.renderDefaultValue(index, 'defaultValue', text,"now()?????????????????????"),
    },{
      title: '??????',
      dataIndex: 'eventCode',
      width:'10%',
      render: (text, record, index) => {if(text!=='' && text!==undefined){return <Tag color='red'>???</Tag>}else{return '--';}},
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
          <NodeColumnEventCode record={record} index={index} updateEvnetCode={this.updateEvnetCode} title="???????????????????????????" />
        </Card>
        );
    }

    return (
      <div>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button type='primary' onClick={AjaxUtils.showConfirm.bind(this,"????????????????","???????????????????????????????????????,?????????????????????????????????!",this.loadTableColumns.bind(this))}  icon="select"  >????????????????????????</Button>
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
              size="small"
              scroll={{ y: 450 }}
              />
      </div>
      );
  }
}

export default MongoDBWriteNodeColumns;
