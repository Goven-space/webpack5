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

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsSelect;
const ruleSelectUrl=URI.ETL.RULE.select;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class DataSecurityFieldConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.ruleSelectUrl=ruleSelectUrl+"?applicationId="+this.props.applicationId;
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
      value=value.join(","); //?????????????????????
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
    return (<TreeNodeSelect url={this.ruleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
  }

  renderEditText(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    if(id!==undefined && id!==""  && id!==null ){
      let data=this.state.data.filter((dataItem) => dataItem.key!==id);
      this.setState({data});
    }
  }

  insertRow=()=>{
    //???????????????
    let newData=this.state.data;
    let key=AjaxUtils.guid();
    let newRow={key:key,transfer:true};
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
    this.updateFieldMapConfigs(this.state.data); //????????????????????????
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '??????Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) =>this.renderSourceColId(index,'colId',text,record),
    },{
      title: '??????????????????',
      dataIndex: 'ruleId',
      width:'45%',
      render: (text, record, index) => this.renderConvertRuleIds(index,'ruleId', text,record),
    },{
      title: '????????????',
      dataIndex: 'ruleParams',
      width:'30%',
      render: (text, record, index) => this.renderEditText(index,'ruleParams', text,record),
    },{
      title: '??????',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>??????</a></span>);
      },
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >??????????????????</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >??????</Button>
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

export default DataSecurityFieldConfig;
