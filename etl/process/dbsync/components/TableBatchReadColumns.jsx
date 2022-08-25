import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Checkbox} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

//要批量传输和表名称
const listAllTables=URI.ETL.TableBatchReadNode.listTables;

class TableBatchReadColumns extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.data||'[]';
    this.form=this.props.form;
    this.state = {
      curEditIndex:-1,
      data:JSON.parse(this.parentData),
    };
  }

  componentDidMount(){
  }

  getData=()=>{
    return this.state.data;
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=(id)=>{
    //删除选中行
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    data.forEach((v,index,item)=>{
      data[index].id=index;
    });
    this.setState({data});
  }

  deleteNotSelectTable=()=>{
    let data=this.state.data.filter((dataItem) => dataItem.loadFlag==true);
    this.setState({data});
  }

  deleteSelectTable=()=>{
    let data=this.state.data.filter((dataItem) => dataItem.loadFlag!==true);
    this.setState({data});
  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
  }

  insertRow=()=>{
    //新增加一行
    let key=AjaxUtils.guid();
    let newRow={id:key,tableName:'',tableRemark:'',tableType:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  loadTable=()=>{
    //载入数据库表
    let dbName="SYSDB";
    let dbConnId=this.form.getFieldValue("dbConnId");
    let schemaUserId=this.form.getFieldValue("schemaUserId");
    this.setState({mask:true});
    AjaxUtils.post(listAllTables,{schemaUserId:schemaUserId,dbType:'R',dbConnId:dbConnId},(data)=>{
          if(data.state===false){
            this.setState({mask:false});
            message.error(data.msg);
          }else{
            AjaxUtils.showInfo("共载入("+data.length+")个数据库表!");
            this.setState({data:data,mask:false});
          }
    });
  }

 //是否全部选中
  selectAll=(selected)=>{
    let data=this.state.data;
    data.forEach((v,index,item)=>{
      data[index].loadFlag=selected;
    });
    this.setState({data});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  refrash=()=>{
    this.setState({curEditIndex:-1})
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '读取',
      dataIndex: 'loadFlag',
      width:'5%',
      render: (text, record, index) => this.renderCheckBox(index,'loadFlag', text),
    },{
      title: '表名',
      dataIndex: 'tableName',
      render: (text, record, index) => this.renderEditText(index,'tableName', text),
      width:'20%'
    },{
      title: '主键(多个用逗号分隔)',
      dataIndex: 'primaryKeys',
      render: (text, record, index) => this.renderEditText(index,'primaryKeys', text,"逻辑主键不一定是数据库中的主键"),
      width:'20%'
    },{
      title: '禁止传输字段',
      dataIndex: 'notTransFields',
      render: (text, record, index) => this.renderEditTextArea(index,'notTransFields', text,"自增列不要传输,多个用逗号分隔"),
      width:'20%'
    },{
      title: '备注',
      dataIndex: 'remarks',
      render: (text, record, index) =>this.renderEditText(index,'remarks',text),
      width:'20%',
    },{
      title: '类型',
      dataIndex: 'tableType',
      width:'5%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<div><a onClick={() => this.deleteRow(record.id)}>删除</a></div>);}
    }];

    return (
      <div>
        <Button  onClick={this.loadTable}  type="primary" icon='select' style={{marginBottom:'5px'}} >载入表</Button> {' '}
        <Button  onClick={this.insertRow}  type="plug" icon='plus' style={{marginBottom:'5px'}} >新增表</Button> {' '}
        <Button  onClick={this.selectAll.bind(this,true)}  type="plug" icon='check' style={{marginBottom:'5px'}} >全部选中</Button> {' '}
        <Button  onClick={this.selectAll.bind(this,false)}  type="plug" icon='close' style={{marginBottom:'5px'}} >全部取消</Button> {' '}
        <Button  onClick={this.deleteNotSelectTable}  type="plug" icon='delete' style={{marginBottom:'5px'}} >删除未选中的</Button> {' '}
        <Button  onClick={this.deleteSelectTable}  type="plug" icon='delete' style={{marginBottom:'5px'}} >删除选中的</Button> {' '}
        <Table
        loading={this.state.mask}
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        scroll={{ y: 450 }}
        />
      <b>注意</b>:只有选中的表才会传输,主键用来判断目标表中的数据是否存在,不指定主键则全部批量插入到目标
      </div>
      );
  }
}

export default TableBatchReadColumns;
