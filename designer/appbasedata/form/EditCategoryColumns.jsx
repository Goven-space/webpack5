import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Checkbox} from 'antd';
import EditText from '../../../core/components/EditText';
import EditTextArea from '../../../core/components/EditTextArea';
import EditSelect from '../../../core/components/EditSelect';

class EditCategoryColumns extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curEditIndex:-1,
      data:[],
      newIdNum:0,
    };
  }

  loadParentData=(data)=>{
    let i=0;
    data.forEach((v,index,array)=>{
        i++;
        data[index].id=i;
    });
    this.setState({data:data,newIdNum:data.length});
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditTextArea value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {value:"text",text:'文本框'},
      {value:"textarea",text:'多行文本'},
      {value:"permission",text:'权限选择'},
      {value:"role",text:'角色选择'},
      {value:"user",text:'用户选择'},
      {value:"dept",text:'部门选择'},
      {value:"radio",text:'单选按扭'},
      {value:"number",text:'数字'},
      {value:"datetime",text:'日期'},
      {value:"checkbox",text:'复选框'},
      ];
    return (<EditSelect value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //删除选中行
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    this.setState({data});
    this.props.onChange(data); //传给父控件
  }

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
    // console.log(data);
    this.props.onChange(this.state.data); //传给父控件
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,paramsName:'',paramsValue:'',paramsType:'text',paramsId:''};
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
      title: '字段id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text),
      width:'15%',
    },{
      title: '字段名',
      dataIndex: 'paramsName',
      render: (text, record, index) =>this.renderEditText(index,'paramsName',text),
      width:'15%',
    },{
      title: '类型',
      dataIndex: 'paramsType',
      render: (text, record, index) => this.renderFieldType(index,'paramsType', text),
      width:'15%',
    },{
      title: '默认值',
      dataIndex: 'defaultValue',
      render: (text, record, index) => this.renderEditTextArea(index,'defaultValue', text),
      width:'15%',
    },{
      title: '提示',
      dataIndex: 'tip',
      render: (text, record, index) => this.renderEditText(index,'tip', text),
      width:'15%',
    },{
      title: '必填',
      dataIndex: 'required',
      width:'6%',
      render: (text, record, index) => this.renderCheckBox(index,'required', text),
    },{
      title: '隐藏',
      dataIndex: 'hidden',
      width:'6%',
      render: (text, record, index) => this.renderCheckBox(index,'hidden', text),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>Delete</a></div>);
      },
    }];

    return (
      <div>
        <Button  onClick={this.insertRow}  size="small" >新增字段</Button>
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

export default EditCategoryColumns;
