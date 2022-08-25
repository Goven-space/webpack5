import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Icon} from 'antd';
import EditSelect from '../../../../../core/components/EditSelectOne';
import EditText from '../../../../../core/components/EditText';
import EditTextArea from '../../../../../core/components/EditTextArea';
import * as URI from '../../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../../core/utils/FormUtils';


const SubmitUrl=URI.CONNECT.MONGOD.saveClipMethod;
const FULL_URL=URI.CONNECT.MONGOD.fullConfig;

//参数裁剪配置

class SapCropParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.objectId=this.props.objectId;
    // this.parentData=this.props.cropParamsDocs||[];
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
      newIdNum:0,
    };
  }

  componentDidMount(){
    this.loadData();
  }
  loadData = () => {
    this.setState({ deleteIds: [] });
    let url = FULL_URL + "/" + this.objectId;

    AjaxUtils.get(url, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        this.setState({ data: data.clippMethodList });
      }
    });
  }
  saveData = () => {
        this.setState({mask:true});
        AjaxUtils.post(SubmitUrl,{objectId:this.objectId,cropParams:JSON.stringify(this.state.data)},(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              AjaxUtils.showInfo(data.msg);
            }
        });
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='setValue'){return "字段赋值";}
      if(text==='delete'){return "删除字段";}
      if(text==='script'){return "执行脚本";}
    }
    let data=[
      {text:"字段赋值",value:'setValue'},
      {text:"删除字段",value:'delete'},
      {text:"执行脚本",value:'script'},
      ];
    return (<EditSelect value={text} data={data} onChange={value => this.handleChange(key, index, value)} />);
  }
  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }
  renderFieldSource(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='request'){return "输入参数";}
      if(text==='response'){return "函数输出";}
    }
    let data=[
      {text:"输入参数",value:'request'},
      {text:"函数输出",value:'response'},
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
    let newRow={id:key,paramsValue:'',paramsType:'setValue',paramsId:''};
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
      title: '要裁剪的目标字段',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text,'使用JsonPath指定字段$.data.field'),
      width:'30%',
    },{
      title: '裁剪操作',
      dataIndex: 'paramsType',
      render: (text, record, index) =>this.renderFieldType(index,'paramsType',text),
      width:'10%',
    },{
      title: '设置字段值',
      dataIndex: 'paramsValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'paramsValue',text,'使用JsonPath取其他字段值$.data.id,支持JS脚本函数function run(indoc,outdoc){}'),
      width:'40%',
    },{
      title: '排序',
      dataIndex: 'sort',
      width:'10%',
      render: (text, record, index) => {
        return (<span><Icon type="arrow-up" style={{cursor:'pointer'}} onClick={this.upRecord.bind(this,this.state.data,index)} />
          <Icon type="arrow-down" style={{cursor:'pointer'}} onClick={this.downRecord.bind(this,this.state.data,index)} /></span>);
      },
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
        <Button  onClick={this.saveData}  type="primary" icon='plus' style={{marginBottom:'5px'}} >保存配置</Button> {' '}
        <Button  onClick={this.insertRow}  type="ghost" icon='plus' style={{marginBottom:'5px'}} >添加裁剪</Button> {' '}
        <Button  onClick={this.refrash}   icon='reload' style={{marginBottom:'5px'}} >停止编辑</Button> {' '}
        <Table
        loading={this.state.mask}
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

export default SapCropParamsConfig;
