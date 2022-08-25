import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import EditTextArea from '../../../../core/components/EditTextArea';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
const listProceduresParams=URI.CORE_DESIGNER_PROCEDURE.listProceduresParams;

class ProduceParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.state = {
      curEditIndex:-1,
      data:[],
      mask:true,
      newIdNum:0,
    };
  }

  componentDidMount(){
    this.setState({mask:false});
  }

  loadDatabaseProcedureParams=()=>{
      let procedureName=this.form.getFieldValue("procedureId");
      let dbConnId=this.form.getFieldValue("dbConnId");
      if(procedureName==='' || procedureName===null){message.error("请先指定存储过程名再执行本操作!");return;}
      this.setState({mask:true});
      AjaxUtils.post(listProceduresParams,{dbConnId:dbConnId,procedureName:procedureName},(data)=>{
            if(data.state===false){
              this.setState({mask:false});
              message.error(data.msg);
            }else{
              AjaxUtils.showInfo("参数载入成功!");
              this.setData(data);
            }
      });
    }


  refrash=()=>{
    this.setState({curEditIndex:-1})
  }

  getData=()=>{
    return this.state.data;
  }

  setData=(parentData)=>{
    parentData.forEach((v,index,item)=>{
      parentData[index].id=index;
    });
    this.setState({data:parentData,mask:false});
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderParamsType(index, key, text) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    let data=[
      {text:"string",value:'string'},
      {text:"int",value:'int'},
      {text:"long",value:'long'},
      {text:"float",value:'float'},
      {text:"double",value:'double'},
      {text:"boolean",value:'boolean'},
      ];
    return (<EditSelect value={text} data={data} size='default'  onChange={value => this.handleChange(key, index, value)} style={{minWidth:'100'}} />);
  }

  renderInOutType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text=='IN'){return <Tag color='green'>输入</Tag>}
      else if(text=='OUT'){return <Tag color='blue'>输出</Tag>}
      return text;
    }
    let data=[
      {text:"输入",value:'IN'},
      {text:"输出",value:'OUT'},
      ];
    return (<EditSelectOne value={text} data={data} size='default' onChange={value => this.handleChange(key, index, value)}  />);
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
    let newRow={id:key,fieldNum:key,fieldId:'',fieldType:'string',inoutType:'IN',fieldName:'',fieldValue:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  updateRecord=(obj,index)=>{
        let data=this.state.data;
        data[index]=obj.updated_src;
        this.setState({data:data});
  }


  render() {
    const { data } = this.state;
    const columns=[{
      title: '参数顺序',
      dataIndex: 'fieldNum',
      render: (text, record, index) => this.renderEditText(index,'fieldNum', text),
      width:'6%',
    },{
      title: '参数Id',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text),
      width:'18%',
    },{
      title: '参数说明',
      dataIndex: 'fieldName',
      render: (text, record, index) => this.renderEditText(index,'fieldName', text),
      width:'15%',
    },{
      title: '数据类型',
      dataIndex: 'fieldType',
      render: (text, record, index) => this.renderParamsType(index,'fieldType', text),
      width:'10%',
    },{
      title: '参数方向',
      dataIndex: 'inoutType',
      render: (text, record, index) =>this.renderInOutType(index,'inoutType',text),
      width:'8%',
    },{
      title: '缺省值',
      dataIndex: 'fieldValue',
      render: (text, record, index) => this.renderEditText(index,'fieldValue', text),
      width:'10%',
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
        <Button  onClick={this.insertRow}  type="primary" icon='plus' size='small' style={{marginBottom:'5px'}} >新增参数</Button> {' '}
        <Button  onClick={this.loadDatabaseProcedureParams}   icon='reload' style={{marginBottom:'5px'}} size='small' >自动导入参数</Button> {' '}
        <Table
        loading={this.state.mask}
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        onExpand={()=>{this.setState({curEditIndex:-1})}}
        pagination={false}
        size="small"
        />
      </div>
      );
  }
}

export default ProduceParamsConfig;
