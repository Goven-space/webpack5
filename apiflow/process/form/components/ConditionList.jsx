import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card,Icon,Divider} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

//FS定制版本

class ConditionList extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.parentData;
    this.title=this.props.title;
    this.delGroup=this.props.delGroup;
    this.index=this.props.index;
    this.state = {
      curEditIndex:-1,
      conditionStr:'',
      data:this.parentData.data,
    };
  }

  componentDidMount(){
    this.previewCondition();
  }

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCondtion(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"=",value:'='},
      {text:">",value:'>'},
      {text:">=",value:'>='},
      {text:"<",value:'<'},
      {text:"<=",value:'<='},
      {text:"!=",value:'!='},
      {text:"无",value:''}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderBeforeSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text=='(' || text==''){return text;}
      else {return <span style={{paddingLeft:'20px'}}>{text}</span>;}
    }
    let data=[
      {text:"AND",value:'AND'},
      {text:"OR",value:'OR'},
      {text:"(",value:'('},
      {text:"无",value:''}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderAfterSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:")",value:')'},
      {text:"无",value:''}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id,index)=>{
    let data=this.state.data;
    data.splice(index, 1)
    this.setState({data:data});
    this.previewCondition();
  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
    this.previewCondition();
  }

  insertRow=(index)=>{
    //插入一行
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldBefore:this.parentData.relationship,fieldId:'',fieldValue:''};
    let newData=this.state.data;
    newData.splice(index,0,newRow);
    this.setState({data:newData,curEditIndex:-1});
    this.previewCondition();
  }

  addRow=(fieldType)=>{
    //在最后新增加一行
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldBefore:this.parentData.relationship,fieldId:'',fieldValue:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1});
    this.previewCondition();
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
    this.previewCondition();
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
    this.previewCondition();
  }

  previewCondition=()=>{
    let conditionStr="";
    let data=this.state.data;
    for(let i=0;i<data.length;i++){
      let item=data[i];
      if(item.fieldBefore!=='' && item.fieldBefore!=undefined){
        conditionStr+=item.fieldBefore+" ";
      }
      if(item.fieldId!=='' && item.fieldId!=undefined){
        conditionStr+=item.fieldId+" ";
      }
      if(item.fieldCondtion!=='' && item.fieldCondtion!=undefined){
        conditionStr+=item.fieldCondtion+" ";
      }
      if(item.fieldValue!=='' && item.fieldValue!=undefined){
        conditionStr+=item.fieldValue+" ";
      }
      if(item.fieldAfter!=='' && item.fieldAfter!=undefined){
        conditionStr+=item.fieldAfter+" ";
      }
    }
    this.setState({conditionStr:conditionStr});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '',
      dataIndex: 'fieldBefore',
      render: (text, record, index) => this.renderBeforeSymbol(index,'fieldBefore', text,record),
      width:'10%',
    },{
      title: '字段',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text,record,'引用变量$.T00001.data'),
      width:'25%',
    },{
      title: '运算符',
      dataIndex: 'fieldCondtion',
      render: (text, record, index) =>this.renderCondtion(index,'fieldCondtion',text,record),
      width:'10%',
    },{
      title: '字段值',
      dataIndex: 'fieldValue',
      render: (text, record, index) =>this.renderEditText(index,'fieldValue',text,record,'引用变量$.T00002.data'),
      width:'30%',
    },{
      title: '',
      dataIndex: 'fieldAfter',
      render: (text, record, index) =>this.renderAfterSymbol(index,'fieldAfter',text,record),
      width:'8%',
    },{
      title: '排序',
      dataIndex: 'sortNum',
      width:'5%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
    },{
      title: '操作',
      dataIndex: 'action',
      width:'15%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.insertRow(index)}>插入</a> <Divider type="vertical" /> <a onClick={() => this.deleteRow(record.id,index)}>删除</a>
        </div>);
      },
    }];

    return (
      <Card size="small" title={this.title} style={{"marginTop":"5px","padding":"1px"}} extra={
            <div>
            <Button  onClick={this.addRow.bind(this,'1')}  type="ghost"   icon='plus'  >添加条件</Button>{' '}
            <Button onClick={() => this.delGroup(this.index)}>删除组</Button>
            </div>
        } >
        <Table
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        />
        条件预览:{this.state.conditionStr}
    </Card>
      );
  }
}

export default ConditionList;
