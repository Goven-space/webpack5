import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Inputm,Select,Input,Checkbox,Card,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import EditText from '../../core/components/EditText';
import EditSelect from '../../core/components/EditSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import EditAPIMoreParams from './EditAPIMoreParams';

const Option = Select.Option;
const ButtonGroup = Button.Group;
const LIST_VALIDATE_BEANS=URI.SERVICE_PARAMS_CONFIG.validateBeans;
const LIST_URL=URI.SERVICE_PARAMS_CONFIG.list;
const SAVE_URL=URI.SERVICE_PARAMS_CONFIG.save;
const confirm = Modal.confirm;

class EditAPIMapParams extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.id;
    this.appId=this.props.appId;
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currnetEditRow:{},
      visible:false,
      annotationStr:'',
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    if(this.configId===''||this.configId===undefined){
      this.setState({loading:false});
      return;
    }
    let url=LIST_URL.replace('{configId}',this.configId);
    GridActions.loadEditGridData(this,url);
  }

  //获取所有映射字段的配置json
  getParamsJsonData=()=>{
    return this.state.data;
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamDefaultValue(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"用户id",value:"${$userId}"},
      {text:"用户名",value:"${$userName}"},
      {text:"UUID",value:"${$id}"},
      {text:"配置变量",value:"${$config.}"},
    ];
    return (<EditSelect value={text} data={data} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEnCode(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"不编码",value:0},{text:"编码<>",value:1},{text:"单引号",value:2},{text:"全部",value:3},{text:"UTF-8",value:4}];
    return (<EditSelect value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"string",value:'string'},{text:"json",value:'json'},{text:"file",value:'file'},{text:"int",value:'int'},{text:"long",value:'long'},{text:"boolean",value:'boolean'},{text:"date",value:'date'},{text:"datetime",value:'datetime'},{text:"float",value:'float'},{text:"double",value:'double'}];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldLocation(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"query",value:'query'},{text:"path",value:'path'},{text:"head",value:'head'}];
    return (<EditSelect value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!==""  && id!==null ){
      if(id.length>10){
        deleteIds.push(id);
      }
      let data=this.state.data.filter((dataItem) => dataItem.id!==id);
      this.setState({data,deleteIds});
    }
  }

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data:data });
  }

  insertRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=this.state.newIdNum+1;
    let newRow={id:key,urlConfigId:this.configId,EditFlag:true,fieldType:'string',breakFlag:true,required:false,in:'query',defaultValue:'',maxLength:'0',minLength:'0',order:newData.length+1};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  editRow=(record,index)=>{
    this.setState({curEditIndex:index,currnetEditRow:record});
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  closeModal=(newRowData)=>{
    if(newRowData===false){return;}
    this.setState({visible: false,});
    let data=this.state.data;
    data.forEach((item,index)=>{
       if(item.id===newRowData.id){
         data[index]=newRowData;
       }
     });
     this.setState({data:data,curEditIndex:-1});
  }
  showModal=(record)=>{
     this.setState({visible:true,currnetEditRow:record});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '输入参数Id',
      dataIndex: 'fieldId',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text,record),
    },{
      title: '参数中文说明',
      dataIndex: 'fieldName',
      width:'15%',
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text),
    },{
      title: '类型',
      dataIndex: 'fieldType',
      width:'10%',
      render: (text, record, index) =>this.renderFieldType(index,'fieldType',text),
    },{
      title: '参数位置',
      dataIndex: 'in',
      width:'8%',
      render: (text, record, index) =>this.renderFieldLocation(index,'in',text),
    },{
      title: '缺省值',
      dataIndex: 'defaultValue',
      width:'10%',
      render: (text, record, index) =>this.renderParamDefaultValue(index,'defaultValue',text),
    },{
      title: '映射后端Id',
      dataIndex: 'mapFieldId',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index,'mapFieldId', text,record),
    },{
      title: '必填',
      dataIndex: 'required',
      width:'5%',
      render: (text, record, index) => this.renderYNSelect(index, 'required', text),
    },{
      title: '长度',
      dataIndex: 'maxLength',
      width:'5%',
      render: (text, record, index) => this.renderEditText(index, 'maxLength', text),
    },{
      title: '验证提示',
      dataIndex: 'tip',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index,'tip', text),
    },{
      title: '排序',
      dataIndex: 'sortNum',
      width:'5%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    },{
      title: '操作',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.id)}>删除</a></span>);
      },
    },{
      title: '更多',
      dataIndex: 'more',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.showModal(record)}>更多</a></span>);
      },
    }];

    return (
      <Card>
        <Modal key={Math.random()} title="编辑更多" maskClosable={false}
          visible={this.state.visible}
          footer=''
          width='800px'
          style={{top:'20px'}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <EditAPIMoreParams currnetEditRow={this.state.currnetEditRow} close={this.closeModal} />
        </Modal>
        <div style={{paddingBottom:5}}  >
          <ButtonGroup  >
            <Button type="primary" onClick={this.insertRow} icon="plus-circle-o"  >新增参数</Button>
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
          size='small'
        />
        (提示:如果不配置映射参数则表示全部透全所有参数)
      </Card>
      );
  }
}

export default EditAPIMapParams;
