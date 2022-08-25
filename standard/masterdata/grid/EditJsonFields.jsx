import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Tabs,Icon,Select,Input,Checkbox,Divider,Card,Drawer} from 'antd';
import EditText from '../../../core/components/EditText';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditSelect from '../../../core/components/EditSelect';
import EditSelectOne from '../../../core/components/EditSelectOne';
import ShowMasterDataJsonBody from '../form/ShowMasterDataJsonBody';

//主数据JSON字段配置

const Option = Select.Option;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_MasterData.fields;
const SAVE_URL=URI.CORE_MasterData.saveFields;
const PARSER_JSONURL=URI.CORE_MasterData.parserFields;

const confirm = Modal.confirm;

class EditJsonFields extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.id;
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currentRecord:{},
      currentRecordId:-1,
      action:'',
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({loading:true});
    let url=LIST_URL+"?id="+this.parentId;
    AjaxUtils.get(url,data=>{
      this.setState({data:data,loading:false});
    });
  }

  //保存输出参数
  saveData=()=>{
    this.setState({currentRecordId:-1,curEditIndex:-1,loading:true});
    let postData={id:this.parentId,paramsData:JSON.stringify(this.state.data)};
    AjaxUtils.post(SAVE_URL,postData,data=>{
      this.setState({loading:false});
      if(data.state==false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({currentRecordId:-1});
    this.loadData();
  }

  renderDataType=(index, key, text,record)=>{
    if(record==undefined || this.state.currentRecordId!==record.id){return text;}
    let data=[{text:"Number",value:"Number"},{text:"Date",value:"Date"},{text:"Datetime",value:"Datetime"},{text:"String",value:"String"},{text:"Object",value:"Object"},{text:"Array",value:"Array"},{text:"Boolean",value:"Boolean"}];
    if(text===''||text===undefined){text="STRING";}
    return (<EditSelect value={text} data={data} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value,record)} />);
  }

  renderEditText=(index, key, text,record,width='100%',placeholder)=>{
    if(record==undefined || this.state.currentRecordId!==record.id){return text;}
    return (<EditText value={text} size='small' options={{style:{width:width}}} placeholder={placeholder} onChange={value => this.handleChange(key, index, value,record)} />);
  }

  renderCheckBox=(index, key, text,record)=>{
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked,record)}  ></Checkbox>);
  }

  renderFieldLocation(index, key, text,record) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"query",value:'query'},{text:"url",value:'url'},{text:"body",value:'body'},{text:"path",value:'path'},{text:"head",value:'head'}];
    return (<EditSelectOne value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value,record)} />);
  }

  deleteRow=(id,data=this.state.data)=>{
    for( var index in data ){
      if(data[index].id==id){
        data.splice(index, 1);
        return;
      }else if(data[index].children!==undefined){
        this.deleteRow(id,data[index].children);
      }
    }
    this.deleteBlankChildrenRow(data);
  }

  deleteBlankChildrenRow=(data)=>{
    for( var index in data ){
      if(data[index].children!==undefined && data[index].children==0){
        delete data[index].children;
      }
    }
  }


  handleChange(key, index, value,record) {
    record[key] = value;
    this.setState({ newIdNum:0 });
  }

  //追加一行
  addRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldType:"String",must:true};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  //在指定行上面插入一行
  insertRow=(id,data=this.state.data)=>{
    for( var index in data ){
      if(data[index].id==id){
        let newRow={id:AjaxUtils.guid(),fieldType:"String",required:false};
        data.splice(index,0,newRow);
        return;
      }else if(data[index].children!==undefined){
        this.insertRow(id,data[index].children);
      }
    }
  }

  //添加一个子字段
  addSubRow=(record)=>{
    //console.log(record);
    let key=AjaxUtils.guid();
    if(record.children==undefined){
      record.children=[];
    }
    record.children.push({id:key,fieldType:'String',must:true});
  }

  upRecord = (id,arr) =>{
    for( var index in arr ){
      if(arr[index].id==id){
        if(index==0){return;}
        arr[index] = arr.splice(index - 1, 1, arr[index])[0];
        return;
      }else if(arr[index]!=undefined && arr[index].children!==undefined){
        this.upRecord(id,arr[index].children);
      }
    }
  }

  downRecord = (id,arr) => {
      for( var index in arr ){
        if(arr[index].id==id){
          if(index==arr.length-1){return;}
          arr[index] = arr.splice(index + 1, 1, arr[index])[0];
          return;
        }else if(arr[index]!=undefined && arr[index].children!==undefined){
          this.upRecord(id,arr[index].children);
        }
      }
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index,currentRecord:record,currentRecordId:record.id});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  showModal=(action,record)=>{
      this.setState({visible: true,action:action,currentRecord:record});
  }

 importFormJson=()=>{
   this.setState({loading:true});
   let jsonBody=this.state.jsonBody;
   let id=this.parentId;
   AjaxUtils.post(PARSER_JSONURL,{id:id,jsonBody:jsonBody},(data)=>{
     if(data.state==false){
       AjaxUtils.showError(data.msg);
     }else{
       AjaxUtils.showInfo(data.msg);
     }
     this.loadData();
     this.setState({visible: false});
   });;
 }

 jsonBodyChange=(e)=>{
   this.state.jsonBody=e.target.value;
 }

 closeModal=(newRowData)=>{
   if(newRowData===false){return;}
   this.setState({visible: false,curEditIndex:-1,currentRecordId:-1});
   let data=this.state.data;
   data.forEach((item,index)=>{
      if(item.id===newRowData.id){
        data[index]=newRowData;
      }
    });
    this.setState({data:data});
 }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '字段Id',
      dataIndex: 'fieldId',
      width:'35%',
      render: (text, record, index) =>this.renderEditText(index,'fieldId',text,record,'60%',"参数Id"),
    },{
      title: '字段类型',
      dataIndex: 'fieldType',
      width:'10%',
      render: (text, record, index) =>this.renderDataType(index,'fieldType',text,record)
    },{
      title: '数据样列',
      dataIndex: 'sampleValue',
      width:'10%',
      ellipsis: true,
      render: (text, record, index) =>this.renderEditText(index,'sampleValue',text,record,'100%','数据样例'),
    },{
      title: '字段说明',
      dataIndex: 'fieldName',
      width:'10%',
      ellipsis: true,
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text,record,'100%','参数说明'),
    },{
      title: '必填',
      dataIndex: 'required',
      width:'5%',
      render: (text, record, index) =>this.renderCheckBox(index,'required',text,record)
    },{
      title: '长度',
      dataIndex: 'maxLength',
      width:'5%',
      render: (text, record, index) => this.renderEditText(index, 'maxLength', text,record),
    },{
      title: '操作',
      dataIndex: 'action',
      width: '10%',
      render: (text, record, index) => {
        return (
        <span><a onClick={() => this.deleteRow(record.id)}>删除</a>
         | <a onClick={() => this.addSubRow(record)}>添加子项</a>
         | <a onClick={() => this.insertRow(record.id)}>插入</a>
        </span>);
      },
    },{
      title: '排序',
      dataIndex: 'sortNum',
      width:'5%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,record.id,this.state.data)} />
      <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,record.id,this.state.data)} /></span>);
      },
    }];

    let content,title;
    if(this.state.action=='json'){
      title='从JSON导入';
      content=(<span>
      <Input.TextArea autoSize={{ minRows: 30, maxRows: 100 }} onChange={this.jsonBodyChange} placeholder="通过JSON自动分析输入参数" />
      <br/><br/>
      <Button type="primary" onClick={this.importFormJson} icon="upload"  >开始导入</Button>
      </span>);
    }else if(this.state.action=='showjson'){
          title='查看JSON';
          content=<ShowMasterDataJsonBody id={this.parentId} />;
    }
    return (
      <div>
            <Drawer   key={Math.random()}
                      title={title}
                      placement="right"
                      width='960px'
                      closable={false}
                      onClose={this.handleCancel}
                      visible={this.state.visible}
                    >
                    {content}
            </Drawer>
            <div style={{paddingBottom:5}}  >
            <ButtonGroup>
              <Button type="primary" onClick={this.saveData} icon="save"  >保存</Button>
              <Button  onClick={this.addRow} icon="plus"  >添加字段</Button>
              <Button  onClick={this.showModal.bind(this,'json')} icon="upload"  >从JSON导入</Button>
              <Button  onClick={this.showModal.bind(this,'showjson')} icon="file-text"  >查看JSON</Button>
              <Button  onClick={this.refresh} icon="reload"  >刷新</Button>
            </ButtonGroup>
            </div>
            <Table
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            onRowClick={this.onRowClick}
            loading={this.state.loading}
            pagination={false}
            size="small"
            />
      </div>
      );
  }
}

export default EditJsonFields;
