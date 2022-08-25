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
import ReactJson from 'react-json-view'

const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const importApiParamsUrl=URI.ESB.CORE_ESB_RULE.importApiParams;

class DubboNodeParamsConfig extends React.Component {
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
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamsType(index, key, text) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    let data=[
      {text:"java.lang.String",value:'java.lang.String'},
      {text:"int",value:'int'},
      {text:"long",value:'long'},
      {text:"float",value:'float'},
      {text:"double",value:'double'},
      {text:"java.util.List",value:'java.util.List'},
      ];
    return (<EditSelect value={text} data={data} size='default'  placeholder="指定参数类型" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
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
    //新增加一行
    let key=this.state.data.length+1;
    let newRow={id:key,paramsName:'',paramsValue:'',paramsId:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
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
      title: '参数id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text),
      width:'15%',
    },{
      title: '参数说明',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditText(index,'paramsName',text),
      width:'15%',
    },{
      title: '参数类型',
      dataIndex: 'paramsType',
      render: (text, record, index) =>this.renderParamsType(index,'paramsType',text),
      width:'15%',
    },{
      title: '参数值',
      dataIndex: 'paramsValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'paramsValue',text,"取上一节点结果$.变量,取指定节点结果$.T00001.userId,取Header参数$.header|http.userId"),
      width:'50%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    const expandedRow=(record,index)=>{
      try{
        record.paramsValue=JSON.parse(record.paramsValue);
      }catch(e){}
      return (
        <Card title="参数JSON对象">
          <ReactJson src={record}
            onEdit={(obj)=>{this.updateRecord(obj,index)}}
            onAdd={(obj)=>{this.updateRecord(obj,index)}}
            onDelete={(obj)=>{this.updateRecord(obj,index)}}  />
        </Card>
        );
    }

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >添加参数</Button> {' '}
        <Button  onClick={this.refrash}   icon='reload' style={{marginBottom:'5px'}} >停止编辑</Button> {' '}
        <Table
        loading={this.state.mask}
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        onExpand={()=>{this.setState({curEditIndex:-1})}}
        pagination={false}
        size="small"
        expandedRowRender={expandedRow}
        />
      </div>
      );
  }
}

export default DubboNodeParamsConfig;
