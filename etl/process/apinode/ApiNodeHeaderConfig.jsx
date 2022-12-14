import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import EditTextArea from '../../../core/components/EditTextArea';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const ruleSelectUrl=URI.ETL.RULE.select;

class ApiNodeHeaderConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.inParams||[];
    this.parentData.forEach((v,index,item)=>{
      this.parentData[index].id=index;
    });
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
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

  renderHeader(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"Content-Type",value:'Content-Type'},
      {text:"Authorization",value:'Authorization'},
      {text:"Connection",value:'Connection'},
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
      url={ruleSelectUrl}
      options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}}
      value={text}
      size='small'
      onChange={value => this.handleChange(key, index, value)}
      />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //?????????json???????????????
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //???????????????
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
    //???????????????
    let key=this.state.data.length+1;
    let newRow={id:key,headerId:'',headerValue:'',headerRule:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: 'Header',
      dataIndex: 'headerId',
      render: (text, record, index) => this.renderHeader(index,'headerId', text),
      width:'30%',
    },{
      title: '?????????',
      dataIndex: 'headerValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'headerValue',text,"??????JsonPath???indoc??????????????????${fieldId},${$.data.id}"),
      width:'60%',
    },{
      title: '??????',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>??????</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >??????Header???</Button>
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

export default ApiNodeHeaderConfig;
