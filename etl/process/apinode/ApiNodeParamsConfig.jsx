import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelectOne from '../../../core/components/EditSelectOne';
import EditTextArea from '../../../core/components/EditTextArea';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const ruleSelectUrl=URI.ETL.RULE.select;
const importApiParamsUrl=URI.ETL.RULE.importApiParams;

class ApiNodeParamsConfig extends React.Component {
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

  componentWillReceiveProps=(nextProps)=>{
    if(this.serviceId!==nextProps.serviceId){
      this.serviceId=nextProps.serviceId;
    }
  }

  getData=()=>{
    return this.state.data;
  }

  importParams=()=>{
    if(this.serviceId===undefined){
      AjaxUtils.showError("只有选择一个API才可以导入参数,未注册API不支持导入参数!");
      return;
    }
    let url=importApiParamsUrl+"?serviceId="+this.serviceId;
    this.setState({mask:true});
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          if(data.inParams.length==0){AjaxUtils.showInfo("未找到API的输入参数!");}
          this.setState({data:data.inParams});
        }
    });
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
    let key=this.state.data.length+1;
    let newRow={id:key,paramsName:'',paramsValue:'',paramsSource:'AUTO',paramsId:''};
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
      render: (text, record, index) => this.renderEditText(index,'paramsId', text),
      width:'15%',
    },{
      title: '参数说明',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditTextArea(index,'paramsName',text),
      width:'15%',
    },{
      title: '参数值',
      dataIndex: 'paramsValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'paramsValue',text,"使用JSONPath取变量{$.fieldId}"),
      width:'45%',
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
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >添加参数</Button> {' '}
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

export default ApiNodeParamsConfig;
