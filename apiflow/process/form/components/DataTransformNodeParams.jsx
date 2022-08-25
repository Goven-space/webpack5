import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import EditTextArea from '../../../../core/components/EditTextArea';
import AjaxEditSelect from '../../../../core/components/AjaxEditSelect';

const TabPane = Tabs.TabPane;
const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;
const selectExportParams=URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;

class DataTransformNodeParams extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.applicationId=this.props.applicationId;
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: JSON.parse(this.props.data),
      targetColIds:[],
      sourceColIds:[],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){

  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
  }

  handleChange=(key, index, value,label,extra)=>{
    const { data } = this.state;
    if(value instanceof Array){
      value=value.join(","); //数组转为字符串
    }
    data[index][key] = value;
    if(label!==undefined){
      data[index]['ruleName'] = label;
    }
    // console.log("key="+key+" index="+index+" value="+value);
    this.setState({ data });
  }

  renderConvertRuleIds(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(record.ruleName!==undefined && record.ruleName.join(",")!==''){
        return <Tag color='blue'>{record.ruleName}</Tag>;
      }else{
        return '';
      }
    }
    let data=[];
    return (<TreeNodeSelect url={this.applicationRuleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
  }

  renderParamsValue(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    let url=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.pNodeId;
    return (<AjaxEditSelect value={text} url={url}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,record,tip) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} onChange={value => this.handleChange(key, index, value)} placeholder={tip} />);
  }

  renderEditTextArea(index, key, text,record,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderDataType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"string",value:'string'},
      {text:"integer",value:'integer'},
      {text:"long",value:'long'},
      {text:"float",value:'float'},
      {text:"double",value:'double'},
      {text:"boolean",value:'boolean'}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    if(id!==undefined && id!==""  && id!==null ){
      let data=this.state.data.filter((dataItem) => dataItem.key!==id);
      this.setState({data});
    }
  }

  insertRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=AjaxUtils.guid();
    let newRow={key:key,dataType:'string'};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  render() {
    this.updateFieldMapConfigs(this.state.data); //更新节点中的数据
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'25%',
      render: (text, record, index) =>this.renderEditText(index,'colId',text,record,"指定转换的字段Id"),
    },{
      title: '绑定数据转换规则',
      dataIndex: 'ruleId',
      width:'40%',
      render: (text, record, index) => this.renderConvertRuleIds(index,'ruleId', text,record),
    },{
      title: '规则参数',
      dataIndex: 'ruleParams',
      width:'25%',
      render: (text, record, index) => this.renderEditText(index,'ruleParams', text,record),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增转换字段</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.key}
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

export default DataTransformNodeParams;
