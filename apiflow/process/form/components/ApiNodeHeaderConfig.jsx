import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditTextArea from '../../../../core/components/EditTextArea';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import AjaxEditSelect from '../../../../core/components/AjaxEditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';

const ruleSelectUrl=URI.ESB.CORE_ESB_RULE.select;
const selectExportParams=URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;
const headerOptListUrl=URI.NEW_SERVICE.headerOptList;

class ApiNodeHeaderConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentData=this.props.inParams||[];
    this.processId=this.props.processId;
    this.nodeId=this.props.nodeId;
    this.applicationId=this.props.applicationId;
    this.parentData.forEach((v,index,item)=>{
      this.parentData[index].id=index;
    });
    this.applicationRuleSelectUrl=ruleSelectUrl+"?applicationId="+this.applicationId;
    this.state = {
      curEditIndex:-1,
      data:this.parentData,
      newIdNum:0,
      HeaderOpt:[],
      HeaderData:[],
    };
  }

  /* 只有选择api并且点击确认按钮才会执行 */
  componentDidMount(){
    if(this.props.apiSelectRows && this.props.apiSelectRows.length) {
      this.getApiData(this.props.apiSelectRows)
    }
    this.getHeaderListOpt()
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.serviceId!==nextProps.serviceId){
      this.serviceId=nextProps.serviceId;
    }

    if(nextProps.apiSelectRows !== this.props.apiSelectRows) {
      this.getApiData(nextProps.apiSelectRows)
    }
  }

  getApiData = (apiSelectRows=[]) => {
    if(!apiSelectRows.length) {
      this.setState({
        data:[]
     })
      return false
    }
      const {backendHeaderParams} = apiSelectRows[0]
      if(backendHeaderParams) {
        const newBackendHeaderParams = typeof backendHeaderParams === 'string'? JSON.parse(backendHeaderParams):backendHeaderParams
        this.setState({
           data:newBackendHeaderParams
        })
      }else{
        this.setState({
          data:[]
       })
      }
  }

  getHeaderListOpt = () => {
    AjaxUtils.get(headerOptListUrl, (data) => {
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
        this.setState({
          HeaderData:data.map(item => ({headerId: item.value?String(item.value.headerId):'', headerValue:item.value.headerValue,description:item.value.errorMsg, headerName:item.value.headerName,headerType:item.value.headerType})),
          HeaderOpt: data.map(item => ({text: item.text, value: item.value?String(item.value.headerId):''})) /**/
        })
      }
    })
  }

  getData=()=>{
    return this.state.data;
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderHeader(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    /* let data=[
      {text:"Content-Type",value:'Content-Type'},
      {text:"Authorization",value:'Authorization'},
      {text:"Connection",value:'Connection'},
      {text:"SOAPAction",value:'SOAPAction'}
      ]; */
    return (<EditSelect value={text} data={this.state.HeaderOpt} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderHeaderValue(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    let url=selectExportParams+"?processId="+this.processId+"&currentNodeId="+this.nodeId;
    return (<AjaxEditSelect value={text} url={url}  onChange={value => this.handleChange(key, index, value)} />);
  }


  renderProcessRules(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(text!=='' && text!==undefined){
				if(record.paramsRuleShow) {
					return <Tag color='blue' >{record.paramsRuleShow}</Tag>;
				}else {
					return <Tag color='blue' >{text}</Tag>;
				}
      }else{return '';}
    }
    let data=[];
    return (
      <TreeNodeSelect
      url={this.applicationRuleSelectUrl}
      options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}}
      value={text}
      size='small'
      onChange={(value,label) => this.handleChange(key, index, value,label)}
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

  handleChange=(key, index, value, selectLabel)=>{
    const { data, HeaderData } = this.state;
    if(key === 'headerId' && HeaderData.find(item => item.headerId === value)) {
      let itemData = HeaderData.find(item => item.headerId === value)
      data[index] = {...data[index],...itemData}
    }else {
      data[index][key] = value
      data[index]['paramsRuleShow'] = selectLabel
    }
    ;
    this.setState({ data });
  }


  insertRow=()=>{
    //新增加一行
    let key=this.state.data.length+1;
    let newRow={id:key,headerId:'',headerValue:'',headerRule:''};
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
      title: 'Header',
      dataIndex: 'headerId',
      render: (text, record, index) => this.renderHeader(index,'headerId', text),
      width:'20%',
    },{
      title: '缺省值',
      dataIndex: 'headerValue',
      render: (text, record, index) =>this.renderHeaderValue(index,'headerValue',text,"取上一节点结果$.变量,取指定节点结果$.T00001.userId,取Header参数$.header|http.userId,全局变量$.global.userid"),
      width:'45%',
    },{
      title: '绑定计算规则',
      dataIndex: 'headerRule',
      render: (text, record, index) =>this.renderProcessRules(index,'headerRule',text,record),
      width:'25%',
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
        <Button  onClick={this.insertRow}  type="primary"   icon='plus'  style={{marginBottom:'5px'}} >添加Header头</Button>
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

export default ApiNodeHeaderConfig;
