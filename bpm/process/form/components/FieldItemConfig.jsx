import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Checkbox} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxEditSelect from '../../../../core/components/AjaxEditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

//节点的字段权限

const ruleSelectUrl=URI.BPM.CORE_BPM_RULE.select;

class FieldItemConfig extends React.Component {
  constructor(props) {
    super(props);
    this.fieldConfigs=this.props.fieldConfigs||[];
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.applicationId=this.props.applicationId;
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.state = {
      curEditIndex:-1,
      data:this.fieldConfigs,
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

  renderFieldAcl(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"只读",value:'read'},
      {text:"可编辑",value:'edit'},
      {text:"隐藏",value:'hidden'}
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

  deleteRow=(id)=>{
    //删除选中行
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    data.forEach((v,index,item)=>{
      data[index].id=index;
    });
    this.setState({data});
  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
  }

  insertRow=()=>{
    let newRow={id:AjaxUtils.guid(),fieldId:'',fieldName:'',ruleId:'',fieldAcl:'edit'};
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
      title: '字段Id',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text),
      width:'20%',
    },{
      title: '字段名称',
      dataIndex: 'fieldName',
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text,""),
      width:'20%',
    },{
      title: '字段值',
      dataIndex: 'fieldValue',
      render: (text, record, index) =>this.renderEditText(index,'fieldValue',text,"给定一个缺省值"),
      width:'20%',
    },{
      title: '绑定计算规则',
      dataIndex: 'ruleId',
      render: (text, record, index) =>this.renderProcessRules(index,'ruleId',text),
      width:'20%',
    },{
      title: '权限',
      dataIndex: 'fieldAcl',
      render: (text, record, index) =>this.renderFieldAcl(index,'fieldAcl',text),
      width:'10%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >新增字段</Button>
        <Table
        rowKey={record => record.id}
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

export default FieldItemConfig;
