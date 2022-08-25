import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelectOne';
import EditTextArea from '../../../core/components/EditTextArea';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

class NewRequestLimiterRule_dimension extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.dimensionConfigs||[];
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

  renderType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"用户帐号Id",value:'user'},
      {text:"请求IP段(192.*.*.*)",value:'ip'},
      {text:"输入参数组合",value:'params'},
      {text:"自定义规则(BeanId)",value:'rule'},
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
    let key=this.state.data.length+1;
    let newRow={id:key,keyType:'user',qps:'10'};
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
      title: '分配维度',
      dataIndex: 'keyType',
      render: (text, record, index) => this.renderType(index,'keyType', text),
      width:'30%',
    },{
      title: '维度值',
      dataIndex: 'keyValue',
      render: (text, record, index) =>this.renderEditText(index,'keyValue',text),
      width:'35%',
    },{
      title: '分配比例(合计100)',
      dataIndex: 'qps',
      render: (text, record, index) =>this.renderEditText(index,'qps',text),
      width:'25%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="ghost"   icon='plus'  style={{marginBottom:'5px'}} >添加分配策略</Button>
        <Table
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        />
        {'注意:不在分配维度中的请求默认为使用剩余的可用qps,参数组合格式:${变量}_${ip}=维度值'}
      </div>
      );
  }
}

export default NewRequestLimiterRule_dimension;
