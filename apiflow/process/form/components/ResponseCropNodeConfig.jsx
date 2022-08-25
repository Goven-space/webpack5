import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import EditTextArea from '../../../../core/components/EditTextArea';
import AjaxEditSelect from '../../../../core/components/AjaxEditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

//结果裁剪json配置

const selectExportParams=URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;

class ResponseCropNodeConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.params||[];
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
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

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldValue(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    let url=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.nodeId;
    return (<AjaxEditSelect value={text} url={url}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderActionType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='setvalue'){
        return '赋值';
      }else{
        return '删除';
      }
    }
    let data=[
      {text:"赋值",value:'setvalue'},
      {text:"删除",value:'delete'}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
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
    let newRow={id:key,actionType:'setvalue'};
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
      title: '字段ID',
      dataIndex: 'sourceFieldId',
      render: (text, record, index) => this.renderEditText(index,'sourceFieldId', text,"使用JsonPath表示字段层级"),
      width:'35%',
    },{
      title: '字段值',
      dataIndex: 'fieldValue',
      render: (text, record, index) =>this.renderFieldValue(index,'fieldValue',text,"使用JsonPath取值或设定固定值"),
      width:'45%',
    },{
      title: '裁剪操作',
      dataIndex: 'actionType',
      render: (text, record, index) => this.renderActionType(index,'actionType', text),
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
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >添加字段</Button>
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

export default ResponseCropNodeConfig;
