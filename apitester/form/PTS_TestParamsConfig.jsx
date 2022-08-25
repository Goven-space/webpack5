import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button} from 'antd';
import EditText from '../../core/components/EditText';
import EditTextArea from '../../core/components/EditTextArea';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';

class PTS_TestParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curEditIndex:-1,
      data:[],
      newIdNum:0,
    };
  }

 //获取数据
  getData=()=>{
    return this.state.data;
  }

//设置数据
  loadParentData=(data)=>{
    let i=0;
    data.forEach((v,index,array)=>{
      if(data[index].id===undefined){
        i++;
        data[index].id=i;
      }
    });
    this.setState({data:data,newIdNum:data.length});
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
  //  text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
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
    // this.props.onChange(this.state.data); //传给父控件
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,paramsName:'',paramsValue:'',paramsType:'string',paramsId:''};
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
      title: '参数id',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text),
      width:'30%',
    },{
      title: '参数值',
      dataIndex: 'paramsValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'paramsValue',text,"使用${变量id}可以引用压测变量"),
      width:'60%',
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
        <Button  onClick={this.insertRow}  size="small" >新增参数</Button>
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

export default PTS_TestParamsConfig;
