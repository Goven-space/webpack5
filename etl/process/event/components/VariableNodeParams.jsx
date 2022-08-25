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

  renderIncreType(index, key, text) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    let data=[
      {text:"递增",value:'1'},
      {text:"递减",value:'0'},
      {text:"常量",value:'2'},
      ];
    return (<EditSelect value={text} data={data} size='default'  placeholder="指定参数类型" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
  }

  renderValueType(index, key, text) {
    let data=[
      {text:"整数",value:'101'},
      {text:"常量",value:'102'},
      {text:"年",value:'1'},
      {text:"月",value:'2'},
      {text:"日",value:'5'},
      {text:"时",value:'10'},
      {text:"分",value:'12'},
      {text:"秒",value:'13'},
      ];
    if(index!==this.state.curEditIndex){
      data.forEach((v,index,item)=>{
        if(v.value===text){
          text=v.text;
        }
      });
      return text;
    }
    return (<EditSelectOne value={text} data={data} size='default'  placeholder="增量类型" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
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
    let key=AjaxUtils.guid();
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
      title: '变量id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text,""),
      width:'19%',
    },{
      title: '初始值',
      dataIndex: 'initValue',
      render: (text, record, index) =>this.renderEditText(index,'initValue',text,"支持${变量},字符,数字,日期"),
      width:'17%',
    },{
      title: '增量',
      dataIndex: 'step',
      render: (text, record, index) =>this.renderEditText(index,'step',text,"负数表示递减"),
      width:'10%',
    },{
      title: '增量类型',
      dataIndex: 'valueType',
      render: (text, record, index) =>this.renderValueType(index,'valueType',text),
      width:'8%',
    },{
      title: '参数说明',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditText(index,'paramsName',text),
      width:'15%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'6%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >添加变量</Button> {' '}
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
        />
      </div>
      );
  }
}

export default VariableNodeParams;
