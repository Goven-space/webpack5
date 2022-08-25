import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsSelect;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class ValueComputeFiledConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
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

  renderSourceColId(index, key, text,record) {
    if(index!==this.state.curEditIndex){
          return text;
    }
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+this.parentForm.getFieldValue("sourceNodeIds");
    return (<AjaxSelect url={url} value={text} options={{mode:'combobox'}}  onChange={value => this.handleChange(key, index, value)} />);
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

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"string",value:'string'},
      {text:"int",value:'int'},
      {text:"long",value:'long'},
      {text:"double",value:'double'}
      ];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderExpression(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"A+B",value:'A+B'},
      {text:"A*B",value:'A*B'},
      {text:"A/B",value:'A/B'},
      {text:"A-B",value:'A-B'},
      {text:'A+符号+B',value:'A+符号+B'},
      {text:'等于A',value:'=A'},
      {text:'等于B',value:'=B'},
      {text:'自定义公式(2-A/B)',value:''}
      ];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,record,tip) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} placeholder={tip} onChange={value => this.handleChange(key, index, value)} />);
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
    let newRow={key:key,valueType:'string'};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  render() {
    this.updateFieldMapConfigs(this.state.data); //更新节点中的数据
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '新字段(结果)',
      dataIndex: 'colId',
      width:'15%',
      render: (text, record, index) =>this.renderSourceColId(index,'colId',text,record),
    },{
      title: '计算',
      dataIndex: 'expression',
      width:'20%',
      render: (text, record, index) => this.renderExpression(index,'expression', text,record),
    },{
      title: '字段A',
      dataIndex: 'colId_a',
      width:'10%',
      render: (text, record, index) => this.renderSourceColId(index,'colId_a', text,record),
    },{
      title: '字段B',
      dataIndex: 'colId_b',
      width:'10%',
      render: (text, record, index) => this.renderSourceColId(index,'colId_b', text,record),
    },{
      title: '值类型',
      dataIndex: 'valueType',
      width:'10%',
      render: (text, record, index) => this.renderFieldType(index,'valueType', text,record),
    },{
      title: '小数精度',
      dataIndex: 'precision',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index,'precision', text,record),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    },{
      title: '序号',
      dataIndex: 'index',
      width:'5%',
      render: (text, record, index) => {return index+1;}
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增字段</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
                <CloumnsFieldAction thisobj={this} />
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

export default ValueComputeFiledConfig;
