import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const TabPane = Tabs.TabPane;
const LIST_URL=URI.CORE_DATAMODELS.columnList;
const SAVE_URL=URI.CORE_DATAMODELS.columnSave;
const GET_TableColumnsURL=URI.CORE_DATAMODELS.getTableColumns;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class EditEntryColumnsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.id;
    this.modelId=this.props.modelId;
    this.modelName=this.props.modelName;
    this.keyId=this.props.keyId;
    this.appId=this.props.appId;
    this.dbType=this.props.dbType;
    this.state = {
      configFormId:'',
      modalVisible:false,
      modalTitle:'属性定义',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({deleteIds:[]});
    let url=LIST_URL.replace('{parentId}',this.parentId);
    GridActions.loadEditGridData(this,url,(data)=>{
      if(data.length>0){
        this.setState({data:data,loading:false});
      }else{
        //初始化列
        data=[
          {id:1,colId:this.keyId,colName:this.keyId,colType:'varchar',colLength:'30',noNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:false},
          {id:2,colId:'appId',colName:'应用id',colType:'varchar',colLength:'30',noNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:true},
          {id:4,colId:'createTime',colName:'创建时间',colType:'varchar',colLength:'50',notNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:true},
          {id:5,colId:'creator',colName:'创建者',colType:'varchar',colLength:'50',noNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:true},
          {id:6,colId:'editTime',colName:'更新时间',colType:'varchar',colLength:'30',noNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:true},
          {id:7,colId:'editor',colName:'更新者',colType:'varchar',colLength:'50',noNull:false,noColumn:false,indexFlag:false,EditFlag:true,editHidden:true},
        ];
        this.setState({data:data,loading:false,newIdNum:7});
      }
    });
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let url=SAVE_URL.replace('{parentId}',this.parentId);
    let postData=this.state.data;
    let deleteData=[];
    GridActions.saveEditGridData(this,url,postData,deleteData,this.props.appId);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  renderDefaultValue(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text!==undefined && text!==''  && text!==null){
        return <Icon type="edit" />;
      }else{
        return '';
      }
    }
    return (<div><a onClick={this.showModal.bind(this,'DefaultValueConfig')} >设置</a></div>);
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

  renderColId(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text===this.keyId){
        return <span style={{color:'red'}}>{text}</span>;
      }else{
        return text;
      }
    }
    //let data=[{text:"appId",value:"appId"},{text:"createTime",value:"createTime"},{text:"creator",value:"creator"},{text:"editTime",value:"editTime"},{text:"editor",value:"editor"}];
    //return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderInputNumber(index,key,text){
    if(index!==this.state.curEditIndex){return text;}
    return <InputNumber min={1} size='small' defaultValue={50} value={text} onChange={value => this.handleChange(key, index, value)} />;
  }

  renderAjaxSelect(index, key, text,url) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditSelect value={text} size='small' url={url} options={{showSearch:true,size:"small"}} onChange={value => this.handleChange(key, index, value)} />);
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

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
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

  handleChange=(key, index, value)=>{
    // console.log(key+"=="+index+"==="+value);
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data });
  }
  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newData=this.state.data;
    let newRow={id:key,EditFlag:true,colId:'',colType:'varchar',colLength:'50',noNull:false,noColumn:false,indexFlag:false};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  loadFromTable=()=>{
    //把已经存在的列标记为要删除的
    let deleteIds=[];
    this.state.data.forEach(function(item, index, array) {
      if(item.id.length>10){deleteIds.push(item.id);}
    });
    this.setState({deleteIds:deleteIds});

    let url=GET_TableColumnsURL+"?modelId="+this.modelId;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      //如果当前配置中的colName已经有值的情况下重新载入时不能删除
      if(data.state===false){
          this.setState({loading:false});
          AjaxUtils.showError(data.msg);
      }else{
          let oldData=this.state.data;
          data.forEach(function(item, index, array) {
            for(let i=0;i<oldData.length;i++){
              if(oldData[i].colId.toLowerCase()===item.colId.toLowerCase() && oldData[i].colId.toLowerCase()!==oldData[i].colName.toLowerCase()){
                item.colName=oldData[i].colName;
                item.editHidden=oldData[i].editHidden;
              }
            }
          });
          this.setState({data:data,loading:false,newIdNum:data.length+1});
    }
    });
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderColId(index,'colId', text),
    },{
      title: '字段描述',
      dataIndex: 'colName',
      width:'30%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '数据类型',
      dataIndex: 'colType',
      width:'10%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    }, {
      title: '长度',
      dataIndex: 'colLength',
      width:'8%',
      render: (text, record, index) => this.renderInputNumber(index, 'colLength', text),
    }, {
      title: '默认值',
      dataIndex: 'defaultValue',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'defaultValue', text),
    }, {
      title: '非空',
      dataIndex: 'noNull',
      width:'5%',
      render: (text, record, index) => this.renderCheckBox(index,'noNull', text),
    }, {
      title: '索引',
      width:'5%',
      dataIndex: 'indexFlag',
      render: (text, record, index) => this.renderCheckBox(index, 'indexFlag', text),
    },{
      title: '排序',
      dataIndex: 'sort',
      width:'5%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    }
    ];

    return (
      <div>
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type="primary" onClick={this.saveData} icon="save" >保存</Button>
                <Button  onClick={this.deleteRow} icon="delete"  >删除字段</Button>
                <Button  onClick={this.insertRow} icon="plus"  >新增字段</Button>
                <Button  onClick={this.loadFromTable} icon="select"  >从表中读入</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
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
              size="small"
              />
          </div>
      );
  }
}

export default EditEntryColumnsConfig;
