import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

class RegAPIbusinessDataTag extends React.Component {
  constructor(props) {
    super(props);
    this.backendHeaderParams=this.props.backendHeaderParams;
    this.state = {
      curEditIndex:-1,
      newIdNum:0,
      data:[],
    };
  }

  componentDidMount(){
    this.setData(this.backendHeaderParams);
  }

  getData=()=>{
    let jsonStr=JSON.stringify(this.state.data);
    return jsonStr;
  }

  setData=(headerParams)=>{
    if(headerParams==='' || headerParams==undefined){
      headerParams="[]"
    }
    let jsonData=JSON.parse(headerParams);
    jsonData.forEach((v,index,item)=>{
      jsonData[index].id=index;
    });
    this.setState({data:jsonData});
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderHeader(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"Content-Type",value:'Content-Type'},
      {text:"Authorization",value:'Authorization'},
      {text:"Connection",value:'Connection'},
      {text:"identitytoken",value:'identitytoken'},
      {text:"SOAPAction",value:'SOAPAction'}
      ];
    return (<EditSelect value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='request'){return '请求报文';}
      if(text==='response'){return '响应报文';}
      return text;
    }
    let data=[
      {value:"request",text:'请求报文'},
      {value:"response",text:'响应报文'},
    ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
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
    let newRow={id:key,fieldId:'',dataPath:'',dataType:'response'};
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
      title: '存储字段Id',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text),
      width:'15%',
    },{
      title: '数据来源',
      dataIndex: 'dataType',
      render: (text, record, index) =>this.renderType(index,'dataType',text),
      width:'15%',
    },{
      title: '数据来源路径',
      dataIndex: 'dataValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'dataValue',text,"json用${$.data.userid},xml用${//data}"),
      width:'40%',
    },{
      title: '字段说明',
      dataIndex: 'fieldName',
      render: (text, record, index) => this.renderEditText(index,'fieldName', text),
      width:'15%',
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
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >添加数据标签</Button>
        <Table
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        />
        数据标签中的字段将会被存入到LOG日志库中方便进行业务数据的分析和统计
      </div>
      );
  }
}

export default RegAPIbusinessDataTag;
