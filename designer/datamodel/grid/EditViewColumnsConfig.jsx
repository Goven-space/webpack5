import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,Icon,Tag,Checkbox,Radio,Tabs } from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListServicesByViewId from '../../designer/grid/ListApisByFilters';
import ViewColumnEventCode from './ViewColumnEventCode'

const TabPane = Tabs.TabPane;
const LIST_VALIDATE_BEANS=URI.CORE_DATAMODELS.validateBeans;
const LIST_URL=URI.CORE_DATAMODELS.columnList;
const SAVE_URL=URI.CORE_DATAMODELS.columnSave;
const SELECT_COLUMN_URL=URI.CORE_DATAMODELS.selectColumnList;
const LOAD_FromEntryModel=URI.CORE_DATAMODELS.loadFromEntryModel;
const ButtonGroup = Button.Group;

class EditViewColumnsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.id;
    this.modelId=this.props.modelId;
    this.entryModelId=this.props.entryModelId; //业务模型对应的实体模型的modelid
    this.modelName=this.props.modelName;
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
      hiddenType:'AllShow',
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
      this.setState({data:data,loading:false});
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

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  renderColId(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text===this.keyId){
        return text+"(主键)";
      }else{
        return text;
      }
    }
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderAjaxSelect(index, key, text,url) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditSelect value={text} size='small' url={url} options={{showSearch:true,size:"small",combobox:true}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    if(text===true){text="true";}else if(text===false){text="false";}
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"是",value:'true'},{text:"否",value:'false'}];
    return (<EditSelect value={text} size='small' data={data} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=()=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    let selectedRowKeys=this.state.selectedRowKeys;
    selectedRowKeys.forEach(function(value, index, array) {
      if(value.length>10){deleteIds.push(value);}
    });
    let data=this.state.data.filter((dataItem) => selectedRowKeys.indexOf(dataItem.id)===-1);
    this.setState({data,deleteIds});
  }

  loadColumnsFromEntryModel=()=>{
    //把已经存在的列标记为要删除的
    let deleteIds=[];
    this.state.data.forEach(function(item, index, array) {
      if(item.id.length>10){deleteIds.push(item.id);}
    });
    this.setState({deleteIds:deleteIds});

    let url=LOAD_FromEntryModel+"?modelId="+this.modelId;
    this.setState({loading:true});
    let i=0;
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
        this.setState({loading:false});
      }else{
        data.forEach(function(item,index,array){
          i++;
          item.id=i;
          item.parentId='';
        });
        this.setState({data:data,loading:false,newIdNum:data.length+1});
      }
    });

  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data });
  }
  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,EditFlag:true,colId:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }
  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data} = this.state;
    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} title={(<span>{record.colId}事件定义</span>)} >
        <ViewColumnEventCode id={record.id}/>
        </Card>
        );
    }
    const columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderColId(index,'colId', text),
    },{
      title: '字段备注',
      dataIndex: 'colName',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
      width:'25%',
    },{
      title: '改为新字段Id',
      dataIndex: 'aliasId',
      render: (text, record, index) =>this.renderEditText(index,'aliasId',text),
      width:'20%'
    },{
      title: '事件',
      dataIndex: 'loadEventCode',
      width:'15%',
      render: (text, record, index) => {
        let eventText="";
        if(record.loadEventCode!=='' && record.loadEventCode!==undefined){
          eventText="格式化事件";
        }
        if(eventText===""){return "无";}else{
          return <Tag color='green'>{eventText}</Tag>;
        }
      }
    },{
      title: '权限',
      dataIndex: 'permissionIds',
      width:'15%'
    }, {
      title: '顺序',
      dataIndex: 'sort',
      width:'10%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    }
    ];

    return (
      <div>
        <Tabs defaultActiveKey="columnsConfig"  >
            <TabPane tab="数据列配置" key="columnsConfig" animated={false}>
              <div style={{paddingBottom:10}} >
                 <ButtonGroup >
                  <Button type="primary" onClick={this.saveData} icon="save"  >保存</Button>
                  <Button  onClick={this.deleteRow} icon="delete"  >删除</Button>
                  <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增</Button>
                  <Button  onClick={this.loadColumnsFromEntryModel} icon="select"  >从实体模型中读取</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
                 </ButtonGroup>
              </div>
              <Table
              expandedRowRender={expandedRow}
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
          </TabPane>
          <TabPane tab="关联的API" key="ServiceList" animated={false}>
              <ListServicesByViewId appId={this.appId}  filters={{viewId:[this.modelId]}} />
          </TabPane>
        </Tabs>
      </div>
      );
  }
}

export default EditViewColumnsConfig;
