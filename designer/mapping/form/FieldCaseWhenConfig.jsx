import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelectOne';
import EditTextArea from '../../../core/components/EditTextArea';
import AjaxSelect from '../../../core/components/AjaxSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//case when 条件配置

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class ValueMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.currentRecord=this.props.currentRecord;
    this.caseWhen=JSON.parse(this.currentRecord.caseWhen||'[]');
    this.colId=this.currentRecord.colId;
    this.index=this.props.index;
    this.updateData=this.props.updateData;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: this.caseWhen,
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
    this.currentRecord.caseWhen=JSON.stringify(data);
    //this.updateData(this.currentRecord,this.index);
  }

  renderSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {value:"=",text:'等于(=)'},
      {value:"!=",text:'不等于(!=)'},
      {value:">",text:'大于(>)'},
      {value:"<",text:'小于(<)'},
      {value:">=",text:'大于等于(>=)'},
      {value:"<=",text:'小于等于(<=)'},
      {value:"true",text:'值为true'},
      {value:"false",text:'值为false'},
      {value:"else",text:'其他(else)'},
      {value:"is null",text:'is null'},
      {value:"not is null",text:'not is null'},
      {value:"indexof",text:'包含(indexof)'},
      {value:"+",text:'数字A+B'},
      {value:"-",text:'数字A-B'},
      {value:"*",text:'数字A*B'},
      {value:"/",text:'数字A/B'},
      {value:"concat",text:'字符串A+B'},
      {value:"eval",text:'自定义如:doc.get("字段Id")*3'},
      {value:"setvalue",text:'直接赋为目标值'}
      ];
    return (<EditSelect value={text} data={data}  size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderDataType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"string",value:'string'},
      {text:"number",value:'number'},
      {text:"boolean",value:'boolean'}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} placeholder={placeholder} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  deleteRow=(id)=>{
    if(id!==undefined && id!==""  && id!==null ){
      let data=this.state.data.filter((dataItem) => dataItem.key!==id);
      this.setState({data});
      this.currentRecord.caseWhen=JSON.stringify(data);
      //this.updateData(this.currentRecord,this.index);
    }
  }

  insertRow=()=>{
    //新增加一行
    let key=AjaxUtils.guid();
    let newData=this.state.data;
    let newRow={key:key,colId:this.currentRecord.fieldId,dataType:'string'};
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
    const { data,configFormId } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'colId', text,record),
    },{
      title: '运算符',
      dataIndex: 'symbol',
      width:'20%',
      render: (text, record, index) => this.renderSymbol(index, 'symbol', text),
    },{
      title: '比较值',
      dataIndex: 'colValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colValue', text,record),
    },{
      title: '设置为目标值',
      dataIndex: 'targetValue',
      width:'25%',
      render: (text, record, index) => this.renderEditTextArea(index,'targetValue', text,'支持${变量},[null]表示null'),
    },{
      title: '顺序',
      dataIndex: 'sort',
      width:'8%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    },{
      title: '删除',
      dataIndex: 'action',
      width:'6%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增条件</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >停止编辑</Button>
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
            注意:else条件必须放在最后
      </div>
      );
  }
}

export default ValueMappingConfig;
