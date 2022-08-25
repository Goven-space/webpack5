import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Radio} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import EditSelectOne from '../../../core/components/EditSelectOne';
import EditTextArea from '../../../core/components/EditTextArea';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const ButtonGroup = Button.Group;
const RadioGroup = Radio.Group;

const headerOptListUrl=URI.NEW_SERVICE.headerOptList;
const GetHEADERPARADATA_URL=URI.SERVICE_HEADER_CONFIG.list;
const SAVEHEADERPARADATA_URL=URI.SERVICE_HEADER_CONFIG.save;

class EditApiHeadersParams extends React.Component {
  constructor(props) {
    super(props);
    this.configId = this.props.id;
    this.state = {
      curEditIndex:-1,
      newIdNum:0,
      data:[],
      HeaderOpt:[],
      HeaderData:[],
      backendHeaderParams: '',
      backendHaderTransparent: 1
    };
  }

  componentDidMount(){
    this.getHeaderParamsData()
    this.getHeaderListOpt()
  }

  getHeaderParamsData = () =>{
    AjaxUtils.get(`${GetHEADERPARADATA_URL}?configId=${this.configId}`, (data) => {
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
          const headerData = this.setData(data.backendHeaderParams)
          this.setState({
            data: headerData,
          backendHaderTransparent: data.backendHaderTransparent
        })
      }
    })
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
    let jsonStr=JSON.stringify(this.state.data);
    return jsonStr;
  }

   setData=(headerParams)=>{
    if(headerParams==='' || headerParams==undefined){
      headerParams="[]"
    }
    let jsonData=JSON.parse(headerParams);
    return jsonData.map((item,index)=>{
        item.id= AjaxUtils.guid();
        return item
    });
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  handleBackendHaderTransparentChange = (e) => {
    this.setState({
        backendHaderTransparent: e.target.value
    })
  }

  renderHeader(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    /* let data=[
      {text:"Content-Type",value:'Content-Type'},
      {text:"Authorization",value:'Authorization'},
      {text:"Connection",value:'Connection'},
      {text:"identitytoken",value:'identitytoken'},
      {text:"SOAPAction",value:'SOAPAction'}
      ]; */
    return (<EditSelect value={text} data={this.state.HeaderOpt}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='OVER'){return '覆盖(存在覆盖不存在追加)';}
      if(text==='DELETE'){return '删除(存在则删除)';}
      if(text==='COPY'){return '透传(复制传入值)';}
      if(text==='BASIC'){return 'Basic认证编码';}
      return text;
    }
    let data=[
      {value:"OVER",text:'覆盖(存在覆盖不存在追加)'},
      {value:"DELETE",text:'删除(存在则删除)'},
      {value:"COPY",text:'透传(复制传入值)'},
      {value:"BASIC",text:'Basic认证编码(格式:userId:password)'},
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
    const { data, HeaderData} = this.state;
    if(key === 'headerId' && HeaderData.find(item => item.headerId === value)) {
      let itemData = HeaderData.find(item => item.headerId === value)
      data[index] = {...data[index],...itemData}
    }else {
      data[index][key] = value
    }
    ;
    this.setState({ data });
  }

  insertRow=()=>{
    this.getHeaderListOpt()
    //新增加一行
    let key=this.state.data.length+1;
    let newRow={id:key,headerId:'',headerValue:'',/* headerType:'OVER' */};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  refresh = () => {
    this.getHeaderParamsData()
  }

  saveData = () => {
    this.setState({ curEditIndex: -1});
    const {backendHaderTransparent, data} = this.state
    let postData = { configId: this.configId, headerData: JSON.stringify({backendHaderTransparent:backendHaderTransparent,backendHeaderParams:JSON.stringify(data)}) };
    AjaxUtils.post(SAVEHEADERPARADATA_URL, postData, data => {
      if (data.state == false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo('保存成功！');
      }
    });
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: 'Header',
      dataIndex: 'headerId',
      render: (text, record, index) => this.renderHeader(index,'headerId', text),
      width:'30%',
    },{
      title: 'Header值',
      dataIndex: 'headerValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'headerValue',text,"支持变量:${$config.变量Id}"),
      width:'40%',
    },{
      title: '传递方式',
      dataIndex: 'headerType',
      render: (text, record, index) =>this.renderType(index,'headerType',text),
      width:'20%',
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
          <div style={{ paddingBottom: 5 }}>
            <ButtonGroup>
                <Button type="primary" onClick={this.saveData} icon="save"  >保存配置</Button>
                <Button onClick={this.insertRow} icon="plus"  >新增Header头</Button>
                <Button onClick={this.refresh} icon="reload"  >刷新</Button>
            </ButtonGroup>
          </div>
            <Table
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            onRowClick={this.onRowClick}
            pagination={false}
            size="small"
            />
            <div style={{marginTop:20}}>
                    <RadioGroup value={this.state.backendHaderTransparent} onChange={this.handleBackendHaderTransparentChange} defaultValue={0}>
                    <Radio value={1}>默认透传Header</Radio>
                    <Radio value={0}>否</Radio>
                    </RadioGroup>
            </div>
        </div>
      );
  }
}

export default EditApiHeadersParams;
