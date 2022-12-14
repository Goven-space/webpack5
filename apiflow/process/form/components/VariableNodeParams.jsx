import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import EditTextArea from '../../../../core/components/EditTextArea';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;

class VariableNodeParams extends React.Component {
  constructor(props) {
    super(props);
    this.serviceId=this.props.serviceId;
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

  refrash=()=>{
    this.setState({curEditIndex:-1})
  }

  getData=()=>{
    return this.state.data;
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
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
    let r=Object.prototype.toString.call(text);
    if(r==='[object Object]'){
      text=JSON.stringify(text);
    }
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //?????????json???????????????
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderIncreType(index, key, text) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    let data=[
      {text:"??????",value:'1'},
      {text:"??????",value:'0'},
      {text:"??????",value:'2'},
      ];
    return (<EditSelect value={text} data={data} size='default'  placeholder="??????????????????" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
  }

  renderValueType(index, key, text) {
    let data=[
      {text:"??????",value:'101'},
      {text:"??????",value:'102'},
      {text:"???",value:'1'},
      {text:"???",value:'2'},
      {text:"???",value:'5'},
      {text:"???",value:'10'},
      {text:"???",value:'12'},
      {text:"???",value:'13'},
      ];
    if(index!==this.state.curEditIndex){
      data.forEach((v,index,item)=>{
        if(v.value===text){
          text=v.text;
        }
      });
      return text;
    }
    return (<EditSelectOne value={text} data={data} size='default'  placeholder="????????????" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
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
    let newRow={id:key,paramsName:'',step:'1',valueType:'101',paramsId:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  updateRecord=(obj,index)=>{
        let data=this.state.data;
        data[index]=obj.updated_src;
        this.setState({data:data});
  }


  render() {
    const { data } = this.state;
    const columns=[{
      title: '??????id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text,"??????JsonPath???$.data.pageNo"),
      width:'19%',
    },{
      title: '?????????',
      dataIndex: 'initValue',
      render: (text, record, index) =>this.renderEditText(index,'initValue',text,"???????????????2020-03-05 10:11:00"),
      width:'17%',
    },{
      title: '??????',
      dataIndex: 'step',
      render: (text, record, index) =>this.renderEditText(index,'step',text,"??????????????????"),
      width:'10%',
    },{
      title: '????????????',
      dataIndex: 'valueType',
      render: (text, record, index) =>this.renderValueType(index,'valueType',text),
      width:'8%',
    },{
      title: '????????????',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditText(index,'paramsName',text),
      width:'15%',
    },{
      title: '??????',
      dataIndex: 'action',
      width:'6%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>??????</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >????????????</Button> {' '}
        <Button  onClick={this.refrash}   icon='reload' style={{marginBottom:'5px'}} >????????????</Button> {' '}
        <Table
        loading={this.state.mask}
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        onExpand={()=>{this.setState({curEditIndex:-1})}}
        pagination={false}
        size="small"
        />
      </div>
      );
  }
}

export default VariableNodeParams;
