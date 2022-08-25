import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Input, Popconfirm,Button,Select} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import EditSelect from '../components/EditSelect';

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_GATEWAY_ROUTERMAPPLUGIN.list;
const SAVE_URL=URI.CORE_GATEWAY_ROUTERMAPPLUGIN.save;
const DELETE_URL=URI.CORE_GATEWAY_ROUTERMAPPLUGIN.delete;
const LIST_ALLPLUGIN=URI.CORE_GATEWAY_PLUGIN.listAllSelect+"?controlType=PART";

const Option = Select.Option;

class EditRouterMapPlugin extends React.Component {
  constructor(props) {
    super(props);
    this.routerId=this.props.routerId;
    this.appId=this.props.appId;
    this.saveUrl=SAVE_URL.replace("{routerid}",this.routerId);
    this.listUrl=LIST_URL.replace("{routerid}",this.routerId);
    console.log(this.listUrl);
    this.state = {
      loading:true,
      curEditIndex:-1,
      selectedRowKeys:[],
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
    GridActions.loadEditGridData(this,this.listUrl);
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let postData=JSON.stringify(this.state.data);
    this.setState({loading:true});
    AjaxUtils.ajax(this.saveUrl,postData,"post","json",{"Content-Type":"application/json;charset=UTF-8"},(data)=>{
      this.setState({loading:false});
      if(data.state==false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return <Input  value={text} onChange={ e => {this.handleChange(key, index,  e.target.value)}} />
  }

  renderAjaxSelect(index, key, text,url) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditSelect value={text}  url={url} options={{showSearch:true}} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!==""){
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
    this.setState({ data });
  }
  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,pluginConfigId:'',pluginConfigName:'',paramValues:'',sortNum:'10'};
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
    const { data } = this.state;
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const columns=[{
      title: '路由策略id',
      dataIndex: 'pluginConfigId',
      width:'35%',
      render: (text, record, index) => this.renderAjaxSelect(index, 'pluginConfigId', text,LIST_ALLPLUGIN),
    },{
      title: '策略名称',
      dataIndex: 'pluginConfigName',
      width:'25%'
    }, {
      title: '指定执行时的参数',
      dataIndex: 'paramValues',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'paramValues',text),
    }, {
      title: '执行顺序',
      dataIndex: 'sortNum',
      width:'10%',
      render: (text, record, index) =>this.renderEditText(index,'sortNum',text),
    },{
      title: '操作',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<div className="editable-row-operations">
              <a onClick={() => this.deleteRow(record.id)}>删除</a>
        </div>);
      },
    }];

    return (
      <div>
        <div style={{paddingBottom:2}} >
        <ButtonGroup >
          <Button type="primary" onClick={this.saveData} icon="save"  >保存配置</Button>
          <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增</Button>
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

export default EditRouterMapPlugin;
