import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import EditTextArea from '../../../../core/components/EditTextArea';
import FieldCaseWhenConfig from './FieldCaseWhenConfig';

const TabPane = Tabs.TabPane;
const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class DataValueMapNodeParams extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.applicationId=this.props.applicationId;
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.data=this.props.data||'[]';
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: JSON.parse(this.data),
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
    this.setState({ data });
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

  renderEditText(index, key, text,record,tip) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} onChange={value => this.handleChange(key, index, value)} placeholder={tip} />);
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

  updateData=(data,index)=>{
    let newData=this.state.data;
    newData[index]=data;
    this.setState({data:newData});
  }

  render() {
    this.updateFieldMapConfigs(this.state.data); //更新节点中的数据
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'30%',
      render: (text, record, index) =>this.renderEditText(index,'colId',text,record,"指定转换的字段Id"),
    },{
      title: '数据类型',
      dataIndex: 'dataType',
      width:'15%',
      render: (text, record, index) =>this.renderDataType(index,'dataType',text,record,"指定数值类型"),
    },{
      title: '固定值',
      dataIndex: 'dataValue',
      width:'35%',
      render: (text, record, index) => this.renderEditText(index,'dataValue', text,record,"固定值优先于条件配置"),
    },{
      title: '条件配置',
      dataIndex: 'caseWhen',
      width:'10%',
      render: (text, record, index) =>{
        if(text=='[]'||text==''||text==undefined){return '-';}else{let dataLength=JSON.parse(text).length;return <Tag color='blue'>{dataLength}</Tag>;}
      }
    },{
      title: '删除',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    }
    ];

    const expandedRow=(record,index)=>{
      return (
        <div style={{border:'1px solid #ccc',background:'#fff',padding:'5px'}}>
                <FieldCaseWhenConfig currentRecord={record} updateData={this.updateData} index={index} />
        </div>
        );
    }

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
              expandedRowRender={expandedRow}
              size="small"
              />
      </div>
      );
  }
}

export default DataValueMapNodeParams;
