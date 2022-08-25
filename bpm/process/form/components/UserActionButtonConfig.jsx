import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Checkbox} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxEditSelect from '../../../../core/components/AjaxEditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

//用户审批节点的可用操作按扭

const ruleSelectUrl=URI.BPM.CORE_BPM_RULE.select;

class UserActionButtonConfig extends React.Component {
  constructor(props) {
    super(props);
    this.actionIdConfigs=this.props.actionIdConfigs||[];
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.applicationId=this.props.applicationId;
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.state = {
      curEditIndex:-1,
      data:this.actionIdConfigs,
      newIdNum:0,
    };
  }

  componentDidMount(){
  }

  getData=()=>{
    return this.state.data;
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderActionId(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"startRouter",value:'startRouter'},
      {text:"startNode",value:'startNode'},
      {text:"backFirstNode",value:'backFirstNode'},
      {text:"backAnyNode",value:'backAnyNode'},
      {text:"transferOtherUser",value:'transferOtherUser'}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }


  renderProcessRules(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text!=='' && text!==undefined){
          return <Tag color='blue' >{text}</Tag>;
      }else{return '';}
    }
    let data=[];
    return (
      <TreeNodeSelect
      url={this.applicationRuleSelectUrl}
      options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}}
      value={text}
      size='small'
      onChange={value => this.handleChange(key, index, value)}
      />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=(actionId)=>{
    let data=this.state.data.filter((dataItem) => dataItem.actionId!==actionId);
    this.setState({data});
  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
  }

  insertRow=()=>{
    let newRow={id:AjaxUtils.guid(),actionId:'',actionName:'',ruleId:'',visible:true};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '操作Id',
      dataIndex: 'actionId',
      render: (text, record, index) => this.renderActionId(index,'actionId', text),
      width:'25%',
    },{
      title: '操作名称',
      dataIndex: 'actionName',
      render: (text, record, index) =>this.renderEditText(index,'actionName',text,""),
      width:'30%',
    },{
      title: '绑定计算规则',
      dataIndex: 'ruleId',
      render: (text, record, index) =>this.renderProcessRules(index,'ruleId',text),
      width:'25%',
    },{
      title: '显示',
      dataIndex: 'visible',
      render: (text, record, index) =>this.renderCheckBox(index,'visible',text),
      width:'10%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.actionId)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >新增操作</Button>
        <Table
        rowKey={record => record.actionId}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        />
      </div>
      );
  }
}

export default UserActionButtonConfig;
