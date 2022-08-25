import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import ReactJson from 'react-json-view'

const listNodeJsonPath=URI.ETL.PROCESSNODE.listNodeJsonPath;


class JsonMapNodeParams extends React.Component {
  constructor(props) {
      super(props);
      this.processId=this.props.processId;
      this.nodeId=this.props.nodeId;
      this.parentData=this.props.params||[];
      this.parentData.forEach((v,index,item)=>{
        this.parentData[index].id=index;
      });
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
      srcParamsData:[],
      targetParamsData:[],
      newIdNum:0,
    };
  }

  componentDidMount(){
    this.loadNodeJsonPathParams();
  }

  //载入前后节点的输入和输出参数进行配置
   loadNodeJsonPathParams=()=>{
         let url=listNodeJsonPath+"?processId="+this.processId+"&nodeId="+this.nodeId;
         this.setState({mask:true});
         AjaxUtils.get(url,(data)=>{
             this.setState({mask:false,srcParamsData:data.inParams,targetParamsData:data.outParams});
         });
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

  renderEditTextArea(index, key, text) {
    if(text===undefined || text==='undefined'){text='';}
    let r=Object.prototype.toString.call(text);
    if(r==='[object Object]'){
      text=JSON.stringify(text);
    }
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamsType(index, key, text) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    let data=[
      {text:"string",value:'string'},
      {text:"int",value:'int'},
      {text:"long",value:'long'},
      {text:"float",value:'float'},
      {text:"double",value:'double'},
      {text:"boolean",value:'boolean'},
      {text:"substring(0,10)",value:'substring(0,10)'},
      {text:"substringBefore(-)",value:'substringBefore(-)'},
      {text:"substringAfter(-)",value:'substringAfter(-)'},
      {text:"between(a,b)",value:'between(a,b)'},
      ];
    return (<EditSelect value={text} data={data} size='default'  placeholder="空表示不转换" onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
  }

  renderInParams(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditSelect value={text} placeholder={placeholder} data={this.state.srcParamsData} size='default' onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
  }

  renderOutParams(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditSelect value={text} placeholder={placeholder} data={this.state.targetParamsData} size='default' onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
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
    let newRow={id:key,sourceField:'',targetField:'',fieldType:''};
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
      title: '目标流字段Id',
      dataIndex: 'targetField',
      render: (text, record, index) =>this.renderOutParams(index,'targetField',text,"填写目标流字段的Id"),
      width:'30%',
    },{
      title: '数据来源(JsonPath取值)',
      dataIndex: 'sourceField',
      render: (text, record, index) => this.renderInParams(index,'sourceField', text,"取值逐行用$.userid,整体用:$.data[0].userid"),
      width:'30%',
    },{
      title: '转换类型',
      dataIndex: 'targetFieldType',
      render: (text, record, index) =>this.renderParamsType(index,'targetFieldType',text),
      width:'20%',
    },{
      title: '备注',
      dataIndex: 'remark',
      render: (text, record, index) =>this.renderEditTextArea(index,'remark',text),
      width:'10%',
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
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >添加配置</Button> {' '}
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

export default JsonMapNodeParams;
