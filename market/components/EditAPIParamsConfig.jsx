import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Tabs,Inputm,Select,Input,Checkbox,Card,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import EditText from '../../core/components/EditText';
import EditSelect from '../../core/components/EditSelect';
import AjaxSelect from '../../core/components/AjaxSelect';
import EditServiceMoreParams from './EditAPIMoreParams';
import EditServiceErrorCodeInner from '../../designer/designer/grid/EditServiceErrorCodeInner';
import EditServiceResponseSample from './EditAPIResponseSample';
import EditServiceHystrix from '../../designer/designer/form/components/EditServiceHystrix';
import ApiQpsAndLogMonitor from '../../monitor/charts/ApiQpsAndLogMonitor';

//修改API的输入参数

const Option = Select.Option;
const ButtonGroup = Button.Group;
const LIST_VALIDATE_BEANS=URI.SERVICE_PARAMS_CONFIG.validateBeans;
const LIST_URL=URI.SERVICE_PARAMS_CONFIG.list;
const SAVE_URL=URI.SERVICE_PARAMS_CONFIG.save;
const selectColumnList=URI.CORE_DATAMODELS.selectColumnList;
const columnListByModelId=URI.CORE_DATAMODELS.columnListByModelId;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;

class EditAPIParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.id;
    this.appId=this.props.appId;
    this.beanId=this.props.beanId;
    this.modelId=this.props.modelId;
    this.selectColumnListUrl=selectColumnList.replace("{modelId}",this.modelId);
    this.columnListByModelIdUrl=columnListByModelId+"?modelId="+this.modelId;
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currnetEditRow:{},
      visible:false,
      annotationStr:'',
      width:800,
    };
  }

  componentDidMount(){
    this.updateSize();
    this.loadData();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-50;
    this.setState({width:width});
  }

  //通过ajax远程载入数据
  loadData=()=>{
    //获得列数据
    this.setState({deleteIds:[]});
    let url=LIST_URL.replace('{configId}',this.configId);
    GridActions.loadEditGridData(this,url,(data)=>{
      data.forEach((item,index,arr)=>{
        item.id=index;
      });
      this.setState({data:data});
    });
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let url=SAVE_URL.replace('{configId}',this.configId);
    let postData=this.state.data; //全部提交，在后面进行处理
    // console.log(postData);
    GridActions.saveEditGridData(this,url,postData,this.state.deleteIds,this.appId);
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

  renderTextArea(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<Input.TextArea value={text} autosize size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderValidateSelect(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditSelect value={text} url={LIST_VALIDATE_BEANS} size='small' options={{showSearch:true,mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamDefaultValue(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"用户id",value:"{$userId}"},
      {text:"用户名",value:"{$userName}"},
      {text:"UUID",value:"{$id}"},
      {text:"配置变量",value:"{$config.}"},
    ];
    return (<EditSelect value={text} data={data} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamId(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(record.mapFieldId!==undefined && record.mapFieldId!==''){return text+"=>"+record.mapFieldId;}
      else{return text;}
    }
    let data=[{text:"file",value:"file"},
    {text:"pageSize",value:"pageSize"},
    {text:"pageNo",value:"pageNo"},
    {text:"sort",value:"soft"},
    {text:"order",value:"order"},
    {text:"filters",value:"filters"},
    {text:"searchFilters",value:"searchFilters"},
    {text:"SubmitNonce",value:"SubmitNonce"}];
    if(this.modelId!=='' && this.modelId!==undefined && this.modelId!==null){
      return <AjaxSelect value={text} url={this.selectColumnListUrl} defaultData={data} textId='value' onChange={(value) => this.handleChange(key, index, value)} options={{showSearch:true,mode:'combobox',size:'small',style:{minWidth:'100px'}}}  />
    }else{
      return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
    }
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
    let key=newData.length+1;
    let newRow={id:key,urlConfigId:this.configId,EditFlag:true,fieldType:'string',breakFlag:true,required:false,in:'query',defaultValue:'',maxLength:'0',minLength:'0',order:newData.length+1};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  //从数据模型中载入输入参数
  loadColumnsFromModel=()=>{
    if(this.modelId==='' || this.modelId===undefined || this.modelId===null){AjaxUtils.showError("本服务配置中没有绑定数据模型，不能导入!");}
    this.setState({loading:true});
    AjaxUtils.get(this.columnListByModelIdUrl,(data)=>{
      this.setState({loading:false});
      let newData=[];
      let key=0;
      data.map((item)=>{
        key++;
        let colLength=0;
        if(item.colLength!=='' && item.colLength!==undefined && item.colLength!==null){
          colLength=item.colLength;
        }
        let newRow={id:key,fieldId:item.colId,fieldName:item.colName,urlConfigId:this.configId,EditFlag:true,fieldType:item.colType,breakFlag:true,required:false,location:'query',defaultValue:'',maxLength:colLength,minLength:'0'};
        newData.push(newRow);
      });
      this.setState({data:newData,curEditIndex:-1,newIdNum:key});
    });
  }

  editRow=(record,index)=>{
    this.setState({curEditIndex:index,currnetEditRow:record,visible:true});
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
     this.saveData();
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '输入参数Id',
      dataIndex: 'fieldId',
      width:'15%',
      render: (text, record, index) => this.renderParamId(index,'fieldId', text,record),
    },{
      title: '参数中文说明',
      dataIndex: 'fieldName',
      width:'18%',
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text),
    },{
      title: '类型',
      dataIndex: 'fieldType',
      width:'8%',
      render: (text, record, index) =>this.renderFieldType(index,'fieldType',text),
    },{
      title: '参数位置',
      dataIndex: 'in',
      width:'8%',
      render: (text, record, index) =>this.renderFieldLocation(index,'in',text),
    },{
      title: '示例值',
      dataIndex: 'sampleValue',
      width:'10%',
      render: (text, record, index) =>this.renderEditText(index,'sampleValue',text),
    },{
      title: '缺省值',
      dataIndex: 'defaultValue',
      width:'10%',
      render: (text, record, index) =>this.renderParamDefaultValue(index,'defaultValue',text),
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
    }];

    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} title={(<span>{record.fieldId}属性定义</span>)} >
          <EditServiceMoreParams currnetEditRow={record} configId={this.configId} close={this.closeModal} />
        </Card>
        );
    }

    return (
      <div style={{width:this.state.width}} >
        <Tabs defaultActiveKey="ParamsConfig" onChange={this.onTabChange} size='large'  >
         <TabPane tab="输入配置" key="ParamsConfig" animated={false}>
            <div style={{paddingBottom:5}}  >
            <ButtonGroup  >
              <Button type="primary" onClick={this.saveData} icon="save"  >保存配置</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增参数</Button>
              <Button  onClick={this.loadColumnsFromModel} icon="plus-circle-o" style={{display:this.modelId===''?'none':''}} >数据模型中导入</Button>
              <Button  onClick={this.refresh} icon="reload"  >刷新</Button>
            </ButtonGroup>
            </div>
            <Table
            expandedRowRender={expandedRow}
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            onRowClick={this.onRowClick}
            loading={this.state.loading}
            pagination={false}
            size="small"
            />
          </TabPane>
          <TabPane tab="输出配置" key="errorCode">
            <EditServiceErrorCodeInner id={this.configId}  appId={this.appId} />
          </TabPane>
          <TabPane tab="Hystrix配置" key="hystrix">
            <EditServiceHystrix id={this.configId} />
          </TabPane>
          <TabPane tab="更多属性" key="responseSample">
            <EditServiceResponseSample id={this.configId} />
          </TabPane>
          <TabPane tab="调用日志" key="ApiQps">
            <ApiQpsAndLogMonitor id={this.configId} />
          </TabPane>
        </Tabs>
      </div>
      );
  }
}

export default EditAPIParamsConfig;
