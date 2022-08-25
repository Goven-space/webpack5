import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import AppSelect from '../../../../core/components/AppSelect';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import NodeColumnEventCode from '../../write/components/ColumnEventCode';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsConfig;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class TxtFileWriteNodeColumns extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.tableColumns=this.props.tableColumns;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
    };
  }

  componentDidMount(){
    if(this.tableColumns=='[]'){
      this.loadData();
    }else{
      this.setState({data:JSON.parse(this.tableColumns)});
    }
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
      {text:"date",value:'date'},
      {text:"datetime",value:'datetime'},
      {text:"float",value:'float'},
      {text:"int",value:'int'},
      {text:"boolean",value:'boolean'},
      {text:"long",value:'long'}
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

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
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

  //通过ajax远程载入数据
  loadData=()=>{
    let joinNodeIds=this.form.getFieldValue("dataNodeId")||'';
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+joinNodeIds;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        this.setState({data:data,loading:false});
      }
    });
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
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
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '字段说明',
      dataIndex: 'colName',
      width:'25%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '类型',
      dataIndex: 'colType',
      width:'15%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '为null时写入缺省值',
      dataIndex: 'defaultValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index, 'defaultValue', text,"now()可获取当前时间"),
    },{
      title: '事件',
      dataIndex: 'eventCode',
      width:'10%',
      render: (text, record, index) => {if(text!=='' && text!==undefined){return <Tag color='red'>有</Tag>}else{return '--';}},
    },{
      title: '顺序',
      dataIndex: 'sort',
      width:'6%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      }
    }
    ];

    const expandedRow=(record,index)=>{
      return (
        <Card bodyStyle={{padding:5}} title="字段写入前事件" >
          <NodeColumnEventCode record={record} index={index} updateEvnetCode={this.updateEvnetCode} title="字段写入前转换事件" />
        </Card>
        );
    }

    return (
      <div>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button  type="primary" onClick={this.refresh} icon="reload"  >重新导入字段</Button>
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
              expandedRowRender={expandedRow}
              scroll={{ y: 450 }}
              size="small"
              />
      </div>
      );
  }
}

export default TxtFileWriteNodeColumns;
