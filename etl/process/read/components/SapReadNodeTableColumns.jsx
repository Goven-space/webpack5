import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditSelect from '../../../../core/components/EditSelectOne';
import EditText from '../../../../core/components/EditText';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

class SapReadNodeTableColumns extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.inParams||[];
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

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderTableType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text=='IN'){return <Tag color='blue'>输入表</Tag>;}
      return <Tag color='green'>输出表</Tag>;
    }
    let data=[{text:"输入表",value:'IN'},{text:"输出表",value:'OUT'}];
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
    let newRow={id:key,paramType:'IN'};
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
      title: '类型',
      dataIndex: 'paramType',
      render: (text, record, index) =>this.renderTableType(index,'paramType',text),
      width:'10%',
    },{
      title: '表名',
      dataIndex: 'tableName',
      render: (text, record, index) => this.renderEditText(index,'tableName', text),
      width:'20%',
    },{
      title: '参数值',
      dataIndex: 'data',
      render: (text, record, index) =>this.renderEditTextArea(index,'data',text,"使用JSONPath取变量$.fieldId"),
      width:'65%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px'}} >添加表</Button> {' '}
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

export default SapReadNodeTableColumns;
