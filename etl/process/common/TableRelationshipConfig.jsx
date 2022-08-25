import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelectOne';
import AjaxSelect from '../../../core/components/AjaxSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

//血缘关系配置

const TabPane = Tabs.TabPane;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;
const selectMetaDataUrl=URI.ETL.METADATAMGR.selectAll;

class TableRelationshipConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.from;
    this.applicationId=this.props.applicationId;
    this.ruleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.relationshipColumns=JSON.parse(this.props.relationshipColumns||'[]');
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data:this.relationshipColumns
    };
  }

  componentDidMount(){

  }

  getData=()=>{
    return this.state.data;
  }

  renderTable(index, key, text,record) {
    if(index!==this.state.curEditIndex){
          return text;
    }
    let url=selectMetaDataUrl+"?applicationId="+this.applicationId;
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
    this.setState({ data });
  }

  renderEditText(index, key, text,record,tip) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} placeholder={tip} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    this.setState({data});
  }

  insertRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=AjaxUtils.guid();
    let newRow={id:key};
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
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};

    let columns=[{
      title: '源数据库表',
      dataIndex: 'srcTableName',
      width:'35%',
      render: (text, record, index) => this.renderTable(index,'srcTableName', text,record,""),
    },{
      title: '目标数据库表',
      dataIndex: 'targetTableName',
      width:'35%',
      render: (text, record, index) => this.renderTable(index,'targetTableName', text,record,""),
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'remark', text,record,""),
    },
    {
      title: '删除',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.id)}>删除</a></span>);
      }
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增关系</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.id}
              dataSource={this.state.data}
              columns={columns}
              onRowClick={this.onRowClick}
              pagination={false}
              size='small'
              />
      </div>
      );
  }
}

export default TableRelationshipConfig;
