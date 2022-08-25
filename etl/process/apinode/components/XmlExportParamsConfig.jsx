import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag,Modal,Input} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditTextArea from '../../../../core/components/EditTextArea';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

const parseExportParamsUrl=URI.ESB.CORE_ESB_NODEPARAMS.parseExportParams;

//webservice输出参数配置

class XmlExportParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.exportParams||[];
    this.parentData.forEach((v,index,item)=>{
      this.parentData[index].id=index;
    });
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
      newIdNum:0,
      visible: false
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
    let newRow={id:key,paramsId:'',paramsValue:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  handleCancel=(e)=>{
      this.setState({visible: false});
  }

  showLoadFromJsonModal=()=>{
    this.setState({visible: true});
  }

  loadFromJson=()=>{
    AjaxUtils.post(parseExportParamsUrl,{body:this.state.paramsBody},(data)=>{
      this.setState({data:data});
    });
  }

  bodyChange=(e)=>{
    this.state.paramsBody=e.target.value;
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '参数名',
      dataIndex: 'paramsId',
      render: (text, record, index) => this.renderEditText(index,'paramsId', text,"支持中文名"),
      width:'25%',
    },{
      title: '参数值',
      dataIndex: 'paramsValue',
      render: (text, record, index) =>this.renderEditText(index,'paramsValue',text,"使用XPath取值并作为本节点的输出参数如://item//userid"),
      width:'65%',
    },{
      title: '操作',
      dataIndex: 'action',
      width:'8%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <Modal  title='从XML响应结果中自动分析' maskClosable={false}
            width='1000px'
            style={{ top: 20 }}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onOk={this.loadFromJson}
            cancelText='关闭'
            okText='开始分析'
            >
            <Input.TextArea  style={{height:'280px'}} onChange={this.bodyChange} />
            请把API的结果XML贴入后点击分析按扭
        </Modal>
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >新增输出参数</Button>{' '}
        <Button  onClick={this.showLoadFromJsonModal}  type="ghost"   icon='arror-up'  style={{marginBottom:'5px'}} >从结果XML中自动分析</Button>
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

export default XmlExportParamsConfig;
