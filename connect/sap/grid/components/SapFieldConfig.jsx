import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Card,Input} from 'antd';
import EditText from '../../../../core/components/EditText';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';

//结构或者是表输入输出的字段配置列表

const ruleSelectUrl=URI.CONNECT.SAP_RULE.select;

class SapFieldConfig extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.record=this.props.record;
    if(this.record.paramsFields===undefined){
      this.record.paramsFields=[];
    }
    this.state = {
      curEditIndex:-1,
      data:this.record.paramsFields,
      newIdNum:0,
    };
  }

  componentDidMount(){
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditRule(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){
      if(text!=='' && text!==undefined){
        return <Tag color='blue'>{text}</Tag>;
      }else{
        return '';
      }
    }
    return (<TreeNodeSelect url={ruleSelectUrl} options={{style:{width:'100%'},showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
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
    this.record.paramsFields=data;
    this.setState({ data });
  }

  insertRow=()=>{
    //新增加一行
    let key=AjaxUtils.guid();
    let newRow={id:key,fieldId:'',fieldName:'',fieldType:'char',fieldLength:'100'};
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
      title: '字段id',
      dataIndex: 'fieldId',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text),
      width:'30%',
    },{
      title: '字段说明',
      dataIndex: 'fieldName',
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text),
      width:'35%',
    },{
      title: '类型',
      dataIndex: 'fieldType',
      render: (text, record, index) =>this.renderEditText(index,'fieldType',text),
      width:'15%',
    },{
      title: '长度',
      dataIndex: 'fieldLength',
      render: (text, record, index) =>this.renderEditText(index,'fieldLength',text),
      width:'15%',
    }];

    const expandedRow=(record)=>{
      return (
        <span>
          {record.fieldType.toLowerCase()=='structure'||record.fieldType.toLowerCase()=='table'?
          <Card title='参数字段列表'><SapFieldConfig record={record} /></Card>
          :<Card>本参数为非结构类型,无需配置字段</Card>
          }
       </span>
        );
    }

    return (
      <div>
        <Button  onClick={this.insertRow}  type="primary" icon='plus' style={{marginBottom:'5px',display:'none'}} >添加字段</Button>
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

export default SapFieldConfig;
