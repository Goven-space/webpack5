import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card,Input,Badge} from 'antd';
import EditSelect from '../../../../core/components/EditSelectOne';
import EditText from '../../../../core/components/EditText';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import SapFieldConfig from './SapFieldConfig';

const SubmitUrl=URI.CONNECT.SAPRFC.outputparams;
const readparams=URI.CONNECT.SAPRFC.readparams;

class SapOutputParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.parentData=this.props.outParamsDocs||[];
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
      newIdNum:0,
    };
  }

  componentDidMount(){
  }

  saveData = () => {
        this.setState({mask:true});
        AjaxUtils.post(SubmitUrl,{id:this.id,outputParams:JSON.stringify(this.state.data)},(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              AjaxUtils.showInfo(data.msg);
            }
        });
  }

  readparams=()=>{
    this.setState({mask:true});
    AjaxUtils.post(readparams,{id:this.id},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("导入成功");
          this.setState({data:data.outputParams});
        }
    });
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamsId(index, key, text,record) {
       if(record.paramsType==='structure'||record.paramsType==='table'){
         if(record.paramsFields==undefined){record.paramsFields=[];}
         return <span>{text}{' '}<Badge count={record.paramsFields.length} showZero style={{ backgroundColor: '#ccc' }} /></span>;
       }else{
         return text;
       }
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"field",value:'field'},
      {text:"structure",value:'structure'},
      {text:"table",value:'table'}
      ];
    return (<EditSelect value={text} data={data} onChange={value => this.handleChange(key, index, value)} />);
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
    let newRow={id:key,paramsName:'',paramsValue:'',paramsType:'field',paramsId:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  refrash=()=>{
    this.setState({curEditIndex:-1})
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '参数id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderParamsId(index,'paramsId', text,record),
      width:'30%',
    },{
      title: '参数说明',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditText(index,'paramsName',text),
      width:'30%',
    },{
      title: '参数类型',
      dataIndex: 'paramsType',
      render: (text, record, index) =>this.renderFieldType(index,'paramsType',text),
      width:'15%',
    },{
      title: '参数别名',
      dataIndex: 'paramsAliasId',
      render: (text, record, index) => this.renderEditText(index,'paramsAliasId', text),
      width:'20%',
    }];

    const expandedRow=(record)=>{
      return (
        <span>
          {record.paramsType=='structure'||record.paramsType=='table'?
          <Card title='参数字段列表'><SapFieldConfig record={record} /></Card>
          :<Card>本参数为非结构类型,无需配置字段</Card>
          }
       </span>
        );
    }

    return (
      <div>
        <Button  onClick={this.saveData}  type="primary" icon='plus' style={{marginBottom:'5px'}} >保存配置</Button> {' '}
        <Button  onClick={this.readparams}  type="ghost" icon='arrow-up' style={{marginBottom:'5px'}} >导入输出参数</Button> {' '}
        <Button  onClick={this.insertRow}  type="ghost" icon='plus' style={{marginBottom:'5px',display:'none'}} >添加参数</Button> {' '}
        <Table
        loading={this.state.mask}
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        expandedRowRender={expandedRow}
        />
      </div>
      );
  }
}

export default SapOutputParamsConfig;
